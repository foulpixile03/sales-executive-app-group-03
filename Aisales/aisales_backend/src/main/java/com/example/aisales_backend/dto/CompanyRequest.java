package com.example.aisales_backend.dto;

import com.example.aisales_backend.entity.Company;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyRequest {

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    private String companyName;

    @NotNull(message = "Company type is required")
    private Company.CompanyType type;

    @NotNull(message = "Industry is required")
    private Company.Industry industry;

    private Company.CompanyStatus status = Company.CompanyStatus.ACTIVE;
    private Company.Priority priority = Company.Priority.MEDIUM;
}
