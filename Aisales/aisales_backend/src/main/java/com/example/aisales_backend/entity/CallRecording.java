package com.example.aisales_backend.entity;

import jakarta.persistence.*;
import java.time.Instant;


@Entity
public class CallRecording {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String orderId;
    private String transcript; // text
    private Instant createdAt = Instant.now();


    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }


    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }


    public String getTranscript() { return transcript; }
    public void setTranscript(String transcript) { this.transcript = transcript; }


    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
