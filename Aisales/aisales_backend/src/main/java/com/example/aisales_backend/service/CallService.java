package com.example.aisales_backend.service;

import com.example.aisales_backend.dto.CallRequest;
import com.example.aisales_backend.dto.CallResponse;
import com.example.aisales_backend.entity.Call;
import com.example.aisales_backend.entity.Company;
import com.example.aisales_backend.entity.Contact;
import com.example.aisales_backend.entity.User;
import com.example.aisales_backend.repository.CallRepository;
import com.example.aisales_backend.repository.CompanyRepository;
import com.example.aisales_backend.repository.ContactRepository;
import com.example.aisales_backend.repository.UserRepository;
import com.example.aisales_backend.exception.EntityNotFoundException;
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
public class CallService {

    private final CallRepository callRepository;
    private final CompanyRepository companyRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    public CallResponse createCall(CallRequest request, Long userId) {
        log.info("Creating new call: {}", request.getCallTitle());

        // Verify company exists
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Company", request.getCompanyId()));

        // Verify contact exists and belongs to the company
        Contact contact = contactRepository.findById(request.getContactId())
                .orElseThrow(() -> new EntityNotFoundException("Contact", request.getContactId()));

        if (!contact.getCompany().getId().equals(request.getCompanyId())) {
            throw new RuntimeException("Contact does not belong to the specified company");
        }

        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        Call call = Call.builder()
                .callTitle(request.getCallTitle())
                .callDateTime(request.getCallDateTime())
                .recordingFilePath(request.getRecordingFilePath())
                .callDirection(request.getCallDirection())
                .summary(request.getSummary())
                .fileSize(request.getFileSize())
                .fileType(request.getFileType())
                .company(company)
                .contact(contact)
                .user(user)
                .build();

        Call savedCall = callRepository.save(call);
        log.info("Call created successfully: {}", savedCall.getId());

        return mapToCallResponse(savedCall);
    }

    public CallResponse getCallById(Long id) {
        log.info("Fetching call by ID: {}", id);
        Call call = callRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Call", id));
        return mapToCallResponse(call);
    }

    public List<CallResponse> getCallsByUserId(Long userId) {
        log.info("Fetching calls for user ID: {}", userId);
        return callRepository.findByUserIdOrderByCallDateTimeDesc(userId).stream()
                .map(this::mapToCallResponse)
                .collect(Collectors.toList());
    }

    public List<CallResponse> getCallsByCompanyId(Long companyId) {
        log.info("Fetching calls for company ID: {}", companyId);
        return callRepository.findByCompanyId(companyId).stream()
                .map(this::mapToCallResponse)
                .collect(Collectors.toList());
    }

    public List<CallResponse> getCallsByContactId(Long contactId) {
        log.info("Fetching calls for contact ID: {}", contactId);
        return callRepository.findByContactId(contactId).stream()
                .map(this::mapToCallResponse)
                .collect(Collectors.toList());
    }

    public CallResponse updateCall(Long id, CallRequest request) {
        log.info("Updating call with ID: {}", id);
        Call call = callRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Call", id));

        // Verify company exists
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Company", request.getCompanyId()));

        // Verify contact exists and belongs to the company
        Contact contact = contactRepository.findById(request.getContactId())
                .orElseThrow(() -> new EntityNotFoundException("Contact", request.getContactId()));

        if (!contact.getCompany().getId().equals(request.getCompanyId())) {
            throw new RuntimeException("Contact does not belong to the specified company");
        }

        call.setCallTitle(request.getCallTitle());
        call.setCallDateTime(request.getCallDateTime());
        call.setRecordingFilePath(request.getRecordingFilePath());
        call.setCallDirection(request.getCallDirection());
        call.setSummary(request.getSummary());
        call.setFileSize(request.getFileSize());
        call.setFileType(request.getFileType());
        call.setCompany(company);
        call.setContact(contact);

        Call updatedCall = callRepository.save(call);
        log.info("Call updated successfully: {}", updatedCall.getId());

        return mapToCallResponse(updatedCall);
    }

    public void deleteCall(Long id) {
        log.info("Deleting call with ID: {}", id);
        if (!callRepository.existsById(id)) {
            throw new EntityNotFoundException("Call", id);
        }
        callRepository.deleteById(id);
        log.info("Call deleted successfully: {}", id);
    }

    public Double getAverageSentimentScoreByCompanyId(Long companyId) {
        log.info("Fetching average sentiment score for company ID: {}", companyId);
        Double score = callRepository.findAverageSentimentScoreByCompanyId(companyId);
        return score != null ? score : 0.0;
    }

    public Double getAverageSentimentScoreByUserId(Long userId) {
        log.info("Fetching average sentiment score for user ID: {}", userId);
        Double score = callRepository.findAverageSentimentScoreByUserId(userId);
        return score != null ? score : 0.0;
    }

    private CallResponse mapToCallResponse(Call call) {
        return CallResponse.builder()
                .id(call.getId())
                .callTitle(call.getCallTitle())
                .callDateTime(call.getCallDateTime())
                .recordingFilePath(call.getRecordingFilePath())
                .callDirection(call.getCallDirection())
                .summary(call.getSummary())
                .transcript(call.getTranscript())
                .sentimentScore(call.getSentimentScore())
                .sentimentType(call.getSentimentType())
                .sentimentAnalysis(call.getSentimentAnalysis())
                .fileSize(call.getFileSize())
                .fileType(call.getFileType())
                .companyId(call.getCompany().getId())
                .companyName(call.getCompany().getCompanyName())
                .contactId(call.getContact().getId())
                .contactName(call.getContact().getFirstName() + " " + call.getContact().getLastName())
                .userId(call.getUser().getId())
                .userName(call.getUser().getFirstName() + " " + call.getUser().getLastName())
                .createdAt(call.getCreatedAt())
                .updatedAt(call.getUpdatedAt())
                .build();
    }
}
