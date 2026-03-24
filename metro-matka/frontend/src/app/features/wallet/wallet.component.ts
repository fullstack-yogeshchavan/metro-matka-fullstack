import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../../core/services/wallet.service';
import { AuthService } from '../../core/services/auth.service';
import { Transaction } from '../../shared/models';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wallet-page">
      <h1 class="page-title">Wallet</h1>

      <div class="balance-hero">
        <label>Current Balance</label>
        <div class="bal-big">&#8377;{{ auth.currentUser()?.balance | number:'1.2-2' }}</div>
      </div>

      <div class="wallet-grid">
        <!-- Deposit -->
        <div class="w-section">
          <h2>Deposit Funds</h2>
          <div class="quick-amts">
            <button *ngFor="let a of quickAmts" class="qa-btn" (click)="depAmt = a">&#8377;{{ a | number }}</button>
          </div>
          <div class="field">
            <label>Custom Amount (&#8377;100 – &#8377;1,00,000)</label>
            <input type="number" [(ngModel)]="depAmt" placeholder="Enter amount" />
          </div>
          <button class="btn-dep" (click)="initDeposit()" [disabled]="depositing()">
            {{ depositing() ? 'Processing...' : 'Deposit via Razorpay' }}
          </button>
        </div>

        <!-- Withdraw -->
        <div class="w-section">
          <h2>Withdraw Funds</h2>
          <div class="field"><label>Amount (min &#8377;500)</label><input type="number" [(ngModel)]="wd.amount" placeholder="500" /></div>
          <div class="field"><label>Account Number</label><input [(ngModel)]="wd.accountNumber" placeholder="Bank account" /></div>
          <div class="field"><label>IFSC Code</label><input [(ngModel)]="wd.ifscCode" placeholder="e.g. SBIN0001234" /></div>
          <div class="field"><label>Account Holder Name</label><input [(ngModel)]="wd.accountHolderName" placeholder="Full name" /></div>
          <div class="field"><label>Bank Name</label><input [(ngModel)]="wd.bankName" placeholder="State Bank of India" /></div>
          <button class="btn-wd" (click)="withdraw()">Request Withdrawal</button>
        </div>
      </div>

      <!-- Transactions -->
      <div class="w-section mt20">
        <h2>Transaction History</h2>
        <div class="txn-list">
          <div *ngIf="!txns().length" class="no-txn">No transactions yet</div>
          <div class="txn-row" *ngFor="let t of txns()">
            <div class="tr-left">
              <span class="txn-type" [ngClass]="t.type.toLowerCase()">{{ t.type.replace('_', ' ') }}</span>
              <span class="txn-desc">{{ t.description }}</span>
            </div>
            <div class="tr-right">
              <span class="txn-amt" [class.pos]="t.amount >= 0" [class.neg]="t.amount < 0">
                {{ t.amount >= 0 ? '+' : '' }}&#8377;{{ t.amount | number:'1.2-2' }}
              </span>
              <span class="txn-st">{{ t.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wallet-page { background: #0a0401; min-height: 100vh; padding: 24px; color: #fff8ef; }
    .page-title { font-size: 22px; color: #f5c842; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; font-family: 'Teko',sans-serif; }
    .balance-hero { background: #1a0a02; border: 2px solid #d4a017; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px; }
    .balance-hero label { font-size: 11px; color: #a07850; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 8px; }
    .bal-big { font-size: 48px; font-weight: 700; color: #f5c842; font-family: 'Teko',sans-serif; }
    .wallet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 0; }
    .w-section { background: #1a0a02; border: 1px solid #3d1a05; border-radius: 8px; padding: 20px; }
    .mt20 { margin-top: 20px; }
    h2 { font-size: 15px; color: #f5c842; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
    .quick-amts { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
    .qa-btn { padding: 7px 14px; background: #2d1509; border: 1px solid #5a2e0e; color: #f5c842; border-radius: 4px; cursor: pointer; font-size: 13px; font-family: inherit; }
    .qa-btn:hover { background: #5a2e0e; border-color: #d4a017; }
    .field { margin-bottom: 12px; }
    .field label { display: block; font-size: 11px; color: #a07850; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px; }
    input { width: 100%; padding: 10px 12px; background: #0a0401; border: 1px solid #3d1a05; color: #fff8ef; border-radius: 4px; font-size: 13px; box-sizing: border-box; font-family: inherit; }
    input:focus { outline: none; border-color: #d4a017; }
    .btn-dep { width: 100%; padding: 13px; background: linear-gradient(180deg, #f5c842, #d4a017); color: #1a0a02; border: none; border-radius: 4px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; letter-spacing: 1px; }
    .btn-dep:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-dep:hover:not(:disabled) { filter: brightness(1.08); }
    .btn-wd { width: 100%; padding: 13px; background: #1a2a1a; color: #2ecc71; border: 1px solid #27ae60; border-radius: 4px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .txn-list { display: flex; flex-direction: column; gap: 4px; }
    .no-txn { color: #5a2e0e; font-size: 13px; text-align: center; padding: 20px; }
    .txn-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #1f0d03; border: 1px solid #3d1a05; border-radius: 4px; }
    .tr-left { display: flex; flex-direction: column; gap: 2px; }
    .txn-type { font-size: 11px; padding: 2px 8px; border-radius: 2px; text-transform: uppercase; letter-spacing: 1px; width: fit-content; }
    .deposit  { background: #0d4a1a; color: #2ecc71; }
    .withdrawal { background: #3d2000; color: #f39c12; }
    .bet_placed { background: #2d1509; color: #d4a017; }
    .bet_win { background: #0d4a1a; color: #2ecc71; }
    .txn-desc { font-size: 12px; color: #a07850; }
    .tr-right { text-align: right; }
    .txn-amt { display: block; font-size: 16px; font-weight: 600; }
    .txn-amt.pos { color: #2ecc71; }
    .txn-amt.neg { color: #e74c3c; }
    .txn-st { font-size: 11px; color: #a07850; }
    @media (max-width: 800px) { .wallet-grid { grid-template-columns: 1fr; } }
  `]
})
export class WalletComponent implements OnInit {
  txns = signal<Transaction[]>([]);
  depositing = signal(false);
  depAmt = 500;
  quickAmts = [100, 500, 1000, 2000, 5000, 10000];
  wd: any = {};
  auth: AuthService;

  constructor(private walletSvc: WalletService, auth: AuthService) { this.auth = auth; }

  ngOnInit(): void { this.walletSvc.getTransactions().subscribe(t => this.txns.set(t)); }

  initDeposit(): void {
    if (this.depAmt < 100) { alert('Minimum deposit ₹100'); return; }
    this.depositing.set(true);
    this.walletSvc.createDepositOrder(this.depAmt).subscribe({
      next: order => {
        const opts = {
          key: order.keyId, amount: this.depAmt * 100, currency: order.currency,
          order_id: order.orderId, name: 'Metro Matka', description: 'Wallet Deposit',
          prefill: { name: order.userName, email: order.userEmail },
          theme: { color: '#d4a017' },
          handler: (res: any) => {
            this.walletSvc.verifyPayment(res.razorpay_order_id, res.razorpay_payment_id, res.razorpay_signature).subscribe({
              next: () => {
                this.auth.updateBalance((this.auth.currentUser()?.balance || 0) + this.depAmt);
                this.walletSvc.getTransactions().subscribe(t => this.txns.set(t));
                alert('₹' + this.depAmt + ' added successfully!');
              }
            });
          }
        };
        const rzp = new (window as any).Razorpay(opts);
        rzp.open();
        this.depositing.set(false);
      },
      error: () => this.depositing.set(false)
    });
  }

  withdraw(): void {
    this.walletSvc.requestWithdrawal(this.wd).subscribe({
      next: () => alert('Withdrawal request submitted!'),
      error: e => alert(e?.error?.message || 'Withdrawal failed')
    });
  }
}
