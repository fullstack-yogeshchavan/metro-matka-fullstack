export interface ApiResponse<T> {
  success: boolean; message: string; data: T; timestamp: number;
}
export interface AuthResponse {
  accessToken: string; refreshToken: string; tokenType: string;
  expiresIn: number; userId: number; username: string;
  email: string; role: string; balance: number;
}
export interface Game {
  id: number; name: string; description: string;
  drawIntervalSeconds: number; bettingCloseBeforeSeconds: number;
  jackpotMultiplier: number; partialMultiplier: number;
  drawMode: 'AUTO' | 'MANUAL'; status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  currentRound: number; nextDrawAt: string;
}
export interface Draw {
  id: number; gameId: number; gameName: string; roundNumber: number;
  resultNumber: string | null;
  status: 'PENDING' | 'BETTING_OPEN' | 'BETTING_CLOSED' | 'DRAWN' | 'CANCELLED';
  scheduledAt: string; drawnAt: string | null; bettingClosesAt: string;
  secondsUntilDraw: number; totalBetsAmount: number; totalPayout: number; houseProfit: number;
}
export interface Bet {
  id: number; betNumber: string; betAmount: number; payoutAmount: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED' | 'REFUNDED';
  winType: 'JACKPOT' | 'PARTIAL' | null; roundNumber: number;
  gameName: string; placedAt: string; settledAt: string | null;
}
export interface Transaction {
  id: number; type: string; amount: number;
  balanceBefore: number; balanceAfter: number;
  status: string; description: string; paymentId: string;
  createdAt: string; completedAt: string | null;
}
export interface PaymentOrder {
  orderId: string; amount: number; currency: string;
  keyId: string; userName: string; userEmail: string;
}
export interface TimerEvent {
  gameId: number; gameName: string; drawId: number;
  roundNumber: number; secondsLeft: number; bettingOpen: boolean;
}
export interface DrawResultEvent {
  gameId: number; gameName: string; drawId: number; roundNumber: number;
  result: string; digit1: number; digit2: number; digit3: number; totalPayout: number;
}
export interface AdminStats {
  totalUsers: number; activeUsers: number; blockedUsers: number;
  totalWagered: number; totalPaidOut: number; houseProfit: number;
  totalBets: number; totalDraws: number;
  pendingWithdrawals: number; pendingWithdrawalAmount: number;
}
export interface User {
  id: number; username: string; email: string; phoneNumber: string;
  role: string; balance: number; totalWagered: number; totalWon: number;
  blocked: boolean; emailVerified: boolean; lastLogin: string; createdAt: string;
}
export interface PlaceBetRequest { gameId: number; betNumbers: string[]; chipAmount: number; }
export interface LoginRequest { usernameOrEmail: string; password: string; }
export interface RegisterRequest { username: string; email: string; password: string; phoneNumber?: string; }
