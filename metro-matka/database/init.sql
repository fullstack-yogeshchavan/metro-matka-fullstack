-- Metro Matka - Database Initialization
CREATE DATABASE metro_matka
    WITH ENCODING 'UTF8'
    LC_COLLATE 'en_US.UTF-8'
    LC_CTYPE 'en_US.UTF-8'
    TEMPLATE template0;

\c metro_matka;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id                  BIGSERIAL PRIMARY KEY,
    username            VARCHAR(50)   UNIQUE NOT NULL,
    email               VARCHAR(100)  UNIQUE NOT NULL,
    password            VARCHAR(255)  NOT NULL,
    phone_number        VARCHAR(15),
    role                VARCHAR(20)   NOT NULL DEFAULT 'PLAYER',
    balance             NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_wagered       NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_won           NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_lost          NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    is_blocked          BOOLEAN NOT NULL DEFAULT FALSE,
    is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    refresh_token       TEXT,
    last_login          TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
    id                           BIGSERIAL PRIMARY KEY,
    name                         VARCHAR(50)  UNIQUE NOT NULL,
    description                  TEXT,
    draw_interval_seconds        INTEGER NOT NULL DEFAULT 180,
    betting_close_before_seconds INTEGER NOT NULL DEFAULT 30,
    jackpot_multiplier           INTEGER NOT NULL DEFAULT 800,
    partial_multiplier           INTEGER NOT NULL DEFAULT 10,
    draw_mode                    VARCHAR(20) NOT NULL DEFAULT 'AUTO',
    status                       VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    current_round                INTEGER NOT NULL DEFAULT 1,
    next_draw_at                 TIMESTAMP,
    created_at                   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS draws (
    id                BIGSERIAL PRIMARY KEY,
    game_id           BIGINT NOT NULL REFERENCES games(id),
    round_number      INTEGER NOT NULL,
    result_digit1     INTEGER,
    result_digit2     INTEGER,
    result_digit3     INTEGER,
    result_number     VARCHAR(3),
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    scheduled_at      TIMESTAMP,
    drawn_at          TIMESTAMP,
    betting_closes_at TIMESTAMP,
    total_bets_amount NUMERIC(15,2) DEFAULT 0.00,
    total_payout      NUMERIC(15,2) DEFAULT 0.00,
    house_profit      NUMERIC(15,2) DEFAULT 0.00,
    declared_by       BIGINT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bets (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(id),
    draw_id       BIGINT NOT NULL REFERENCES draws(id),
    game_id       BIGINT NOT NULL REFERENCES games(id),
    bet_number    VARCHAR(3)    NOT NULL,
    bet_amount    NUMERIC(15,2) NOT NULL,
    payout_amount NUMERIC(15,2) DEFAULT 0.00,
    status        VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    win_type      VARCHAR(20),
    placed_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    settled_at    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    type             VARCHAR(30)   NOT NULL,
    amount           NUMERIC(15,2) NOT NULL,
    balance_before   NUMERIC(15,2),
    balance_after    NUMERIC(15,2),
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    payment_order_id VARCHAR(100),
    payment_id       VARCHAR(100),
    description      VARCHAR(255),
    bet_id           BIGINT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_games_status   ON games(status);
CREATE INDEX IF NOT EXISTS idx_draws_game_id  ON draws(game_id);
CREATE INDEX IF NOT EXISTS idx_draws_status   ON draws(status);
CREATE INDEX IF NOT EXISTS idx_bets_user_id   ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_draw_id   ON bets(draw_id);
CREATE INDEX IF NOT EXISTS idx_bets_status    ON bets(status);
CREATE INDEX IF NOT EXISTS idx_txn_user_id    ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_order_id   ON transactions(payment_order_id);

-- ============================================================
-- DEFAULT LOGIN CREDENTIALS
-- Admin  : username=admin    password=admin123
-- Player : username=player1  password=player123
-- ============================================================

-- Admin account
INSERT INTO users (username, email, password, role, balance, is_email_verified)
VALUES ('admin', 'admin@metromatka.com',
        '$2b$12$CdYwYGPqgk/h8daqeiCqU.nOBXpzTqF0qsuAa..Vz8ZVOLgzxhQge',
        'ADMIN', 0.00, TRUE)
ON CONFLICT (username) DO UPDATE SET
    password = '$2b$12$CdYwYGPqgk/h8daqeiCqU.nOBXpzTqF0qsuAa..Vz8ZVOLgzxhQge',
    role     = 'ADMIN';

-- Demo player account (starts with ₹5000 balance)
INSERT INTO users (username, email, password, role, balance, is_email_verified)
VALUES ('player1', 'player1@metromatka.com',
        '$2b$12$FPX.VA8b8L4RiTq0oXCJVeAQ5lmefMtKRjRWCSwluClQ5xhogHhFm',
        'PLAYER', 5000.00, TRUE)
ON CONFLICT (username) DO UPDATE SET
    password = '$2b$12$FPX.VA8b8L4RiTq0oXCJVeAQ5lmefMtKRjRWCSwluClQ5xhogHhFm',
    balance  = 5000.00;

-- Seed: Metro game
INSERT INTO games (name, description, draw_interval_seconds, betting_close_before_seconds,
                   jackpot_multiplier, partial_multiplier, draw_mode, status, current_round)
VALUES ('Metro', 'Main Metro Matka game - draws every 3 minutes', 180, 30, 800, 10, 'AUTO', 'ACTIVE', 1)
ON CONFLICT (name) DO NOTHING;

-- Seed: Milan game
INSERT INTO games (name, description, draw_interval_seconds, betting_close_before_seconds,
                   jackpot_multiplier, partial_multiplier, draw_mode, status, current_round)
VALUES ('Milan', 'Milan Matka - draws every 5 minutes', 300, 30, 800, 10, 'AUTO', 'ACTIVE', 1)
ON CONFLICT (name) DO NOTHING;

\echo 'Metro Matka database initialized!'
