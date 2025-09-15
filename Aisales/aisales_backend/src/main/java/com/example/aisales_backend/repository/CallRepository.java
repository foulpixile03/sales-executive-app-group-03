package com.example.aisales_backend.repository;

import com.example.aisales_backend.entity.Call;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CallRepository extends JpaRepository<Call, Long> {

    List<Call> findByUserId(Long userId);

    List<Call> findByCompanyId(Long companyId);

    List<Call> findByContactId(Long contactId);

    List<Call> findByUserIdOrderByCallDateTimeDesc(Long userId);

    @Query("SELECT c FROM Call c WHERE c.user.id = :userId AND c.callDateTime BETWEEN :startDate AND :endDate")
    List<Call> findByUserIdAndCallDateTimeBetween(@Param("userId") Long userId, 
                                                 @Param("startDate") LocalDateTime startDate, 
                                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT c FROM Call c WHERE c.company.id = :companyId AND c.sentimentType = :sentimentType")
    List<Call> findByCompanyIdAndSentimentType(@Param("companyId") Long companyId, 
                                             @Param("sentimentType") Call.SentimentType sentimentType);

    @Query("SELECT c FROM Call c WHERE c.user.id = :userId AND c.sentimentType = :sentimentType")
    List<Call> findByUserIdAndSentimentType(@Param("userId") Long userId, 
                                          @Param("sentimentType") Call.SentimentType sentimentType);

    @Query("SELECT AVG(c.sentimentScore) FROM Call c WHERE c.company.id = :companyId")
    Double findAverageSentimentScoreByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT AVG(c.sentimentScore) FROM Call c WHERE c.user.id = :userId")
    Double findAverageSentimentScoreByUserId(@Param("userId") Long userId);
}
