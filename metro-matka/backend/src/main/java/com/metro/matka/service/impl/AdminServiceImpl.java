package com.metro.matka.service.impl;

import com.metro.matka.dto.request.GameRequest;
import com.metro.matka.dto.response.*;
import com.metro.matka.entity.*;
import com.metro.matka.exception.*;
import com.metro.matka.repository.*;
import com.metro.matka.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepo;
    private final GameRepository gameRepo;
    private final BetRepository betRepo;
    private final TransactionRepository txnRepo;

    @Override
    @Transactional(readOnly = true)
    public List<UserAdminResponse> getAllUsers(int page, int size) {
        return userRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size)).getContent().stream().map(u ->
                UserAdminResponse.builder().id(u.getId()).username(u.getUsername()).email(u.getEmail())
                        .phoneNumber(u.getPhoneNumber()).role(u.getRole().name()).balance(u.getBalance())
                        .totalWagered(u.getTotalWagered()).totalWon(u.getTotalWon()).blocked(u.isBlocked())
                        .emailVerified(u.isEmailVerified()).lastLogin(u.getLastLogin()).createdAt(u.getCreatedAt()).build()
        ).toList();
    }

    @Override
    public void blockUser(Long id) {
        User u = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        u.setBlocked(true);
        userRepo.save(u);
    }

    @Override
    public void unblockUser(Long id) {
        User u = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        u.setBlocked(false);
        userRepo.save(u);
    }

    @Override
    public GameResponse createGame(GameRequest req) {
        if (gameRepo.findByName(req.getName()).isPresent()) throw new BadRequestException("Game already exists");
        Game g = Game.builder().name(req.getName()).description(req.getDescription())
                .drawIntervalSeconds(req.getDrawIntervalSeconds()).bettingCloseBeforeSeconds(req.getBettingCloseBeforeSeconds())
                .jackpotMultiplier(req.getJackpotMultiplier()).partialMultiplier(req.getPartialMultiplier())
                .drawMode(Game.DrawMode.valueOf(req.getDrawMode())).status(Game.GameStatus.ACTIVE).currentRound(1)
                .nextDrawAt(LocalDateTime.now().plusSeconds(req.getDrawIntervalSeconds())).build();
        return toGameResp(gameRepo.save(g));
    }

    @Override
    public GameResponse updateGame(Long id, GameRequest req) {
        Game g = gameRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Game not found"));
        if (req.getName() != null) g.setName(req.getName());
        if (req.getDrawIntervalSeconds() != null) g.setDrawIntervalSeconds(req.getDrawIntervalSeconds());
        if (req.getJackpotMultiplier() != null) g.setJackpotMultiplier(req.getJackpotMultiplier());
        if (req.getPartialMultiplier() != null) g.setPartialMultiplier(req.getPartialMultiplier());
        if (req.getDrawMode() != null) g.setDrawMode(Game.DrawMode.valueOf(req.getDrawMode()));
        return toGameResp(gameRepo.save(g));
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getPlatformStats() {
        BigDecimal w = userRepo.sumTotalWagered(), won = userRepo.sumTotalWon(), pw = txnRepo.sumPendingWithdrawals();
        return AdminStatsResponse.builder().totalUsers(userRepo.count()).activeUsers(userRepo.countByBlocked(false))
                .blockedUsers(userRepo.countByBlocked(true)).totalWagered(w).totalPaidOut(won)
                .houseProfit(w.subtract(won)).totalBets(betRepo.count())
                .totalDraws(betRepo.countByStatus(Bet.BetStatus.WON))
                .pendingWithdrawals(txnRepo.countPendingWithdrawals())
                .pendingWithdrawalAmount(pw != null ? pw : BigDecimal.ZERO).build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BetResponse> getAllBets(int page, int size) {
        return betRepo.findAllByOrderByPlacedAtDesc(PageRequest.of(page, size)).getContent().stream().map(b ->
                BetResponse.builder().id(b.getId()).betNumber(b.getBetNumber()).betAmount(b.getBetAmount())
                        .payoutAmount(b.getPayoutAmount()).status(b.getStatus().name())
                        .winType(b.getWinType() != null ? b.getWinType().name() : null)
                        .roundNumber(b.getDraw().getRoundNumber()).gameName(b.getGame().getName())
                        .placedAt(b.getPlacedAt()).settledAt(b.getSettledAt()).build()
        ).toList();
    }

    private GameResponse toGameResp(Game g) {
        return GameResponse.builder().id(g.getId()).name(g.getName()).description(g.getDescription())
                .drawIntervalSeconds(g.getDrawIntervalSeconds()).bettingCloseBeforeSeconds(g.getBettingCloseBeforeSeconds())
                .jackpotMultiplier(g.getJackpotMultiplier()).partialMultiplier(g.getPartialMultiplier())
                .drawMode(g.getDrawMode().name()).status(g.getStatus().name()).currentRound(g.getCurrentRound()).build();
    }
}
