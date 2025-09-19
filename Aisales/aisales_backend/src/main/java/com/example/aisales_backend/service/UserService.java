package com.example.aisales_backend.service;

import com.example.aisales_backend.dto.LoginRequest;
import com.example.aisales_backend.dto.RegisterRequest;
import com.example.aisales_backend.dto.UserResponse;
import com.example.aisales_backend.dto.InviteUserRequest;
import com.example.aisales_backend.dto.PasswordResetRequest;
import com.example.aisales_backend.entity.Role;
import com.example.aisales_backend.entity.User;
import com.example.aisales_backend.repository.UserRepository;
import com.example.aisales_backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;

    // Getters for testing
    public UserRepository getUserRepository() {
        return userRepository;
    }

    public PasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }

    @Value("${spring.mail.username:no-reply@example.com}")
    private String fromEmail;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }

        // Determine role for first user
        boolean isFirstUser = userRepository.count() == 0;
        Role assignedRole = isFirstUser ? Role.ADMIN : Role.USER;

        // Create new user
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered: {}", savedUser.getEmail());

        return mapToUserResponse(savedUser);
    }

    public String login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Generate JWT token
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtTokenProvider.generateTokenForUser(user);
        log.info("User logged in: {}", request.getEmail());

        return token;
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void inviteUser(Long adminId, InviteUserRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }

        // Provide placeholder names to satisfy validation constraints
        User newUser = User.builder()
                .firstName("Invited")
                .lastName("Member")
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getTemporaryPassword()))
                .role(Role.USER)
                .workspaceId(admin.getWorkspaceId())
                .build();

        userRepository.save(newUser);

        // Try to send email, but don't fail the invite if email fails
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(request.getEmail());
            message.setSubject("You're invited to Vocalyx Workspace");
            message.setText("You have been invited by " + admin.getEmail() +
                    " to join their workspace.\n\n" +
                    "Temporary Password: " + request.getTemporaryPassword() + "\n" +
                    "Login at: http://localhost:5173/login\n\n" +
                    "Please change your password after first login.");
            mailSender.send(message);
            log.info("Invitation email sent to {} by admin {}", request.getEmail(), admin.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send invitation email to {}: {}", request.getEmail(), e.getMessage());
            // User is still created, just email failed
        }
    }

    @Transactional
    public void inviteUserByEmail(String adminEmail, InviteUserRequest request) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        inviteUser(admin.getId(), request);
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        log.info("Password reset attempt for email: {}", request.getEmail());
        
        // Validate password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            log.warn("Password confirmation mismatch for email: {}", request.getEmail());
            throw new RuntimeException("New password and confirm password do not match");
        }

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("User not found for email: {}", request.getEmail());
                    return new RuntimeException("User not found");
                });

        log.info("User found: {} (ID: {})", user.getEmail(), user.getId());
        log.info("Stored password hash: {}", user.getPassword());
        log.info("Provided current password: {}", request.getCurrentPassword());

        // Verify current password
        boolean passwordMatches = passwordEncoder.matches(request.getCurrentPassword(), user.getPassword());
        log.info("Password match result: {}", passwordMatches);
        
        if (!passwordMatches) {
            log.warn("Current password verification failed for user: {}", request.getEmail());
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        String newPasswordHash = passwordEncoder.encode(request.getNewPassword());
        log.info("New password hash generated: {}", newPasswordHash);
        
        user.setPassword(newPasswordHash);
        User savedUser = userRepository.save(user);
        
        log.info("Password reset successful for user: {} (ID: {})", savedUser.getEmail(), savedUser.getId());
    }
}
