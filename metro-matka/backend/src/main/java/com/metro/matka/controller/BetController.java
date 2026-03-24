package com.metro.matka.controller;

import com.metro.matka.dto.request.PlaceBetRequest;
import com.metro.matka.dto.response.*;
import com.metro.matka.entity.User;
import com.metro.matka.repository.UserRepository;
import com.metro.matka.service.BetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bets")
@RequiredArgsConstructor
public class BetController {
    private final BetService betService;
    private final UserRepository userRepo;

    @PostMapping
    public ResponseEntity<ApiResponse<List<BetResponse>>> place(@AuthenticationPrincipal UserDetails ud, @Valid @RequestBody PlaceBetRequest req) {
        User u = userRepo.findByUsername(ud.getUsername()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success("Bets placed", betService.placeBets(u.getId(), req)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BetResponse>>> my(@AuthenticationPrincipal UserDetails ud, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        User u = userRepo.findByUsername(ud.getUsername()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success("Bets", betService.getUserBets(u.getId(), page, size)));
    }
}
