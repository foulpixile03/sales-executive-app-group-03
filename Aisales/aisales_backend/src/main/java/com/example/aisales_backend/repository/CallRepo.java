package com.example.aisales_backend.repository;

import com.example.aisales_backend.entity.CallRecording;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface CallRepo extends JpaRepository<CallRecording, Long> {
    Optional<CallRecording> findTopByOrderIdOrderByCreatedAtDesc(String orderId);
}