package com.example.aisales_backend.service;

import com.example.aisales_backend.dto.CompanyRequest;
import com.example.aisales_backend.dto.CompanyResponse;
import com.example.aisales_backend.entity.Company;
import com.example.aisales_backend.repository.CompanyRepository;
import com.example.aisales_backend.exception.EntityNotFoundException;
import com.example.aisales_backend.exception.DuplicateEntityException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyResponse createCompany(CompanyRequest request) {
        log.info("Creating new company: {}", request.getCompanyName());

        // Check if company already exists
        if (companyRepository.existsByCompanyNameIgnoreCase(request.getCompanyName())) {
            throw new DuplicateEntityException("Company", "name", request.getCompanyName());
        }

        Company company = Company.builder()
                .companyName(request.getCompanyName())
                .type(request.getType())
                .industry(request.getIndustry())
                .status(request.getStatus())
                .priority(request.getPriority())
                .build();

        Company savedCompany = companyRepository.save(company);
        log.info("Company created successfully: {}", savedCompany.getId());

        return mapToCompanyResponse(savedCompany);
    }

    public CompanyResponse getCompanyById(Long id) {
        log.info("Fetching company by ID: {}", id);
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company", id));
        return mapToCompanyResponse(company);
    }

    public List<CompanyResponse> getAllCompanies() {
        log.info("Fetching all companies");
        return companyRepository.findAll().stream()
                .map(this::mapToCompanyResponse)
                .collect(Collectors.toList());
    }

    public List<CompanyResponse> getCompaniesByType(Company.CompanyType type) {
        log.info("Fetching companies by type: {}", type);
        return companyRepository.findByType(type).stream()
                .map(this::mapToCompanyResponse)
                .collect(Collectors.toList());
    }

    public List<CompanyResponse> getCompaniesByIndustry(Company.Industry industry) {
        log.info("Fetching companies by industry: {}", industry);
        return companyRepository.findByIndustry(industry).stream()
                .map(this::mapToCompanyResponse)
                .collect(Collectors.toList());
    }

    public List<CompanyResponse> searchCompaniesByName(String name) {
        log.info("Searching companies by name: {}", name);
        return companyRepository.findByCompanyNameContainingIgnoreCase(name).stream()
                .map(this::mapToCompanyResponse)
                .collect(Collectors.toList());
    }

    public CompanyResponse updateCompany(Long id, CompanyRequest request) {
        log.info("Updating company with ID: {}", id);
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company", id));

        // Check if new name conflicts with existing company
        if (!company.getCompanyName().equalsIgnoreCase(request.getCompanyName()) &&
            companyRepository.existsByCompanyNameIgnoreCase(request.getCompanyName())) {
            throw new DuplicateEntityException("Company", "name", request.getCompanyName());
        }

        company.setCompanyName(request.getCompanyName());
        company.setType(request.getType());
        company.setIndustry(request.getIndustry());
        company.setStatus(request.getStatus());
        company.setPriority(request.getPriority());

        Company updatedCompany = companyRepository.save(company);
        log.info("Company updated successfully: {}", updatedCompany.getId());

        return mapToCompanyResponse(updatedCompany);
    }

    public void deleteCompany(Long id) {
        log.info("Deleting company with ID: {}", id);
        if (!companyRepository.existsById(id)) {
            throw new EntityNotFoundException("Company", id);
        }
        companyRepository.deleteById(id);
        log.info("Company deleted successfully: {}", id);
    }

    private CompanyResponse mapToCompanyResponse(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .companyName(company.getCompanyName())
                .type(company.getType())
                .industry(company.getIndustry())
                .status(company.getStatus())
                .priority(company.getPriority())
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }
}
