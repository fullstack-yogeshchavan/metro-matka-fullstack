package com.metro.matka.service.impl;
import com.metro.matka.dto.response.*;
import com.metro.matka.entity.*;
import com.metro.matka.exception.ResourceNotFoundException;
import com.metro.matka.repository.*;
import com.metro.matka.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class GameServiceImpl implements GameService {
    private final GameRepository gameRepo;
    private final DrawRepository drawRepo;
    private final DrawServiceImpl drawSvc;
    @Override public List<GameResponse> getActiveGames() { return gameRepo.findByStatus(Game.GameStatus.ACTIVE).stream().map(this::toGameResp).toList(); }
    @Override public GameResponse getGameById(Long id) { return toGameResp(gameRepo.findById(id).orElseThrow(()-> new ResourceNotFoundException("Game not found"))); }
    @Override @Transactional public DrawResponse getActiveDraw(Long gameId) {
        Game g = gameRepo.findById(gameId).orElseThrow(() -> new ResourceNotFoundException("Game not found"));
        return toDrawResp(drawSvc.getOrCreate(g));
    }
    @Override public List<DrawResponse> getDrawHistory(Long gameId, int page, int size) {
        return drawRepo.findByGameIdOrderByRoundNumberDesc(gameId, PageRequest.of(page,size)).getContent().stream().map(this::toDrawResp).toList();
    }
    private GameResponse toGameResp(Game g) {
        return GameResponse.builder().id(g.getId()).name(g.getName()).description(g.getDescription())
                .drawIntervalSeconds(g.getDrawIntervalSeconds()).bettingCloseBeforeSeconds(g.getBettingCloseBeforeSeconds())
                .jackpotMultiplier(g.getJackpotMultiplier()).partialMultiplier(g.getPartialMultiplier())
                .drawMode(g.getDrawMode().name()).status(g.getStatus().name()).currentRound(g.getCurrentRound())
                .nextDrawAt(g.getNextDrawAt()).build();
    }
    private DrawResponse toDrawResp(Draw d) {
        long secs = d.getScheduledAt() != null ? ChronoUnit.SECONDS.between(LocalDateTime.now(), d.getScheduledAt()) : 0;
        return DrawResponse.builder().id(d.getId()).gameId(d.getGame().getId()).gameName(d.getGame().getName())
                .roundNumber(d.getRoundNumber()).resultNumber(d.getResultNumber()).status(d.getStatus().name())
                .scheduledAt(d.getScheduledAt()).drawnAt(d.getDrawnAt()).bettingClosesAt(d.getBettingClosesAt())
                .secondsUntilDraw(Math.max(0,secs)).totalBetsAmount(d.getTotalBetsAmount())
                .totalPayout(d.getTotalPayout()).houseProfit(d.getHouseProfit()).build();
    }
}
