import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';
import { Game, Draw, Bet, TimerEvent, DrawResultEvent } from '../../shared/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-page">
      <!-- Top bar -->
      <div class="game-topbar">
        <div class="gt-name">{{ game()?.name || 'Loading...' }}</div>
        <div class="gt-meta">
          <span>Round <strong>#{{ activeDraw()?.roundNumber }}</strong></span>
          <span class="mode-pill" [class.auto]="game()?.drawMode === 'AUTO'">{{ game()?.drawMode }}</span>
        </div>
        <div class="gt-balance">&#8377;{{ auth.currentUser()?.balance | number:'1.2-2' }}</div>
      </div>

      <div class="game-body">
        <!-- Left Grid 000-499 -->
        <div class="num-panel">
          <div class="np-label">000 – 499</div>
          <div class="num-grid">
            <div *ngFor="let n of leftNums" class="nc"
                 [class.sel]="isSelected(n)" [class.win]="isWin(n)" (click)="toggle(n)">{{ n }}</div>
          </div>
        </div>

        <!-- Center -->
        <div class="center-col">
          <!-- Result digits -->
          <div class="result-wrap">
            <div class="r-digit" [class.r-hidden]="digits()[0] === null">{{ digits()[0] ?? '?' }}</div>
            <div class="r-digit" [class.r-hidden]="digits()[1] === null">{{ digits()[1] ?? '?' }}</div>
            <div class="r-digit" [class.r-hidden]="digits()[2] === null">{{ digits()[2] ?? '?' }}</div>
          </div>

          <div class="win-banner" *ngIf="winAmt() > 0">
            WIN &#8377;{{ winAmt() | number:'1.2-2' }}!
          </div>

          <!-- Timer -->
          <div class="timer-row">
            <div class="timer-box" [class.urgent]="secsLeft() <= 30">
              <div class="tv">{{ fmt(secsLeft()) }}</div>
              <div class="tl">Next Draw</div>
            </div>
            <div class="bet-status" [class.open]="bettingOpen()" [class.closed]="!bettingOpen()">
              {{ bettingOpen() ? 'BETTING OPEN' : 'BETTING CLOSED' }}
            </div>
          </div>

          <!-- History -->
          <div class="hist-section">
            <div class="section-lbl">Recent Results</div>
            <div class="hist-row">
              <div class="hist-item" *ngFor="let h of history()">
                <div class="hi-num">{{ h.resultNumber }}</div>
                <div class="hi-r">R{{ h.roundNumber }}</div>
              </div>
              <div *ngIf="!history().length" class="no-hist">No results yet</div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Chips -->
          <div class="section-lbl">Chip Amount</div>
          <div class="chips-row">
            <div *ngFor="let c of chipVals; let i = index"
                 class="chip" [class.c-active]="selChip() === c"
                 [ngClass]="'chip-' + i" (click)="selChip.set(c)">
              {{ c >= 1000 ? (c/1000)+'K' : c }}
            </div>
          </div>

          <!-- Selected numbers -->
          <div class="section-lbl">Selected ({{ selNums().length }})</div>
          <div class="sel-area">
            <div *ngIf="!selNums().length" class="sel-hint">Click numbers from grid</div>
            <span class="sel-tag" *ngFor="let n of selNums()">
              {{ n }} <span class="tag-x" (click)="removeNum(n)">x</span>
            </span>
          </div>

          <div class="total-line" *ngIf="selNums().length">
            Total: &#8377;{{ selNums().length * selChip() | number:'1.2-2' }}
          </div>

          <!-- Actions -->
          <div class="action-row">
            <button class="btn-bet" [disabled]="!canBet()" (click)="placeBet()">
              {{ placing() ? 'Placing...' : 'BET OK' }}
            </button>
            <button class="btn-clear"  (click)="clearSel()">Clear</button>
            <button class="btn-cancel" (click)="clearSel()">Cancel</button>
          </div>
          <div class="hint-txt" *ngIf="!bettingOpen()">Betting locked before draw</div>
        </div>

        <!-- Right: bets panel -->
        <div class="right-panel">
          <div class="rp-tabs">
            <button class="rp-tab" [class.active]="rpTab() === 'bets'" (click)="rpTab.set('bets')">My Bets</button>
            <button class="rp-tab" [class.active]="rpTab() === 'stats'" (click)="rpTab.set('stats')">Stats</button>
          </div>

          <div *ngIf="rpTab() === 'bets'" class="bet-list">
            <div *ngIf="!myBets().length" class="no-bets">No bets yet</div>
            <div *ngFor="let b of myBets()" class="bet-row"
                 [class.bet-won]="b.status==='WON'" [class.bet-lost]="b.status==='LOST'">
              <span class="br-num">{{ b.betNumber }}</span>
              <span class="br-amt">&#8377;{{ b.betAmount }}</span>
              <span class="br-stat" [ngClass]="'bs-' + b.status.toLowerCase()">{{ b.status }}</span>
              <span class="br-pay" *ngIf="b.payoutAmount > 0">+&#8377;{{ b.payoutAmount }}</span>
            </div>
          </div>

          <div *ngIf="rpTab() === 'stats'" class="stats-grid">
            <div class="sc"><label>Total Bets</label><span class="val">{{ myBets().length }}</span></div>
            <div class="sc green"><label>Won</label><span class="val">{{ wonCount() }}</span></div>
            <div class="sc"><label>Wagered</label><span class="val">&#8377;{{ totalWagered() | number:'1.0-0' }}</span></div>
            <div class="sc green"><label>Won &#8377;</label><span class="val">&#8377;{{ totalWon() | number:'1.0-0' }}</span></div>
          </div>
        </div>

        <!-- Right Grid 500-999 -->
        <div class="num-panel">
          <div class="np-label">500 – 999</div>
          <div class="num-grid">
            <div *ngFor="let n of rightNums" class="nc"
                 [class.sel]="isSelected(n)" [class.win]="isWin(n)" (click)="toggle(n)">{{ n }}</div>
          </div>
        </div>
      </div>

      <div class="toast" [class.show]="toastMsg()" [class.tw]="toastWin()">{{ toastMsg() }}</div>
    </div>
  `,
  styles: [`
    .game-page { background: #0a0401; min-height: 100vh; color: #fff8ef; font-family: 'Rajdhani',sans-serif; position: relative; }
    .game-topbar { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background: #1a0a02; border-bottom: 2px solid #d4a017; }
    .gt-name { font-size: 26px; font-weight: 700; color: #f5c842; letter-spacing: 4px; text-transform: uppercase; font-family: 'Teko',sans-serif; }
    .gt-meta { display: flex; gap: 12px; align-items: center; font-size: 14px; color: #a07850; }
    .gt-meta strong { color: #f5c842; }
    .mode-pill { padding: 3px 10px; border-radius: 3px; font-size: 11px; background: #0d4a1a; color: #2ecc71; }
    .gt-balance { font-size: 20px; font-weight: 600; color: #2ecc71; }
    .game-body { display: grid; grid-template-columns: 220px 1fr 260px 220px; height: calc(100vh - 56px); }
    .num-panel { background: #1a0a02; overflow-y: auto; border-right: 1px solid #3d1a05; }
    .num-panel:last-child { border-right: none; border-left: 1px solid #3d1a05; }
    .np-label { padding: 7px 10px; font-size: 11px; color: #a07850; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid #3d1a05; position: sticky; top: 0; background: #1a0a02; }
    .num-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 2px; padding: 4px; }
    .nc { background: #2d1509; text-align: center; padding: 5px 2px; font-size: 12px; color: #a07850; cursor: pointer; border: 1px solid transparent; border-radius: 2px; transition: all .1s; user-select: none; }
    .nc:hover { background: #5a2e0e; color: #f5c842; }
    .nc.sel { background: #8b6508; color: #f5c842; border-color: #d4a017; }
    .nc.win { background: #0d4a1a; color: #2ecc71; border-color: #27ae60; }
    .center-col { display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; overflow-y: auto; background: #0a0401; }
    .result-wrap { display: flex; gap: 8px; justify-content: center; background: #0a0401; border: 2px solid #d4a017; padding: 12px 20px; border-radius: 4px; }
    .r-digit { width: 68px; height: 78px; background: #d4a017; color: #1a0a02; display: flex; align-items: center; justify-content: center; font-size: 52px; font-weight: 700; border-radius: 4px; transition: all .4s; font-family: 'Teko',sans-serif; }
    .r-digit.r-hidden { background: #2d1509; color: #5a2e0e; }
    .win-banner { background: #0d4a1a; color: #2ecc71; padding: 8px 20px; border-radius: 4px; font-size: 18px; font-weight: 700; text-align: center; border: 1px solid #27ae60; }
    .timer-row { display: flex; gap: 12px; align-items: center; justify-content: center; }
    .timer-box { background: #0a0401; border: 1px solid #8b6508; padding: 8px 20px; border-radius: 4px; text-align: center; }
    .timer-box.urgent { border-color: #e74c3c; }
    .tv { font-size: 32px; font-weight: 700; color: #f5c842; letter-spacing: 2px; font-family: monospace; }
    .timer-box.urgent .tv { color: #e74c3c; }
    .tl { font-size: 10px; color: #a07850; text-transform: uppercase; letter-spacing: 2px; }
    .bet-status { padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; letter-spacing: 2px; }
    .bet-status.open { background: #0d4a1a; color: #2ecc71; }
    .bet-status.closed { background: #3d0000; color: #e74c3c; }
    .hist-section { width: 100%; }
    .section-lbl { font-size: 11px; color: #a07850; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
    .hist-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .hist-item { background: #1f0d03; border: 1px solid #3d1a05; border-radius: 3px; padding: 4px 8px; text-align: center; }
    .hi-num { font-size: 16px; color: #f5c842; font-family: monospace; }
    .hi-r { font-size: 10px; color: #a07850; }
    .no-hist { color: #5a2e0e; font-size: 12px; }
    .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, #8b6508, transparent); }
    .chips-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
    .chip { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; cursor: pointer; border: 3px solid rgba(255,255,255,.15); transition: all .15s; color: #fff; user-select: none; }
    .chip:hover { transform: scale(1.08); }
    .c-active { transform: scale(1.15) !important; border-color: #fff !important; box-shadow: 0 0 10px rgba(255,255,255,.25); }
    .chip-0 { background: radial-gradient(circle, #e74c3c, #922b21); }
    .chip-1 { background: radial-gradient(circle, #3498db, #1a5276); }
    .chip-2 { background: radial-gradient(circle, #27ae60, #145a32); }
    .chip-3 { background: radial-gradient(circle, #9b59b6, #6c3483); }
    .chip-4 { background: radial-gradient(circle, #e67e22, #935116); }
    .chip-5 { background: radial-gradient(circle, #1abc9c, #0e6655); }
    .chip-6 { background: radial-gradient(circle, #f39c12, #9a6b09); }
    .chip-7 { background: radial-gradient(circle, #95a5a6, #4d6066); }
    .sel-area { display: flex; flex-wrap: wrap; gap: 6px; min-height: 32px; background: #0a0401; border: 1px solid #3d1a05; padding: 6px 8px; border-radius: 3px; }
    .sel-hint { color: #5a2e0e; font-size: 12px; }
    .sel-tag { background: #8b6508; color: #f5c842; padding: 3px 8px; border-radius: 3px; font-size: 13px; display: flex; align-items: center; gap: 4px; }
    .tag-x { color: #a07850; cursor: pointer; font-size: 12px; line-height: 1; }
    .tag-x:hover { color: #e74c3c; }
    .total-line { text-align: center; color: #f5c842; font-size: 16px; font-weight: 600; background: #1a0a02; padding: 8px; border-radius: 4px; border: 1px solid #3d1a05; }
    .action-row { display: flex; gap: 8px; }
    .btn-bet { flex: 2; padding: 13px; background: linear-gradient(180deg, #f5c842, #d4a017); color: #1a0a02; border: none; border-radius: 4px; font-size: 17px; font-weight: 700; letter-spacing: 2px; cursor: pointer; text-transform: uppercase; font-family: inherit; }
    .btn-bet:hover:not(:disabled) { filter: brightness(1.08); }
    .btn-bet:disabled { background: #3d1a05; color: #5a2e0e; cursor: not-allowed; }
    .btn-clear  { flex: 1; padding: 13px; background: #1a1a1a; color: #888; border: 1px solid #333; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 13px; }
    .btn-cancel { flex: 1; padding: 13px; background: #3d0000; color: #e74c3c; border: 1px solid #6b0000; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 13px; }
    .hint-txt { text-align: center; font-size: 11px; color: #5a2e0e; letter-spacing: 1px; }
    .right-panel { background: #1a0a02; border-left: 1px solid #3d1a05; overflow-y: auto; }
    .rp-tabs { display: flex; border-bottom: 1px solid #3d1a05; }
    .rp-tab { flex: 1; padding: 10px; background: none; border: none; color: #a07850; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border-bottom: 2px solid transparent; font-family: inherit; }
    .rp-tab.active { color: #f5c842; border-bottom-color: #d4a017; }
    .bet-list { padding: 8px; }
    .no-bets { padding: 20px; text-align: center; color: #5a2e0e; font-size: 12px; }
    .bet-row { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 6px; padding: 6px 8px; background: #1f0d03; border: 1px solid #3d1a05; border-radius: 3px; margin-bottom: 3px; font-size: 12px; }
    .bet-won { border-color: #27ae60; }
    .bet-lost { border-color: #6b0000; }
    .br-num { font-size: 15px; color: #f5c842; font-family: monospace; }
    .br-amt { color: #a07850; }
    .br-stat { font-size: 10px; padding: 2px 5px; border-radius: 2px; text-transform: uppercase; }
    .bs-pending { background: #2d1509; color: #f5c842; }
    .bs-won { background: #0d4a1a; color: #2ecc71; }
    .bs-lost { background: #3d0000; color: #e74c3c; }
    .br-pay { color: #2ecc71; font-weight: 600; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 8px; }
    .sc { background: #1f0d03; border: 1px solid #3d1a05; border-radius: 3px; padding: 10px; text-align: center; }
    .sc.green .val { color: #2ecc71; }
    .sc label { font-size: 10px; color: #a07850; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 3px; }
    .sc .val { font-size: 19px; color: #f5c842; font-family: monospace; }
    .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: #1a0a02; border: 2px solid #d4a017; color: #f5c842; padding: 11px 26px; border-radius: 4px; font-size: 15px; font-weight: 600; letter-spacing: 1px; opacity: 0; transition: opacity .3s; pointer-events: none; z-index: 1000; white-space: nowrap; }
    .toast.show { opacity: 1; }
    .toast.tw { border-color: #27ae60; color: #2ecc71; }
  `]
})
export class GameComponent implements OnInit, OnDestroy {
  game = signal<Game | null>(null);
  activeDraw = signal<Draw | null>(null);
  myBets = signal<Bet[]>([]);
  history = signal<Draw[]>([]);
  selNums = signal<string[]>([]);
  selChip = signal<number>(10);
  secsLeft = signal<number>(0);
  bettingOpen = signal<boolean>(true);
  digits = signal<(number|null)[]>([null,null,null]);
  winAmt = signal<number>(0);
  placing = signal<boolean>(false);
  toastMsg = signal<string>('');
  toastWin = signal<boolean>(false);
  rpTab = signal<string>('bets');
  auth: AuthService;

  leftNums  = Array.from({length:500}, (_,i) => i.toString().padStart(3,'0'));
  rightNums = Array.from({length:500}, (_,i) => (i+500).toString().padStart(3,'0'));
  chipVals  = [1,2,5,10,25,50,100,500];

  canBet   = computed(() => this.bettingOpen() && this.selNums().length > 0 && !this.placing());
  wonCount = computed(() => this.myBets().filter(b => b.status==='WON').length);
  totalWagered = computed(() => this.myBets().reduce((s,b) => s + Number(b.betAmount), 0));
  totalWon     = computed(() => this.myBets().reduce((s,b) => s + Number(b.payoutAmount), 0));

  private gameId!: number;
  private subs: (Subscription|undefined)[] = [];
  private toastTimer: any;

  constructor(
    private route: ActivatedRoute,
    private gameSvc: GameService,
    private wsSvc: WebSocketService,
    auth: AuthService
  ) { this.auth = auth; }

  ngOnInit(): void {
    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
    this.gameSvc.getGame(this.gameId).subscribe(g => this.game.set(g));
    this.gameSvc.getActiveDraw(this.gameId).subscribe(d => {
      this.activeDraw.set(d);
      this.secsLeft.set(d.secondsUntilDraw);
      this.bettingOpen.set(d.status === 'BETTING_OPEN');
    });
    this.gameSvc.getMyBets(0,50).subscribe(b => this.myBets.set(b));
    this.gameSvc.getDrawHistory(this.gameId,0,6).subscribe(h =>
      this.history.set(h.filter(d => d.status === 'DRAWN')));
   // this.connectWS();
  }

  // private connectWS(): void {
  //   this.wsSvc.connect();
  //   this.subs.push(this.wsSvc.subscribeTimer(this.gameId, (e: TimerEvent) => {
  //     this.secsLeft.set(e.secondsLeft);
  //     this.bettingOpen.set(e.bettingOpen);
  //   }));
  //   this.subs.push(this.wsSvc.subscribeResult(this.gameId, (e: DrawResultEvent) => this.reveal(e)));
  //   this.subs.push(this.wsSvc.subscribeBettingClosed(this.gameId, () => {
  //     this.bettingOpen.set(false);
  //     this.toast('Betting closed!', false);
  //   }));
  // }

  private reveal(e: DrawResultEvent): void {
    this.digits.set([null,null,null]);
    setTimeout(() => this.digits.set([e.digit1,null,null]), 400);
    setTimeout(() => this.digits.set([e.digit1,e.digit2,null]), 800);
    setTimeout(() => {
      this.digits.set([e.digit1,e.digit2,e.digit3]);
      const won = this.myBets().filter(b => b.status==='PENDING' && b.betNumber === e.result)
        .reduce((s,b) => s + Number(b.betAmount) * (this.game()?.jackpotMultiplier || 800), 0);
      this.winAmt.set(won);
      if (won > 0) { this.auth.updateBalance((this.auth.currentUser()?.balance || 0) + won); this.toast(`WIN ₹${won}!`, true); }
      else this.toast(`Result: ${e.result}`, false);
      this.gameSvc.getMyBets(0,50).subscribe(b => this.myBets.set(b));
      this.gameSvc.getDrawHistory(this.gameId,0,6).subscribe(h => this.history.set(h.filter(d => d.status==='DRAWN')));
    }, 1200);
  }

  toggle(n: string): void {
    if (!this.bettingOpen()) { this.toast('Betting is closed!', false); return; }
    const cur = this.selNums();
    this.selNums.set(cur.includes(n) ? cur.filter(x => x!==n) : [...cur, n]);
  }
  removeNum(n: string): void { this.selNums.set(this.selNums().filter(x => x!==n)); }
  isSelected(n: string): boolean { return this.selNums().includes(n); }
  isWin(n: string): boolean { const d = this.digits(); return d[2] !== null && d.join('') === n; }
  clearSel(): void { this.selNums.set([]); }

  placeBet(): void {
    if (!this.canBet()) return;
    this.placing.set(true);
    this.gameSvc.placeBet({ gameId: this.gameId, betNumbers: this.selNums(), chipAmount: this.selChip() }).subscribe({
      next: bets => {
        const total = this.selNums().length * this.selChip();
        this.auth.updateBalance((this.auth.currentUser()?.balance || 0) - total);
        this.myBets.set([...bets, ...this.myBets()]);
        this.clearSel();
        this.toast(`${bets.length} bet(s) placed! -₹${total}`, false);
        this.placing.set(false);
      },
      error: e => { this.toast(e?.error?.message || 'Bet failed!', false); this.placing.set(false); }
    });
  }

  fmt(s: number): string {
    const m = Math.floor(s/60), sec = s%60;
    return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  }

  private toast(msg: string, win: boolean): void {
    clearTimeout(this.toastTimer);
    this.toastMsg.set(msg); this.toastWin.set(win);
    this.toastTimer = setTimeout(() => this.toastMsg.set(''), 3000);
  }

  ngOnDestroy(): void { this.subs.forEach(s => s?.unsubscribe()); this.wsSvc.disconnect(); }
}
