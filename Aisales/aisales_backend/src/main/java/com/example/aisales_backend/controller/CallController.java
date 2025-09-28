package com.example.aisales_backend.controller;

import com.example.aisales_backend.dto.CallRequest;
import com.example.aisales_backend.dto.CallResponse;
import com.example.aisales_backend.service.CallService;
import com.example.aisales_backend.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calls")
@RequiredArgsConstructor
@Slf4j
public class CallController {

    private final CallService callService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    public ResponseEntity<CallResponse> createCall(@Valid @RequestBody CallRequest request, HttpServletRequest httpRequest) {
        log.info("Creating call: {}", request.getCallTitle());
        Long userId = getCurrentUserId(httpRequest);
        CallResponse response = callService.createCall(request, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CallResponse> getCallById(@PathVariable Long id) {
        log.info("Fetching call by ID: {}", id);
        CallResponse response = callService.getCallById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    public ResponseEntity<List<CallResponse>> getCallsByUserId(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("Fetching calls for user ID: {}", userId);
        List<CallResponse> responses = callService.getCallsByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<CallResponse>> getCallsByCompanyId(@PathVariable Long companyId) {
        log.info("Fetching calls for company ID: {}", companyId);
        List<CallResponse> responses = callService.getCallsByCompanyId(companyId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/contact/{contactId}")
    public ResponseEntity<List<CallResponse>> getCallsByContactId(@PathVariable Long contactId) {
        log.info("Fetching calls for contact ID: {}", contactId);
        List<CallResponse> responses = callService.getCallsByContactId(contactId);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CallResponse> updateCall(@PathVariable Long id, @Valid @RequestBody CallRequest request) {
        log.info("Updating call with ID: {}", id);
        CallResponse response = callService.updateCall(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCall(@PathVariable Long id) {
        log.info("Deleting call with ID: {}", id);
        callService.deleteCall(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/company/{companyId}/sentiment/average")
    public ResponseEntity<Double> getAverageSentimentScoreByCompanyId(@PathVariable Long companyId) {
        log.info("Fetching average sentiment score for company ID: {}", companyId);
        Double score = callService.getAverageSentimentScoreByCompanyId(companyId);
        return ResponseEntity.ok(score);
    }

    @GetMapping("/user/sentiment/average")
    public ResponseEntity<Double> getAverageSentimentScoreByUserId(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("Fetching average sentiment score for user ID: {}", userId);
        Double score = callService.getAverageSentimentScoreByUserId(userId);
        return ResponseEntity.ok(score);
    }

    private Long getCurrentUserId(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token != null) {
            return jwtTokenProvider.extractUserId(token);
        }
        throw new RuntimeException("Unable to extract user ID from token");
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
