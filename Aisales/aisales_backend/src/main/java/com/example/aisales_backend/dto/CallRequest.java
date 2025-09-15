package com.example.aisales_backend.dto;

import com.example.aisales_backend.entity.Call;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CallRequest {

    @NotBlank(message = "Call title is required")
    @Size(min = 2, max = 200, message = "Call title must be between 2 and 200 characters")
    private String callTitle;

    @NotNull(message = "Call date and time is required")
    private LocalDateTime callDateTime;

    @NotBlank(message = "Recording file path is required")
    private String recordingFilePath;

    @NotNull(message = "Call direction is required")
    private Call.CallDirection callDirection;

    @Size(max = 1000, message = "Summary must not exceed 1000 characters")
    private String summary;

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotNull(message = "Contact ID is required")
    private Long contactId;

    private Long fileSize;
    private String fileType;
}
