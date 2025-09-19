package com.example.aisales_backend.service;

import com.example.aisales_backend.dto.WorkspaceRequest;
import com.example.aisales_backend.dto.WorkspaceResponse;
import com.example.aisales_backend.entity.User;
import com.example.aisales_backend.entity.Workspace;
import com.example.aisales_backend.repository.UserRepository;
import com.example.aisales_backend.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    @Transactional
    public WorkspaceResponse createWorkspaceForAdmin(Long adminUserId, WorkspaceRequest request) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Workspace workspace = Workspace.builder()
                .companyName(request.getCompanyName())
                .industry(request.getIndustry())
                .address(request.getAddress())
                .createdBy(admin)
                .build();

        Workspace saved = workspaceRepository.save(workspace);

        // link workspace to admin user
        admin.setWorkspaceId(saved.getId());
        userRepository.save(admin);

        log.info("Workspace {} created by admin {}", saved.getId(), admin.getEmail());

        return WorkspaceResponse.builder()
                .id(saved.getId())
                .companyName(saved.getCompanyName())
                .industry(saved.getIndustry())
                .address(saved.getAddress())
                .createdBy(admin.getId())
                .build();
    }

    @Transactional
    public WorkspaceResponse createWorkspaceForAdminEmail(String adminEmail, WorkspaceRequest request) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Workspace workspace = Workspace.builder()
                .companyName(request.getCompanyName())
                .industry(request.getIndustry())
                .address(request.getAddress())
                .createdBy(admin)
                .build();

        Workspace saved = workspaceRepository.save(workspace);

        admin.setWorkspaceId(saved.getId());
        userRepository.save(admin);

        log.info("Workspace {} created by admin {}", saved.getId(), admin.getEmail());

        return WorkspaceResponse.builder()
                .id(saved.getId())
                .companyName(saved.getCompanyName())
                .industry(saved.getIndustry())
                .address(saved.getAddress())
                .createdBy(admin.getId())
                .build();
    }
}


