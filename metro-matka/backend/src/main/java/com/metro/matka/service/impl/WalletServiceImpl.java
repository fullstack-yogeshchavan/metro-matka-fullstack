package com.metro.matka.service.impl;
import com.metro.matka.dto.request.WithdrawalRequest;
import com.metro.matka.dto.response.PaymentOrderResponse;
import com.metro.matka.entity.*;
import com.metro.matka.exception.*;
import com.metro.matka.repository.*;
import com.metro.matka.service.WalletService;
import com.razorpay.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
@Service @RequiredArgsConstructor @Slf4j @Transactional
public class WalletServiceImpl implements WalletService {
    private final UserRepository userRepo;
    private final TransactionRepository txnRepo;
    @Value("${razorpay.key-id}")   private String keyId;
    @Value("${razorpay.key-secret}") private String keySecret;
    @Value("${razorpay.currency}") private String currency;
    @Value("${game.wallet.min-deposit}") private BigDecimal minDeposit;
    @Value("${game.wallet.max-deposit}") private BigDecimal maxDeposit;

    @Override public PaymentOrderResponse createDepositOrder(Long userId, BigDecimal amount) {
        if (amount.compareTo(minDeposit) < 0) throw new BadRequestException("Min deposit ₹" + minDeposit);
        if (amount.compareTo(maxDeposit) > 0) throw new BadRequestException("Max deposit ₹" + maxDeposit);
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        try {
            RazorpayClient rzp = new RazorpayClient(keyId, keySecret);
            JSONObject req = new JSONObject();
            req.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());
            req.put("currency", currency);
            req.put("receipt", "rcpt_" + UUID.randomUUID().toString().substring(0,8));
            Order order = rzp.orders.create(req);
            String orderId = order.get("id");
            txnRepo.save(Transaction.builder().user(user).type(Transaction.TransactionType.DEPOSIT)
                    .amount(amount).balanceBefore(user.getBalance())
                    .status(Transaction.TransactionStatus.PENDING).paymentOrderId(orderId)
                    .description("Wallet deposit via Razorpay").build());
            return PaymentOrderResponse.builder().orderId(orderId).amount(amount).currency(currency)
                    .keyId(keyId).userName(user.getUsername()).userEmail(user.getEmail()).build();
        } catch (RazorpayException e) { throw new BadRequestException("Payment error: " + e.getMessage()); }
    }

    @Override public void verifyAndCreditDeposit(String orderId, String paymentId, String signature) {
        Transaction txn = txnRepo.findByPaymentOrderId(orderId)
                .orElseThrow(() -> new BadRequestException("Transaction not found"));
        User user = txn.getUser();
        BigDecimal newBal = user.getBalance().add(txn.getAmount());
        user.setBalance(newBal);
        userRepo.save(user);
        txn.setStatus(Transaction.TransactionStatus.COMPLETED);
        txn.setPaymentId(paymentId); txn.setBalanceAfter(newBal); txn.setCompletedAt(LocalDateTime.now());
        txnRepo.save(txn);
    }

    @Override public void handleWebhook(String payload, String signature) { log.info("Razorpay webhook received"); }

    @Override public void deductBetAmount(User user, BigDecimal amount, Long betId) {
        if (user.getBalance().compareTo(amount) < 0) throw new BadRequestException("Insufficient balance");
        BigDecimal before = user.getBalance();
        user.setBalance(before.subtract(amount));
        user.setTotalWagered(user.getTotalWagered().add(amount));
        userRepo.save(user);
        txnRepo.save(Transaction.builder().user(user).type(Transaction.TransactionType.BET_PLACED)
                .amount(amount.negate()).balanceBefore(before).balanceAfter(user.getBalance())
                .status(Transaction.TransactionStatus.COMPLETED).betId(betId)
                .description("Bet placed").completedAt(LocalDateTime.now()).build());
    }

    @Override public void creditWinnings(User user, BigDecimal amount, Long betId, Draw draw) {
        BigDecimal before = user.getBalance();
        user.setBalance(before.add(amount));
        user.setTotalWon(user.getTotalWon().add(amount));
        userRepo.save(user);
        txnRepo.save(Transaction.builder().user(user).type(Transaction.TransactionType.BET_WIN)
                .amount(amount).balanceBefore(before).balanceAfter(user.getBalance())
                .status(Transaction.TransactionStatus.COMPLETED).betId(betId)
                .description("Win R#" + draw.getRoundNumber()).completedAt(LocalDateTime.now()).build());
    }

    @Override public void requestWithdrawal(Long userId, WithdrawalRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getBalance().compareTo(req.getAmount()) < 0) throw new BadRequestException("Insufficient balance");
        BigDecimal before = user.getBalance();
        user.setBalance(before.subtract(req.getAmount())); userRepo.save(user);
        txnRepo.save(Transaction.builder().user(user).type(Transaction.TransactionType.WITHDRAWAL)
                .amount(req.getAmount().negate()).balanceBefore(before).balanceAfter(user.getBalance())
                .status(Transaction.TransactionStatus.PENDING)
                .description("Withdrawal to " + req.getAccountNumber()).build());
    }

    @Override @Transactional(readOnly=true)
    public List<Transaction> getTransactionHistory(Long userId, int page, int size) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return txnRepo.findByUserOrderByCreatedAtDesc(user, PageRequest.of(page,size)).getContent();
    }
}
