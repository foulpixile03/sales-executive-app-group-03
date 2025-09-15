package com.example.aisales_backend.controller;

import com.example.aisales_backend.dto.ContactRequest;
import com.example.aisales_backend.dto.ContactResponse;
import com.example.aisales_backend.entity.Contact;
import com.example.aisales_backend.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ContactResponse> createContact(@Valid @RequestBody ContactRequest request) {
        log.info("Creating contact: {} {}", request.getFirstName(), request.getLastName());
        ContactResponse response = contactService.createContact(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContactById(@PathVariable Long id) {
        log.info("Fetching contact by ID: {}", id);
        ContactResponse response = contactService.getContactById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<ContactResponse>> getContactsByCompanyId(@PathVariable Long companyId) {
        log.info("Fetching contacts for company ID: {}", companyId);
        List<ContactResponse> responses = contactService.getContactsByCompanyId(companyId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/company/{companyId}/active")
    public ResponseEntity<List<ContactResponse>> getActiveContactsByCompanyId(@PathVariable Long companyId) {
        log.info("Fetching active contacts for company ID: {}", companyId);
        List<ContactResponse> responses = contactService.getActiveContactsByCompanyId(companyId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/company/{companyId}/search")
    public ResponseEntity<List<ContactResponse>> searchContactsByCompanyAndName(
            @PathVariable Long companyId, 
            @RequestParam String name) {
        log.info("Searching contacts for company ID: {} with name: {}", companyId, name);
        List<ContactResponse> responses = contactService.searchContactsByCompanyAndName(companyId, name);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/company/{companyId}/department/{department}")
    public ResponseEntity<List<ContactResponse>> getContactsByCompanyAndDepartment(
            @PathVariable Long companyId, 
            @PathVariable Contact.Department department) {
        log.info("Fetching contacts for company ID: {} and department: {}", companyId, department);
        List<ContactResponse> responses = contactService.getContactsByCompanyAndDepartment(companyId, department);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(@PathVariable Long id, @Valid @RequestBody ContactRequest request) {
        log.info("Updating contact with ID: {}", id);
        ContactResponse response = contactService.updateContact(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        log.info("Deleting contact with ID: {}", id);
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}
