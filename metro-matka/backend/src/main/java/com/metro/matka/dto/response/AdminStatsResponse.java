package com.metro.matka.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private Long totalUsers, activeUsers, blockedUsers, totalBets, totalDraws, pendingWithdrawals;
    private BigDecimal totalWagered, totalPaidOut, houseProfit, pendingWithdrawalAmount;
}
