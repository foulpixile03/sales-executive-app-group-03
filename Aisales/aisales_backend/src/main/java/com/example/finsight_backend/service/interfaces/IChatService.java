package com.example.finsight_backend.service.interfaces;


import com.example.finsight_backend.dto.chat.ChatRequestDto;
import com.example.finsight_backend.dto.chat.ChatResponseDto;

public interface IChatService {
    ChatResponseDto ask(String orderId, ChatRequestDto request);
}