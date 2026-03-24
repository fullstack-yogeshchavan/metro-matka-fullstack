package com.metro.matka.service;
import com.metro.matka.dto.request.*;
import com.metro.matka.dto.response.AuthResponse;
public interface AuthService {
    AuthResponse register(RegisterRequest r);
    AuthResponse login(LoginRequest r);
    AuthResponse refreshToken(String token);
    void logout(String username);
}
