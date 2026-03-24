import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AdminStats, User, Bet } from '../../shared/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-hdr">
        <h1>Admin Panel</h1>
        <span class="admin-pill">ADMIN</span>
      </div>

      <!-- Stats -->
      <div class="stats-row" *ngIf="stats()">
        <div class="sc"><label>Total Users</label><span class="val">{{ stats()!.totalUsers }}</span></div>
        <div class="sc"><label>Active</label><span class="val g">{{ stats()!.activeUsers }}</span></div>
        <div class="sc"><label>Blocked</label><span class="val r">{{ stats()!.blockedUsers }}</span></div>
        <div class="sc"><label>Wagered</label><span class="val">&#8377;{{ stats()!.totalWagered | number:'1.0-0' }}</span></div>
        <div class="sc"><label>Paid Out</label><span class="val">&#8377;{{ stats()!.totalPaidOut | number:'1.0-0' }}</span></div>
        <div class="sc green-sc"><label>House Profit</label><span class="val">&#8377;{{ stats()!.houseProfit | number:'1.0-0' }}</span></div>
        <div class="sc"><label>Total Bets</label><span class="val">{{ stats()!.totalBets }}</span></div>
        <div class="sc red-sc"><label>Pending W/D</label><span class="val">{{ stats()!.pendingWithdrawals }}</span></div>
      </div>

      <!-- Tabs -->
      <div class="a-tabs">
        <button class="a-tab" [class.active]="tab()==='users'" (click)="tab.set('users')">Users</button>
        <button class="a-tab" [class.active]="tab()==='games'" (click)="tab.set('games')">Games</button>
        <button class="a-tab" [class.active]="tab()==='bets'"  (click)="tab.set('bets')">All Bets</button>
        <button class="a-tab" [class.active]="tab()==='draw'"  (click)="tab.set('draw')">Draw Control</button>
      </div>

      <!-- Users -->
      <div class="tab-panel" *ngIf="tab()==='users'">
        <div class="search-wrap">
          <input [(ngModel)]="q" (ngModelChange)="filterUsers()" placeholder="Search by username or email..." />
        </div>
        <div class="tbl-wrap">
          <table class="a-table">
            <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Wagered</th><th>Won</th><th>Status</th><th>Last Login</th><th>Action</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of filteredUsers()" [class.blocked-row]="u.blocked">
                <td>{{ u.id }}</td>
                <td class="uname">{{ u.username }}</td>
                <td>{{ u.email }}</td>
                <td>&#8377;{{ u.balance | number:'1.2-2' }}</td>
                <td>&#8377;{{ u.totalWagered | number:'1.0-0' }}</td>
                <td class="g">&#8377;{{ u.totalWon | number:'1.0-0' }}</td>
                <td><span class="st-pill" [class.st-active]="!u.blocked" [class.st-blocked]="u.blocked">{{ u.blocked ? 'Blocked' : 'Active' }}</span></td>
                <td>{{ u.lastLogin | date:'shortDate' }}</td>
                <td><button class="btn-sm" [class.sm-block]="!u.blocked" [class.sm-unblock]="u.blocked" (click)="toggleBlock(u)">{{ u.blocked ? 'Unblock' : 'Block' }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Games -->
      <div class="tab-panel" *ngIf="tab()==='games'">
        <h3>Create New Game</h3>
        <div class="form-grid">
          <div class="field"><label>Game Name</label><input [(ngModel)]="gf.name" placeholder="Metro, Milan..." /></div>
          <div class="field"><label>Description</label><input [(ngModel)]="gf.description" placeholder="Optional" /></div>
          <div class="field"><label>Draw Interval (sec)</label><input type="number" [(ngModel)]="gf.drawIntervalSeconds" /></div>
          <div class="field"><label>Betting Close Before (sec)</label><input type="number" [(ngModel)]="gf.bettingCloseBeforeSeconds" /></div>
          <div class="field"><label>Jackpot Multiplier</label><input type="number" [(ngModel)]="gf.jackpotMultiplier" /></div>
          <div class="field"><label>Partial Multiplier</label><input type="number" [(ngModel)]="gf.partialMultiplier" /></div>
          <div class="field"><label>Draw Mode</label>
            <select [(ngModel)]="gf.drawMode">
              <option value="AUTO">AUTO</option>
              <option value="MANUAL">MANUAL</option>
            </select>
          </div>
        </div>
        <button class="btn-create" (click)="createGame()">Create Game</button>
        <div class="ok-msg" *ngIf="gMsg()">{{ gMsg() }}</div>
      </div>

      <!-- Bets -->
      <div class="tab-panel" *ngIf="tab()==='bets'">
        <div class="tbl-wrap">
          <table class="a-table">
            <thead><tr><th>ID</th><th>Number</th><th>Amount</th><th>Payout</th><th>Status</th><th>Game</th><th>Round</th><th>Placed At</th></tr></thead>
            <tbody>
              <tr *ngFor="let b of allBets()">
                <td>{{ b.id }}</td>
                <td class="mono">{{ b.betNumber }}</td>
                <td>&#8377;{{ b.betAmount }}</td>
                <td [class.g]="b.payoutAmount > 0">&#8377;{{ b.payoutAmount }}</td>
                <td><span class="st-pill" [class.st-active]="b.status==='WON'" [class.st-blocked]="b.status==='LOST'" [class.st-pend]="b.status==='PENDING'">{{ b.status }}</span></td>
                <td>{{ b.gameName }}</td>
                <td>{{ b.roundNumber }}</td>
                <td>{{ b.placedAt | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Draw Control -->
      <div class="tab-panel" *ngIf="tab()==='draw'">
        <div class="draw-ctrl">
          <h3>Manual Draw Override</h3>
          <div class="field"><label>Game ID</label><input type="number" [(ngModel)]="drawGameId" style="width:120px" /></div>
          <div class="digit-row">
            <div class="field"><label>Digit 1 (0-9)</label><input type="number" [(ngModel)]="d1" min="0" max="9" style="width:80px" /></div>
            <div class="field"><label>Digit 2 (0-9)</label><input type="number" [(ngModel)]="d2" min="0" max="9" style="width:80px" /></div>
            <div class="field"><label>Digit 3 (0-9)</label><input type="number" [(ngModel)]="d3" min="0" max="9" style="width:80px" /></div>
          </div>
          <div class="preview">Preview: <strong>{{ d1 }}{{ d2 }}{{ d3 }}</strong></div>
          <button class="btn-declare" (click)="declareDraw()">Declare Result</button>
          <div class="ok-msg" *ngIf="drawMsg()">{{ drawMsg() }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { background: #0a0401; min-height: 100vh; padding: 20px 24px; color: #fff8ef; }
    .admin-hdr { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .admin-hdr h1 { font-size: 22px; color: #f5c842; letter-spacing: 4px; text-transform: uppercase; font-family: 'Teko',sans-serif; }
    .admin-pill { background: #3d2000; color: #f39c12; padding: 4px 12px; border-radius: 3px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; border: 1px solid #8b5500; }
    .stats-row { display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; margin-bottom: 20px; }
    .sc { background: #1a0a02; border: 1px solid #3d1a05; border-radius: 6px; padding: 10px; text-align: center; }
    .sc label { font-size: 10px; color: #a07850; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 3px; }
    .sc .val { font-size: 17px; color: #f5c842; font-weight: 600; }
    .sc .val.g { color: #2ecc71; }
    .sc .val.r { color: #e74c3c; }
    .g { color: #2ecc71; }
    .green-sc { border-color: #27ae60; }
    .red-sc { border-color: #c0392b; }
    .a-tabs { display: flex; border-bottom: 1px solid #3d1a05; margin-bottom: 0; }
    .a-tab { padding: 10px 20px; background: none; border: none; color: #a07850; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border-bottom: 2px solid transparent; font-family: inherit; }
    .a-tab.active { color: #f5c842; border-bottom-color: #d4a017; }
    .tab-panel { background: #1a0a02; border: 1px solid #3d1a05; border-top: none; padding: 16px; }
    .search-wrap { margin-bottom: 12px; }
    .search-wrap input { width: 300px; padding: 8px 12px; background: #0a0401; border: 1px solid #3d1a05; color: #fff8ef; border-radius: 4px; font-size: 13px; font-family: inherit; }
    .tbl-wrap { overflow-x: auto; }
    .a-table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 700px; }
    .a-table th { background: #0a0401; color: #a07850; padding: 8px; text-align: left; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #3d1a05; }
    .a-table td { padding: 8px; border-bottom: 1px solid #1f0d03; }
    .a-table tr:hover td { background: #1f0d03; }
    .blocked-row td { opacity: 0.6; }
    .uname { color: #f5c842; font-weight: 600; }
    .mono { font-family: monospace; color: #f5c842; }
    .st-pill { padding: 2px 8px; border-radius: 3px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .st-active { background: #0d4a1a; color: #2ecc71; }
    .st-blocked { background: #3d0000; color: #e74c3c; }
    .st-pend { background: #2d1509; color: #f5c842; }
    .btn-sm { padding: 4px 10px; border: none; border-radius: 3px; font-size: 11px; cursor: pointer; font-family: inherit; letter-spacing: 1px; }
    .sm-block { background: #6b0000; color: #e74c3c; }
    .sm-unblock { background: #0d4a1a; color: #2ecc71; }
    h3 { color: #f5c842; font-size: 15px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-size: 10px; color: #a07850; letter-spacing: 1px; text-transform: uppercase; }
    .field input, .field select { padding: 8px 12px; background: #0a0401; border: 1px solid #3d1a05; color: #fff8ef; border-radius: 4px; font-size: 13px; font-family: inherit; }
    .field input:focus, .field select:focus { outline: none; border-color: #d4a017; }
    .btn-create { padding: 11px 24px; background: linear-gradient(180deg, #f5c842, #d4a017); color: #1a0a02; border: none; border-radius: 4px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; letter-spacing: 1px; }
    .ok-msg { margin-top: 10px; color: #2ecc71; font-size: 13px; }
    .draw-ctrl { max-width: 500px; }
    .digit-row { display: flex; gap: 12px; margin-bottom: 12px; }
    .preview { font-size: 16px; color: #a07850; margin-bottom: 12px; }
    .preview strong { font-size: 28px; color: #f5c842; font-family: monospace; }
    .btn-declare { padding: 11px 22px; background: #1a2a1a; color: #2ecc71; border: 1px solid #27ae60; border-radius: 4px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
    @media (max-width: 1000px) { .stats-row { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 600px) { .stats-row { grid-template-columns: repeat(2, 1fr); } .form-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class AdminComponent implements OnInit {
  tab = signal('users');
  stats = signal<AdminStats | null>(null);
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  allBets = signal<Bet[]>([]);
  q = '';
  gf: any = { name: '', description: '', drawIntervalSeconds: 180, bettingCloseBeforeSeconds: 30, jackpotMultiplier: 800, partialMultiplier: 10, drawMode: 'AUTO' };
  drawGameId = 1;
  d1 = 1; d2 = 1; d3 = 2;
  gMsg = signal('');
  drawMsg = signal('');

  constructor(private adminSvc: AdminService) {}

  ngOnInit(): void {
    this.adminSvc.getStats().subscribe(s => this.stats.set(s));
    this.loadUsers();
    this.adminSvc.getAllBets().subscribe(b => this.allBets.set(b));
  }

  loadUsers(): void {
    this.adminSvc.getUsers().subscribe(u => { this.users.set(u); this.filteredUsers.set(u); });
  }

  filterUsers(): void {
    const lq = this.q.toLowerCase();
    this.filteredUsers.set(this.users().filter(u => u.username.toLowerCase().includes(lq) || u.email.toLowerCase().includes(lq)));
  }

  toggleBlock(u: User): void {
    (u.blocked ? this.adminSvc.unblockUser(u.id) : this.adminSvc.blockUser(u.id))
      .subscribe(() => this.loadUsers());
  }

  createGame(): void {
    this.adminSvc.createGame(this.gf).subscribe({
      next: () => this.gMsg.set('Game created successfully!'),
      error: e => this.gMsg.set(e?.error?.message || 'Error creating game')
    });
  }

  declareDraw(): void {
    const result = `${this.d1}${this.d2}${this.d3}`;
    this.adminSvc.triggerManualDraw(this.drawGameId, result).subscribe({
      next: () => this.drawMsg.set(`Draw declared! Result: ${result}`),
      error: e => this.drawMsg.set(e?.error?.message || 'Draw failed')
    });
  }
}
