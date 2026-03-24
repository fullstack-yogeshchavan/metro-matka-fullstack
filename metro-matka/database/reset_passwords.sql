-- ============================================================
-- RESET PASSWORDS SCRIPT
-- Run this if login fails:
--   psql -U postgres -d metro_matka -f reset_passwords.sql
-- ============================================================

-- Step 1: Delete existing users so DataInitializer recreates them with correct hashes
DELETE FROM transactions WHERE user_id IN (SELECT id FROM users WHERE username IN ('admin','player1'));
DELETE FROM bets WHERE user_id IN (SELECT id FROM users WHERE username IN ('admin','player1'));
DELETE FROM users WHERE username IN ('admin', 'player1');

-- Step 2: Restart the Spring Boot app - DataInitializer will recreate them with correct BCrypt hashes

SELECT 'Done! Now restart Spring Boot. It will create admin/admin123 and player1/player123' AS message;
