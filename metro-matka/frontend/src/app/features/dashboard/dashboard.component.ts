import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { Game } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dash-page">
      <div class="dash-header">
        <div>
          <h1>Welcome, <span>{{ auth.currentUser()?.username }}</span></h1>
          <p class="sub">Choose a game and start playing</p>
        </div>
        <div class="balance-box">
          <label>Wallet Balance</label>
          <div class="bal-amount">&#8377;{{ auth.currentUser()?.balance | number:'1.2-2' }}</div>
          <a routerLink="/wallet" class="dep-btn">+ Deposit</a>
        </div>
      </div>

      <div class="section-title">Active Games</div>

      <div class="games-grid">
        <div *ngIf="loading()" class="loading-msg">Loading games...</div>
        <div *ngIf="!loading() && !games().length" class="loading-msg">No active games</div>
        <div class="game-card" *ngFor="let g of games()" [routerLink]="['/game', g.id]">
          <div class="gc-name">{{ g.name }}</div>
          <div class="gc-badges">
            <span class="badge-round">Round #{{ g.currentRound }}</span>
            <span class="badge-mode" [class.auto]="g.drawMode === 'AUTO'">{{ g.drawMode }}</span>
          </div>
          <div class="gc-stats">
            <div class="gc-stat"><label>Draw Every</label><span class="val">{{ g.drawIntervalSeconds / 60 }}m</span></div>
            <div class="gc-stat"><label>Jackpot</label><span class="val">{{ g.jackpotMultiplier }}x</span></div>
            <div class="gc-stat"><label>Partial</label><span class="val">{{ g.partialMultiplier }}x</span></div>
          </div>
          <div class="gc-play">Play Now &#8594;</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-page { background: #0a0401; min-height: 100vh; padding: 28px 24px; color: #fff8ef; }
    .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    h1 { font-size: 28px; font-weight: 600; color: #fff8ef; }
    h1 span { color: #f5c842; }
    .sub { color: #a07850; font-size: 14px; margin-top: 4px; }
    .balance-box { background: #1a0a02; border: 1px solid #d4a017; border-radius: 8px; padding: 18px 24px; text-align: center; min-width: 180px; }
    .balance-box label { display: block; font-size: 11px; color: #a07850; letter-spacing: 2px; text-transform: uppercase; }
    .bal-amount { font-size: 28px; font-weight: 700; color: #f5c842; margin: 6px 0; }
    .dep-btn { display: inline-block; padding: 6px 18px; background: linear-gradient(180deg, #f5c842, #d4a017); color: #1a0a02; border-radius: 4px; font-size: 13px; font-weight: 700; text-decoration: none; }
    .section-title { font-size: 16px; color: #f5c842; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
    .games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .loading-msg { color: #a07850; padding: 20px; }
    .game-card { background: #1a0a02; border: 1px solid #3d1a05; border-radius: 8px; padding: 22px; cursor: pointer; transition: border-color .2s, transform .2s; }
    .game-card:hover { border-color: #d4a017; transform: translateY(-2px); }
    .gc-name { font-size: 26px; font-weight: 700; color: #f5c842; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 10px; font-family: 'Teko', sans-serif; }
    .gc-badges { display: flex; gap: 8px; margin-bottom: 14px; }
    .badge-round { background: #2d1509; color: #d4a017; padding: 3px 8px; border-radius: 3px; font-size: 12px; border: 1px solid #5a2e0e; }
    .badge-mode { padding: 3px 8px; border-radius: 3px; font-size: 12px; background: #1f0d03; color: #a07850; }
    .badge-mode.auto { background: #0d4a1a; color: #2ecc71; }
    .gc-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
    .gc-stat label { font-size: 10px; color: #a07850; letter-spacing: 1px; text-transform: uppercase; display: block; }
    .gc-stat .val { font-size: 18px; color: #f5c842; font-weight: 600; }
    .gc-play { text-align: center; padding: 10px; background: linear-gradient(180deg, #d4a017, #8b6508); color: #1a0a02; border-radius: 4px; font-weight: 700; font-size: 15px; letter-spacing: 1px; }
  `]
})
export class DashboardComponent implements OnInit {
  games = signal<Game[]>([]);
  loading = signal(true);
  auth: AuthService;

  constructor(private gameService: GameService, auth: AuthService) { this.auth = auth; }

  ngOnInit(): void {
    this.gameService.getGames().subscribe({
      next: g => { this.games.set(g); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
