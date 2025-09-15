package com.example.aisales_backend.service;

import com.example.aisales_backend.dto.SentimentAnalysisRequest;
import com.example.aisales_backend.dto.SentimentAnalysisResponse;
import com.example.aisales_backend.entity.Call;
import com.example.aisales_backend.repository.CallRepository;
import com.example.aisales_backend.exception.EntityNotFoundException;
import com.example.aisales_backend.exception.SentimentAnalysisException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SentimentAnalysisService {

    private final CallRepository callRepository;

    public SentimentAnalysisResponse analyzeCallSentiment(SentimentAnalysisRequest request) {
        log.info("Starting sentiment analysis for call ID: {}", request.getCallId());

        Call call = callRepository.findById(request.getCallId())
                .orElseThrow(() -> new EntityNotFoundException("Call", request.getCallId()));

        try {
            // Simulate audio transcription and sentiment analysis
            // In a real implementation, you would integrate with services like:
            // - Google Cloud Speech-to-Text for transcription
            // - Google Cloud Natural Language API for sentiment analysis
            // - AWS Transcribe and Comprehend
            // - Azure Speech Services and Text Analytics

            String transcript = transcribeAudio(call.getRecordingFilePath());
            SentimentResult sentimentResult = analyzeSentiment(transcript);

            // Update call with analysis results
            call.setTranscript(transcript);
            call.setSentimentScore(sentimentResult.score);
            call.setSentimentType(sentimentResult.type);
            call.setSentimentAnalysis(sentimentResult.analysis);

            callRepository.save(call);

            log.info("Sentiment analysis completed for call ID: {}", request.getCallId());

            return SentimentAnalysisResponse.builder()
                    .callId(call.getId())
                    .transcript(transcript)
                    .sentimentScore(sentimentResult.score)
                    .sentimentType(sentimentResult.type)
                    .sentimentAnalysis(sentimentResult.analysis)
                    .status("SUCCESS")
                    .message("Sentiment analysis completed successfully")
                    .build();

        } catch (Exception e) {
            log.error("Error during sentiment analysis for call ID: {}", request.getCallId(), e);
            throw new SentimentAnalysisException("Failed to analyze sentiment: " + e.getMessage(), e);
        }
    }

    private String transcribeAudio(String filePath) {
        log.info("Transcribing audio file: {}", filePath);
        
        // Simulate transcription delay
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Check if file exists
        File file = new File(filePath);
        if (!file.exists()) {
            throw new RuntimeException("Audio file not found: " + filePath);
        }

        // Simulate transcription result
        // In a real implementation, you would call a transcription service here
        return "This is a simulated transcript of the call. The customer expressed satisfaction with our product " +
               "and mentioned they would like to continue working with us. They had some concerns about pricing " +
               "but overall seemed positive about the partnership opportunity.";
    }

    private SentimentResult analyzeSentiment(String transcript) {
        log.info("Analyzing sentiment for transcript length: {}", transcript.length());

        // Simulate sentiment analysis
        // In a real implementation, you would call a sentiment analysis service here
        Random random = new Random();
        double score = random.nextDouble() * 2 - 1; // Score between -1 and 1

        Call.SentimentType type;
        String analysis;

        if (score >= 0.6) {
            type = Call.SentimentType.VERY_POSITIVE;
            analysis = "The conversation shows very positive sentiment. The customer expressed strong satisfaction " +
                     "and enthusiasm about the product/service. Key positive indicators include: high satisfaction " +
                     "mentions, willingness to continue partnership, and positive language throughout.";
        } else if (score >= 0.2) {
            type = Call.SentimentType.POSITIVE;
            analysis = "The conversation shows positive sentiment overall. The customer seems satisfied with the " +
                     "interaction and shows interest in moving forward. Some minor concerns were mentioned but " +
                     "did not overshadow the positive tone.";
        } else if (score >= -0.2) {
            type = Call.SentimentType.NEUTRAL;
            analysis = "The conversation shows neutral sentiment. The customer maintained a professional tone " +
                     "throughout without strong positive or negative indicators. The discussion was factual " +
                     "and business-focused.";
        } else if (score >= -0.6) {
            type = Call.SentimentType.NEGATIVE;
            analysis = "The conversation shows negative sentiment. The customer expressed concerns or dissatisfaction " +
                     "with certain aspects. Key negative indicators include: complaints, concerns about pricing, " +
                     "or hesitation about the partnership.";
        } else {
            type = Call.SentimentType.VERY_NEGATIVE;
            analysis = "The conversation shows very negative sentiment. The customer expressed strong dissatisfaction " +
                     "or frustration. Key negative indicators include: multiple complaints, strong negative language, " +
                     "or clear indication of not wanting to proceed.";
        }

        return new SentimentResult(score, type, analysis);
    }

    private static class SentimentResult {
        final double score;
        final Call.SentimentType type;
        final String analysis;

        SentimentResult(double score, Call.SentimentType type, String analysis) {
            this.score = score;
            this.type = type;
            this.analysis = analysis;
        }
    }
}
