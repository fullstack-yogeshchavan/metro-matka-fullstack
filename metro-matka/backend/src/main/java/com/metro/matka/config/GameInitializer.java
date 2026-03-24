package com.metro.matka.config;

import com.metro.matka.entity.Game;
import com.metro.matka.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class GameInitializer implements CommandLineRunner {

    private final GameRepository gameRepository;

    @Override
    public void run(String... args) {
        createGameIfNotExists("Metro",
                "Main Metro Matka game - draws every 3 minutes",
                180, 30, 800, 10);

        createGameIfNotExists("Milan",
                "Milan Matka - draws every 5 minutes",
                300, 30, 800, 10);

        log.info("Games initialized: Metro, Milan");
    }

    private void createGameIfNotExists(String name, String description,
                                        int interval, int closeBefore,
                                        int jackpot, int partial) {
        if (gameRepository.findByName(name).isEmpty()) {
            Game game = Game.builder()
                    .name(name)
                    .description(description)
                    .drawIntervalSeconds(interval)
                    .bettingCloseBeforeSeconds(closeBefore)
                    .jackpotMultiplier(jackpot)
                    .partialMultiplier(partial)
                    .drawMode(Game.DrawMode.AUTO)
                    .status(Game.GameStatus.ACTIVE)
                    .currentRound(1)
                    .nextDrawAt(LocalDateTime.now().plusSeconds(interval))
                    .build();
            gameRepository.save(game);
            log.info("Created game: {}", name);
        }
    }
}
