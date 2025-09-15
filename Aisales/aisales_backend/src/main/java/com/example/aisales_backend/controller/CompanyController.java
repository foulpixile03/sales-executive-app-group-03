package com.example.aisales_backend.controller;

import com.example.aisales_backend.dto.CompanyRequest;
import com.example.aisales_backend.dto.CompanyResponse;
import com.example.aisales_backend.entity.Company;
import com.example.aisales_backend.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Slf4j
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<CompanyResponse> createCompany(@Valid @RequestBody CompanyRequest request) {
        log.info("Creating company: {}", request.getCompanyName());
        CompanyResponse response = companyService.createCompany(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable Long id) {
        log.info("Fetching company by ID: {}", id);
        CompanyResponse response = companyService.getCompanyById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAllCompanies() {
        log.info("Fetching all companies");
        List<CompanyResponse> responses = companyService.getAllCompanies();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<CompanyResponse>> getCompaniesByType(@PathVariable Company.CompanyType type) {
        log.info("Fetching companies by type: {}", type);
        List<CompanyResponse> responses = companyService.getCompaniesByType(type);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/industry/{industry}")
    public ResponseEntity<List<CompanyResponse>> getCompaniesByIndustry(@PathVariable Company.Industry industry) {
        log.info("Fetching companies by industry: {}", industry);
        List<CompanyResponse> responses = companyService.getCompaniesByIndustry(industry);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/search")
    public ResponseEntity<List<CompanyResponse>> searchCompaniesByName(@RequestParam String name) {
        log.info("Searching companies by name: {}", name);
        List<CompanyResponse> responses = companyService.searchCompaniesByName(name);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> updateCompany(@PathVariable Long id, @Valid @RequestBody CompanyRequest request) {
        log.info("Updating company with ID: {}", id);
        CompanyResponse response = companyService.updateCompany(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        log.info("Deleting company with ID: {}", id);
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
