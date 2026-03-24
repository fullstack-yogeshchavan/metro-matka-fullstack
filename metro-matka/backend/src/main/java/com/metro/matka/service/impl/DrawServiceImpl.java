package com.metro.matka.service.impl;

import com.metro.matka.dto.response.*;
import com.metro.matka.entity.*;
import com.metro.matka.exception.ResourceNotFoundException;
import com.metro.matka.repository.*;
import com.metro.matka.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DrawServiceImpl implements DrawService {
    private final GameRepository gameRepo;
    private final DrawRepository drawRepo;
    private final BetRepository betRepo;
    private final WalletService walletSvc;
    private final SimpMessagingTemplate messaging;
    private final SecureRandom rng = new SecureRandom();

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processGames() {
        gameRepo.findByStatus(Game.GameStatus.ACTIVE).forEach(g -> {
            if (g.getDrawMode() == Game.DrawMode.AUTO) {
                try {
                    tick(g);
                } catch (Exception e) {
                    log.error("Error processing game: {}", g.getId(), e);
                }
            }
        });
    }

    private void tick(Game game) {
        Draw draw = getOrCreate(game);
        long secs = ChronoUnit.SECONDS.between(LocalDateTime.now(), draw.getScheduledAt());
        if (secs <= game.getBettingCloseBeforeSeconds() && draw.getStatus() == Draw.DrawStatus.BETTING_OPEN)
            closeBetting(draw);
        if (secs <= 0 && draw.getStatus() == Draw.DrawStatus.BETTING_CLOSED) {
            executeDraw(draw);
            return;
        }
        messaging.convertAndSend("/topic/timer/" + game.getId(),
                TimerEvent.builder().gameId(game.getId()).gameName(game.getName()).drawId(draw.getId())
                        .roundNumber(draw.getRoundNumber()).secondsLeft(Math.max(0, secs))
                        .bettingOpen(draw.getStatus() == Draw.DrawStatus.BETTING_OPEN).build());
    }

    @Transactional
    public Draw getOrCreate(Game game) {
        return drawRepo.findFirstByGameAndStatusIn(game,
                        List.of(Draw.DrawStatus.BETTING_OPEN, Draw.DrawStatus.BETTING_CLOSED))
                .orElseGet(() -> {
                    LocalDateTime next = LocalDateTime.now().plusSeconds(game.getDrawIntervalSeconds());
                    return drawRepo.save(Draw.builder().game(game).roundNumber(game.getCurrentRound())
                            .status(Draw.DrawStatus.BETTING_OPEN).scheduledAt(next)
                            .bettingClosesAt(next.minusSeconds(game.getBettingCloseBeforeSeconds())).build());
                });
    }

    @Transactional
    public void closeBetting(Draw draw) {
        draw.setStatus(Draw.DrawStatus.BETTING_CLOSED);
        drawRepo.save(draw);
        messaging.convertAndSend("/topic/betting-closed/" + draw.getGame().getId(),
                Map.of("message", "Betting closed!"));
    }

    @Override
    @Transactional
    public void executeDraw(Draw draw) {
        int d1 = rng.nextInt(10), d2 = rng.nextInt(10), d3 = rng.nextInt(10);
        String result = "" + d1 + d2 + d3;
        draw.setResultDigit1(d1);
        draw.setResultDigit2(d2);
        draw.setResultDigit3(d3);
        draw.setResultNumber(result);
        draw.setStatus(Draw.DrawStatus.DRAWN);
        draw.setDrawnAt(LocalDateTime.now());
        BigDecimal payout = BigDecimal.ZERO;
        for (Bet bet : betRepo.findByDrawAndStatus(draw, Bet.BetStatus.PENDING)) payout = payout.add(settle(bet, draw));
        draw.setTotalPayout(payout);
        draw.setHouseProfit(draw.getTotalBetsAmount().subtract(payout));
        drawRepo.save(draw);
        Game game = draw.getGame();
        game.setCurrentRound(game.getCurrentRound() + 1);
        gameRepo.save(game);
        messaging.convertAndSend("/topic/result/" + game.getId(),
                DrawResultEvent.builder().gameId(game.getId()).gameName(game.getName()).drawId(draw.getId())
                        .roundNumber(draw.getRoundNumber()).result(result).digit1(d1).digit2(d2).digit3(d3)
                        .totalPayout(payout).build());
    }

    @Override
    public void executeManualDraw(Long gameId, String result, Long adminId) {
        Game game = gameRepo.findById(gameId).orElseThrow(() -> new ResourceNotFoundException("Game not found"));
        Draw draw = getOrCreate(game);
        if (draw.getStatus() == Draw.DrawStatus.BETTING_OPEN) closeBetting(draw);
        draw.setDeclaredBy(adminId);
        draw.setResultDigit1(result.charAt(0) - '0');
        draw.setResultDigit2(result.charAt(1) - '0');
        draw.setResultDigit3(result.charAt(2) - '0');
        draw.setResultNumber(result);
        draw.setStatus(Draw.DrawStatus.DRAWN);
        draw.setDrawnAt(LocalDateTime.now());
        BigDecimal payout = BigDecimal.ZERO;
        for (Bet bet : betRepo.findByDrawAndStatus(draw, Bet.BetStatus.PENDING)) payout = payout.add(settle(bet, draw));
        draw.setTotalPayout(payout);
        draw.setHouseProfit(draw.getTotalBetsAmount().subtract(payout));
        drawRepo.save(draw);
        game.setCurrentRound(game.getCurrentRound() + 1);
        gameRepo.save(game);
        messaging.convertAndSend("/topic/result/" + gameId,
                DrawResultEvent.builder().gameId(game.getId()).gameName(game.getName()).drawId(draw.getId())
                        .roundNumber(draw.getRoundNumber()).result(result)
                        .digit1(draw.getResultDigit1()).digit2(draw.getResultDigit2()).digit3(draw.getResultDigit3())
                        .totalPayout(payout).build());
    }

    private BigDecimal settle(Bet bet, Draw draw) {
        String res = draw.getResultNumber(), num = bet.getBetNumber();
        Game game = draw.getGame();
        BigDecimal payout = BigDecimal.ZERO;
        if (num.equals(res)) {
            payout = bet.getBetAmount().multiply(BigDecimal.valueOf(game.getJackpotMultiplier()));
            bet.setStatus(Bet.BetStatus.WON);
            bet.setWinType(Bet.WinType.JACKPOT);
        } else if (num.charAt(0) == res.charAt(0) || num.charAt(1) == res.charAt(1) || num.charAt(2) == res.charAt(2)) {
            payout = bet.getBetAmount().multiply(BigDecimal.valueOf(game.getPartialMultiplier()));
            bet.setStatus(Bet.BetStatus.WON);
            bet.setWinType(Bet.WinType.PARTIAL);
        } else {
            bet.setStatus(Bet.BetStatus.LOST);
        }
        bet.setPayoutAmount(payout);
        bet.setSettledAt(LocalDateTime.now());
        betRepo.save(bet);
        if (payout.compareTo(BigDecimal.ZERO) > 0) walletSvc.creditWinnings(bet.getUser(), payout, bet.getId(), draw);
        return payout;
    }
}
