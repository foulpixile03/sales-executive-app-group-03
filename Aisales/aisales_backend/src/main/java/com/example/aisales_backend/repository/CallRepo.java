package com.example.aisales_backend.repository;

import com.example.aisales_backend.entity.CallRecording;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CallRepo extends JpaRepository<CallRecording, Long> {
    // Change from findTopByOrder_OrderIdOrderByCreatedAtDesc to findTopByOrder_IdOrderByCreatedAtDesc
    Optional<CallRecording> findTopByOrder_IdOrderByCreatedAtDesc(Long orderId);

    @Query("SELECT c FROM CallRecording c JOIN FETCH c.contact JOIN FETCH c.order ORDER BY c.callDateTime DESC")
    List<CallRecording> findAllWithContactOrderByCallDateTimeDesc();
    
    @Query("SELECT c FROM CallRecording c JOIN FETCH c.order WHERE c.id = :callId")
    Optional<CallRecording> findByIdWithOrder(@Param("callId") Long callId);
}