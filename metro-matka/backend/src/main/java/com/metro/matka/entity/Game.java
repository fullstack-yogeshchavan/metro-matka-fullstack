package com.metro.matka.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "draw_interval_seconds", nullable = false)
    @Builder.Default
    private Integer drawIntervalSeconds = 180;

    @Column(name = "betting_close_before_seconds", nullable = false)
    @Builder.Default
    private Integer bettingCloseBeforeSeconds = 30;

    @Column(name = "jackpot_multiplier", nullable = false)
    @Builder.Default
    private Integer jackpotMultiplier = 800;

    @Column(name = "partial_multiplier", nullable = false)
    @Builder.Default
    private Integer partialMultiplier = 10;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DrawMode drawMode = DrawMode.AUTO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GameStatus status = GameStatus.ACTIVE;

    @Column(name = "current_round")
    @Builder.Default
    private Integer currentRound = 1;

    @Column(name = "next_draw_at")
    private LocalDateTime nextDrawAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum DrawMode   { AUTO, MANUAL }
    public enum GameStatus { ACTIVE, PAUSED, CLOSED }
}
