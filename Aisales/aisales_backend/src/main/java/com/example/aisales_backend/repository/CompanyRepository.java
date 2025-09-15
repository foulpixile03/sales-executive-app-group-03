package com.example.aisales_backend.repository;

import com.example.aisales_backend.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByCompanyNameIgnoreCase(String companyName);

    List<Company> findByType(Company.CompanyType type);

    List<Company> findByIndustry(Company.Industry industry);

    List<Company> findByStatus(Company.CompanyStatus status);

    @Query("SELECT c FROM Company c WHERE c.companyName LIKE %:name%")
    List<Company> findByCompanyNameContainingIgnoreCase(@Param("name") String name);

    @Query("SELECT c FROM Company c WHERE c.type = :type AND c.status = :status")
    List<Company> findByTypeAndStatus(@Param("type") Company.CompanyType type, 
                                     @Param("status") Company.CompanyStatus status);

    boolean existsByCompanyNameIgnoreCase(String companyName);
}
