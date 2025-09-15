package com.example.aisales_backend.controller;

import com.example.aisales_backend.dto.SentimentAnalysisRequest;
import com.example.aisales_backend.dto.SentimentAnalysisResponse;
import com.example.aisales_backend.service.SentimentAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sentiment")
@RequiredArgsConstructor
@Slf4j
public class SentimentAnalysisController {

    private final SentimentAnalysisService sentimentAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<SentimentAnalysisResponse> analyzeCallSentiment(@Valid @RequestBody SentimentAnalysisRequest request) {
        log.info("Starting sentiment analysis for call ID: {}", request.getCallId());
        SentimentAnalysisResponse response = sentimentAnalysisService.analyzeCallSentiment(request);
        return ResponseEntity.ok(response);
    }
}
