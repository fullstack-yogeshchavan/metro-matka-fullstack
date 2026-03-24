package com.metro.matka.controller;

import com.metro.matka.dto.request.WithdrawalRequest;
import com.metro.matka.dto.response.*;
import com.metro.matka.entity.*;
import com.metro.matka.exception.UnauthorizedException;
import com.metro.matka.repository.UserRepository;
import com.metro.matka.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletSvc;
    private final UserRepository userRepo;


    private User getAuthenticatedUser(UserDetails ud) {
        if (ud == null) {
            throw new UnauthorizedException("Token expired or missing. Please login again.");
        }

        return userRepo.findByUsername(ud.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    @PostMapping("/deposit/create-order")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createOrder(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam BigDecimal amount
    ) {
        User u = getAuthenticatedUser(ud);
        return ResponseEntity.ok(
                ApiResponse.success("Order created", walletSvc.createDepositOrder(u.getId(), amount))
        );
    }

    @PostMapping("/deposit/verify")
    public ResponseEntity<ApiResponse<Void>> verify(@RequestBody Map<String, String> body) {
        walletSvc.verifyAndCreditDeposit(
                body.get("razorpay_order_id"),
                body.get("razorpay_payment_id"),
                body.get("razorpay_signature")
        );
        return ResponseEntity.ok(ApiResponse.success("Balance credited", null));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Void>> withdraw(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody WithdrawalRequest req
    ) {
        User u = getAuthenticatedUser(ud);
        walletSvc.requestWithdrawal(u.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal submitted", null));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<Transaction>>> txns(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        User u = getAuthenticatedUser(ud);
        return ResponseEntity.ok(
                ApiResponse.success("Transactions", walletSvc.getTransactionHistory(u.getId(), page, size))
        );
    }
}