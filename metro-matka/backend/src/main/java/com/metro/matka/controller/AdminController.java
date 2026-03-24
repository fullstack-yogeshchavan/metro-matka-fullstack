package com.metro.matka.controller;

import com.metro.matka.dto.request.GameRequest;
import com.metro.matka.dto.response.*;
import com.metro.matka.entity.User;
import com.metro.matka.repository.UserRepository;
import com.metro.matka.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminController {
    private final AdminService adminSvc;
    private final DrawService drawSvc;
    private final UserRepository userRepo;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserAdminResponse>>> users(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Users", adminSvc.getAllUsers(page, size)));
    }

    @PatchMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse<Void>> block(@PathVariable Long id) {
        adminSvc.blockUser(id);
        return ResponseEntity.ok(ApiResponse.success("Blocked", null));
    }

    @PatchMapping("/users/{id}/unblock")
    public ResponseEntity<ApiResponse<Void>> unblock(@PathVariable Long id) {
        adminSvc.unblockUser(id);
        return ResponseEntity.ok(ApiResponse.success("Unblocked", null));
    }

    @PostMapping("/games")
    public ResponseEntity<ApiResponse<GameResponse>> create(@Valid @RequestBody GameRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Created", adminSvc.createGame(req)));
    }

    @PatchMapping("/games/{id}")
    public ResponseEntity<ApiResponse<GameResponse>> update(@PathVariable Long id, @RequestBody GameRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Updated", adminSvc.updateGame(id, req)));
    }

    @PostMapping("/games/{id}/draw/manual")
    public ResponseEntity<ApiResponse<Void>> manualDraw(@PathVariable Long id, @RequestBody Map<String, String> body, @AuthenticationPrincipal UserDetails ud) {
        User admin = userRepo.findByUsername(ud.getUsername()).orElseThrow();
        drawSvc.executeManualDraw(id, body.get("result"), admin.getId());
        return ResponseEntity.ok(ApiResponse.success("Draw executed", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> stats() {
        return ResponseEntity.ok(ApiResponse.success("Stats", adminSvc.getPlatformStats()));
    }

    @GetMapping("/bets")
    public ResponseEntity<ApiResponse<List<BetResponse>>> bets(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success("Bets", adminSvc.getAllBets(page, size)));
    }
}
