package com.metro.matka.service.impl;

import com.metro.matka.dto.request.PlaceBetRequest;
import com.metro.matka.dto.response.BetResponse;
import com.metro.matka.entity.*;
import com.metro.matka.exception.*;
import com.metro.matka.repository.*;
import com.metro.matka.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class BetServiceImpl implements BetService {
    private final BetRepository betRepo;
    private final UserRepository userRepo;
    private final GameRepository gameRepo;
    private final DrawRepository drawRepo;
    private final DrawServiceImpl drawSvc;
    private final WalletService walletSvc;

    @Override
    public List<BetResponse> placeBets(Long userId, PlaceBetRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.isBlocked()) throw new BadRequestException("Account blocked");
        Game game = gameRepo.findById(req.getGameId()).orElseThrow(() -> new ResourceNotFoundException("Game not found"));
        if (game.getStatus() != Game.GameStatus.ACTIVE) throw new BadRequestException("Game not active");
        Draw draw = drawSvc.getOrCreate(game);
        if (draw.getStatus() != Draw.DrawStatus.BETTING_OPEN) throw new BadRequestException("Betting is closed");
        if (LocalDateTime.now().isAfter(draw.getBettingClosesAt()))
            throw new BadRequestException("Betting window closed");
        for (String n : req.getBetNumbers())
            if (!n.matches("\\d{3}")) throw new BadRequestException("Invalid number: " + n);
        BigDecimal total = req.getChipAmount().multiply(BigDecimal.valueOf(req.getBetNumbers().size()));
        if (user.getBalance().compareTo(total) < 0) throw new BadRequestException("Insufficient balance");
        List<Bet> saved = new ArrayList<>();
        for (String num : req.getBetNumbers())
            saved.add(betRepo.save(Bet.builder().user(user).draw(draw).game(game).betNumber(num).betAmount(req.getChipAmount()).status(Bet.BetStatus.PENDING).build()));
        walletSvc.deductBetAmount(user, total, saved.get(0).getId());
        draw.setTotalBetsAmount(draw.getTotalBetsAmount().add(total));
        drawRepo.save(draw);
        return saved.stream().map(this::toResp).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BetResponse> getUserBets(Long userId, int page, int size) {
        return betRepo.findByUserIdOrderByPlacedAtDesc(userId, PageRequest.of(page, size)).getContent().stream().map(this::toResp).toList();
    }

    private BetResponse toResp(Bet b) {
        return BetResponse.builder().id(b.getId()).betNumber(b.getBetNumber())
                .betAmount(b.getBetAmount()).payoutAmount(b.getPayoutAmount())
                .status(b.getStatus().name()).winType(b.getWinType() != null ? b.getWinType().name() : null)
                .roundNumber(b.getDraw().getRoundNumber()).gameName(b.getGame().getName())
                .placedAt(b.getPlacedAt()).settledAt(b.getSettledAt()).build();
    }
}
