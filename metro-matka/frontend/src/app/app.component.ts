import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">
      <nav class="navbar" *ngIf="auth.isLoggedIn()">
        <a class="nav-logo" routerLink="/dashboard">Metro <span>Matka</span></a>
        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/wallet"    routerLinkActive="active">Wallet</a>
          <a routerLink="/admin"     routerLinkActive="active" *ngIf="auth.isAdmin()">Admin</a>
        </div>
        <div class="nav-right">
          <span class="nav-user">{{ auth.currentUser()?.username }}</span>
          <span class="nav-bal">&#8377;{{ auth.currentUser()?.balance | number:'1.2-2' }}</span>
          <button class="btn-logout" (click)="auth.logout()">Logout</button>
        </div>
      </nav>
      <router-outlet />
    </div>
  `,
  styles: [`
    .app-shell { min-height: 100vh; background: #0a0401; }
    .navbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: #1a0a02; border-bottom: 2px solid #d4a017; }
    .nav-logo { font-size: 22px; font-weight: 700; color: #f5c842; text-decoration: none; letter-spacing: 3px; text-transform: uppercase; }
    .nav-logo span { color: #a07850; font-size: 14px; }
    .nav-links { display: flex; gap: 20px; }
    .nav-links a { color: #a07850; text-decoration: none; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; padding-bottom: 4px; border-bottom: 2px solid transparent; }
    .nav-links a.active, .nav-links a:hover { color: #f5c842; border-bottom-color: #d4a017; }
    .nav-right { display: flex; align-items: center; gap: 16px; }
    .nav-user { color: #f5c842; font-size: 14px; }
    .nav-bal { color: #2ecc71; font-size: 16px; font-weight: 600; }
    .btn-logout { padding: 6px 14px; background: transparent; border: 1px solid #6b0000; color: #e74c3c; border-radius: 3px; cursor: pointer; font-size: 13px; }
    .btn-logout:hover { background: #6b0000; }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
