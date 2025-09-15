package com.example.aisales_backend.repository;

import com.example.aisales_backend.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findByCompanyId(Long companyId);

    List<Contact> findByCompanyIdAndStatus(Long companyId, Contact.ContactStatus status);

    Optional<Contact> findByEmailIgnoreCase(String email);

    @Query("SELECT c FROM Contact c WHERE c.company.id = :companyId AND c.firstName LIKE %:name% OR c.lastName LIKE %:name%")
    List<Contact> findByCompanyIdAndNameContainingIgnoreCase(@Param("companyId") Long companyId, 
                                                           @Param("name") String name);

    @Query("SELECT c FROM Contact c WHERE c.company.id = :companyId AND c.department = :department")
    List<Contact> findByCompanyIdAndDepartment(@Param("companyId") Long companyId, 
                                             @Param("department") Contact.Department department);

    boolean existsByEmailIgnoreCase(String email);
}
