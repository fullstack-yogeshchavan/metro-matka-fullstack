package com.metro.matka.controller;

import com.metro.matka.dto.response.*;
import com.metro.matka.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {
    private final GameService gameService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GameResponse>>> all() {
        return ResponseEntity.ok(ApiResponse.success("Games", gameService.getActiveGames()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GameResponse>> one(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Game", gameService.getGameById(id)));
    }

    @GetMapping("/{id}/active-draw")
    public ResponseEntity<ApiResponse<DrawResponse>> activeDraw(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Active draw", gameService.getActiveDraw(id)));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<DrawResponse>>> history(@PathVariable Long id, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("History", gameService.getDrawHistory(id, page, size)));
    }
}
