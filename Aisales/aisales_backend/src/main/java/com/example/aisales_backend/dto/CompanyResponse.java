package com.example.aisales_backend.dto;

import com.example.aisales_backend.entity.Company;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyResponse {

    private Long id;
    private String companyName;
    private Company.CompanyType type;
    private Company.Industry industry;
    private Company.CompanyStatus status;
    private Company.Priority priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
