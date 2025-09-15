package com.example.aisales_backend.dto;

import com.example.aisales_backend.entity.Call;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CallResponse {

    private Long id;
    private String callTitle;
    private LocalDateTime callDateTime;
    private String recordingFilePath;
    private Call.CallDirection callDirection;
    private String summary;
    private String transcript;
    private Double sentimentScore;
    private Call.SentimentType sentimentType;
    private String sentimentAnalysis;
    private Long fileSize;
    private String fileType;
    private Long companyId;
    private String companyName;
    private Long contactId;
    private String contactName;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
