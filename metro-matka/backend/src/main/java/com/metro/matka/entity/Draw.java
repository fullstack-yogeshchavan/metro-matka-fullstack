package com.metro.matka.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "draws")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Draw {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Column(name = "result_digit1") private Integer resultDigit1;
    @Column(name = "result_digit2") private Integer resultDigit2;
    @Column(name = "result_digit3") private Integer resultDigit3;

    @Column(name = "result_number", length = 3)
    private String resultNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DrawStatus status = DrawStatus.PENDING;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "drawn_at")
    private LocalDateTime drawnAt;

    @Column(name = "betting_closes_at")
    private LocalDateTime bettingClosesAt;

    @Column(name = "total_bets_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalBetsAmount = BigDecimal.ZERO;

    @Column(name = "total_payout", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalPayout = BigDecimal.ZERO;

    @Column(name = "house_profit", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal houseProfit = BigDecimal.ZERO;

    @Column(name = "declared_by")
    private Long declaredBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum DrawStatus {
        PENDING, BETTING_OPEN, BETTING_CLOSED, DRAWN, CANCELLED
    }
}
