package com.metro.matka.controller;

import com.metro.matka.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentWebhookController {
    private final WalletService walletSvc;

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody String payload, @RequestHeader(value = "X-Razorpay-Signature", required = false) String sig) {
        walletSvc.handleWebhook(payload, sig);
        return ResponseEntity.ok("OK");
    }
}
