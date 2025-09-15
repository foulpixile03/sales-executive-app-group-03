package com.example.aisales_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "calls")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Call {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Call title is required")
    @Size(min = 2, max = 200, message = "Call title must be between 2 and 200 characters")
    @Column(name = "call_title", nullable = false)
    private String callTitle;

    @Column(name = "call_date_time", nullable = false)
    private LocalDateTime callDateTime;

    @NotBlank(message = "Recording file path is required")
    @Column(name = "recording_file_path", nullable = false)
    private String recordingFilePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "call_direction", nullable = false)
    private CallDirection callDirection;

    @Size(max = 1000, message = "Summary must not exceed 1000 characters")
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "transcript", columnDefinition = "TEXT")
    private String transcript;

    @Column(name = "sentiment_score")
    private Double sentimentScore;

    @Enumerated(EnumType.STRING)
    private SentimentType sentimentType;

    @Size(max = 2000, message = "Sentiment analysis must not exceed 2000 characters")
    @Column(name = "sentiment_analysis", columnDefinition = "TEXT")
    private String sentimentAnalysis;

    @Column(name = "file_size")
    private Long fileSize;

    @Size(max = 50, message = "File type must not exceed 50 characters")
    @Column(name = "file_type")
    private String fileType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CallDirection {
        OUTGOING, INCOMING
    }

    public enum SentimentType {
        VERY_POSITIVE, POSITIVE, NEUTRAL, NEGATIVE, VERY_NEGATIVE
    }
}
