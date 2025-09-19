package com.example.aisales_backend.controller;

import com.example.aisales_backend.dto.LoginRequest;
import com.example.aisales_backend.dto.RegisterRequest;
import com.example.aisales_backend.dto.UserResponse;
import com.example.aisales_backend.dto.InviteUserRequest;
import com.example.aisales_backend.dto.PasswordResetRequest;
import com.example.aisales_backend.dto.TestPasswordRequest;
import com.example.aisales_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    //User Register
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request received for email: {}", request.getEmail());
        UserResponse response = userService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //User Login
    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        String token = userService.login(request);
        return ResponseEntity.ok(token);
    }

    // Invite User (Admin-only)
    @PostMapping("/invite")
    public ResponseEntity<Void> inviteUser(Authentication authentication, @Valid @RequestBody InviteUserRequest request) {
        String adminEmail = authentication.getName();
        userService.inviteUserByEmail(adminEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    // Test password verification (for debugging)
    @PostMapping("/test-password")
    public ResponseEntity<String> testPassword(@RequestBody TestPasswordRequest request) {
        try {
            var user = userService.getUserRepository().findByEmail(request.getEmail());
            if (user.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            boolean matches = userService.getPasswordEncoder().matches(request.getPassword(), user.get().getPassword());
            return ResponseEntity.ok("Password match: " + matches + 
                " | Stored hash: " + user.get().getPassword() + 
                " | Provided: " + request.getPassword());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("User service is running");
    }
}
