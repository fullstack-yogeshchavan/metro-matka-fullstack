package com.metro.matka.service;
import com.metro.matka.dto.request.WithdrawalRequest;
import com.metro.matka.dto.response.PaymentOrderResponse;
import com.metro.matka.entity.*;
import java.math.BigDecimal;
import java.util.List;
public interface WalletService {
    PaymentOrderResponse createDepositOrder(Long userId, BigDecimal amount);
    void verifyAndCreditDeposit(String orderId, String paymentId, String signature);
    void handleWebhook(String payload, String signature);
    void deductBetAmount(User user, BigDecimal amount, Long betId);
    void creditWinnings(User user, BigDecimal amount, Long betId, Draw draw);
    void requestWithdrawal(Long userId, WithdrawalRequest r);
    List<Transaction> getTransactionHistory(Long userId, int page, int size);
}
