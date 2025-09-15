package com.example.aisales_backend.service;

import com.example.aisales_backend.dto.ContactRequest;
import com.example.aisales_backend.dto.ContactResponse;
import com.example.aisales_backend.entity.Contact;
import com.example.aisales_backend.entity.Company;
import com.example.aisales_backend.repository.ContactRepository;
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
public class ContactService {

    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;

    public ContactResponse createContact(ContactRequest request) {
        log.info("Creating new contact: {} {}", request.getFirstName(), request.getLastName());

        // Verify company exists
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Company", request.getCompanyId()));

        // Check if email already exists (if provided)
        if (request.getEmail() != null && !request.getEmail().isEmpty() &&
            contactRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new DuplicateEntityException("Contact", "email", request.getEmail());
        }

        Contact contact = Contact.builder()
                .salutation(request.getSalutation())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .jobTitle(request.getJobTitle())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .status(request.getStatus())
                .company(company)
                .build();

        Contact savedContact = contactRepository.save(contact);
        log.info("Contact created successfully: {}", savedContact.getId());

        return mapToContactResponse(savedContact);
    }

    public ContactResponse getContactById(Long id) {
        log.info("Fetching contact by ID: {}", id);
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contact", id));
        return mapToContactResponse(contact);
    }

    public List<ContactResponse> getContactsByCompanyId(Long companyId) {
        log.info("Fetching contacts for company ID: {}", companyId);
        return contactRepository.findByCompanyId(companyId).stream()
                .map(this::mapToContactResponse)
                .collect(Collectors.toList());
    }

    public List<ContactResponse> getActiveContactsByCompanyId(Long companyId) {
        log.info("Fetching active contacts for company ID: {}", companyId);
        return contactRepository.findByCompanyIdAndStatus(companyId, Contact.ContactStatus.ACTIVE).stream()
                .map(this::mapToContactResponse)
                .collect(Collectors.toList());
    }

    public List<ContactResponse> searchContactsByCompanyAndName(Long companyId, String name) {
        log.info("Searching contacts for company ID: {} with name: {}", companyId, name);
        return contactRepository.findByCompanyIdAndNameContainingIgnoreCase(companyId, name).stream()
                .map(this::mapToContactResponse)
                .collect(Collectors.toList());
    }

    public List<ContactResponse> getContactsByCompanyAndDepartment(Long companyId, Contact.Department department) {
        log.info("Fetching contacts for company ID: {} and department: {}", companyId, department);
        return contactRepository.findByCompanyIdAndDepartment(companyId, department).stream()
                .map(this::mapToContactResponse)
                .collect(Collectors.toList());
    }

    public ContactResponse updateContact(Long id, ContactRequest request) {
        log.info("Updating contact with ID: {}", id);
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contact", id));

        // Verify company exists
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Company", request.getCompanyId()));

        // Check if email already exists (if provided and different from current)
        if (request.getEmail() != null && !request.getEmail().isEmpty() &&
            !request.getEmail().equalsIgnoreCase(contact.getEmail()) &&
            contactRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new DuplicateEntityException("Contact", "email", request.getEmail());
        }

        contact.setSalutation(request.getSalutation());
        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setJobTitle(request.getJobTitle());
        contact.setEmail(request.getEmail());
        contact.setPhoneNumber(request.getPhoneNumber());
        contact.setDepartment(request.getDepartment());
        contact.setStatus(request.getStatus());
        contact.setCompany(company);

        Contact updatedContact = contactRepository.save(contact);
        log.info("Contact updated successfully: {}", updatedContact.getId());

        return mapToContactResponse(updatedContact);
    }

    public void deleteContact(Long id) {
        log.info("Deleting contact with ID: {}", id);
        if (!contactRepository.existsById(id)) {
            throw new EntityNotFoundException("Contact", id);
        }
        contactRepository.deleteById(id);
        log.info("Contact deleted successfully: {}", id);
    }

    private ContactResponse mapToContactResponse(Contact contact) {
        return ContactResponse.builder()
                .id(contact.getId())
                .salutation(contact.getSalutation())
                .firstName(contact.getFirstName())
                .lastName(contact.getLastName())
                .jobTitle(contact.getJobTitle())
                .email(contact.getEmail())
                .phoneNumber(contact.getPhoneNumber())
                .department(contact.getDepartment())
                .status(contact.getStatus())
                .companyId(contact.getCompany().getId())
                .companyName(contact.getCompany().getCompanyName())
                .createdAt(contact.getCreatedAt())
                .updatedAt(contact.getUpdatedAt())
                .build();
    }
}
