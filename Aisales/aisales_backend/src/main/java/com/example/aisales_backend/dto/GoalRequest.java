package com.example.aisales_backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class GoalRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String description;
    @NotNull
    @PositiveOrZero
    private Double targetRevenue;
    @PositiveOrZero
    private Double currentProgress;
    @NotNull
    private LocalDate deadline;
    @NotBlank
    private String company;
    @NotBlank
    private String priority;

    public GoalRequest() {}

    public GoalRequest(String name, String description, Double targetRevenue,
                       Double currentProgress, LocalDate deadline, String company, String priority) {
        this.name = name;
        this.description = description;
        this.targetRevenue = targetRevenue;
        this.currentProgress = currentProgress;
        this.deadline = deadline;
        this.company = company;
        this.priority = priority;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getTargetRevenue() { return targetRevenue; }
    public void setTargetRevenue(Double targetRevenue) { this.targetRevenue = targetRevenue; }

    public Double getCurrentProgress() { return currentProgress; }
    public void setCurrentProgress(Double currentProgress) { this.currentProgress = currentProgress; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}


