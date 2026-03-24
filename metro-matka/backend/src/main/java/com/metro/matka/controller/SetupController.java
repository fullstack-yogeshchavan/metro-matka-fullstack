package com.metro.matka.controller;

import com.metro.matka.config.DataInitializer;
import com.metro.matka.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * Open endpoint (no auth needed) to reset/verify credentials.
 * Use if login fails: GET http://localhost:8080/api/setup/reset
 */
@RestController
@RequestMapping("/setup")
@RequiredArgsConstructor
@Slf4j
public class SetupController {

    private final DataInitializer dataInitializer;

    /**
     * Resets admin and player passwords.
     * Call this from browser if login fails:
     * http://localhost:8080/api/setup/reset
     */
    @GetMapping("/reset")
    public ApiResponse<String> reset() {
        try {
            dataInitializer.run();
            return ApiResponse.success(
                "Passwords reset! Use: admin/admin123 or player1/player123",
                "OK"
            );
        } catch (Exception e) {
            log.error("Reset failed", e);
            return ApiResponse.error("Reset failed: " + e.getMessage());
        }
    }

    @GetMapping("/ping")
    public ApiResponse<String> ping() {
        return ApiResponse.success("Server running. Login: admin/admin123", "OK");
    }
}
