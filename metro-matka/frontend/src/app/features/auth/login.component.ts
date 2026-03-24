import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="logo-wrap">
          <div class="logo-main">METRO</div>
          <div class="logo-sub">MATKA SYSTEM</div>
        </div>
        <h2>Sign In</h2>

        <!-- Default credentials hint -->
        <div class="creds-hint">
          <div class="cred-row"><span class="cred-label">Admin</span><span class="cred-val">admin / admin123</span></div>
          <div class="cred-row"><span class="cred-label">Player</span><span class="cred-val">player1 / player123</span></div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Username</label>
            <input formControlName="usernameOrEmail" type="text"
                   placeholder="admin  or  player1"
                   autocomplete="username" />
            <span class="err" *ngIf="form.get('usernameOrEmail')?.touched && form.get('usernameOrEmail')?.invalid">
              Required
            </span>
          </div>
          <div class="field">
            <label>Password</label>
            <input formControlName="password" type="password"
                   placeholder="admin123  or  player123"
                   autocomplete="current-password" />
            <span class="err" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">
              Required
            </span>
          </div>

          <div class="err-banner" *ngIf="errMsg()">
            {{ errMsg() }}
            <div class="err-hint">
              Make sure the backend is running and visit
              <a href="http://localhost:8080/api/setup/reset" target="_blank" class="reset-link">
                /api/setup/reset
              </a>
              to reset passwords.
            </div>
          </div>

          <button type="submit" class="btn-main" [disabled]="loading()">
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="auth-link">No account? <a routerLink="/auth/register">Register</a></p>
        <p class="reset-info">
          Login not working?
          <a href="http://localhost:8080/api/setup/reset" target="_blank">Reset credentials</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0a0401; }
    .auth-card { background:#1a0a02; border:2px solid #d4a017; border-radius:8px; padding:36px; width:100%; max-width:400px; text-align:center; }
    .logo-main { font-size:40px; font-weight:700; color:#f5c842; letter-spacing:6px; font-family:'Teko',sans-serif; }
    .logo-sub { font-size:12px; color:#a07850; letter-spacing:4px; text-transform:uppercase; margin-top:-4px; margin-bottom:12px; }
    h2 { color:#fff8ef; font-size:18px; margin-bottom:14px; }

    .creds-hint { background:#0a0401; border:1px solid #3d1a05; border-radius:4px; padding:10px 12px; margin-bottom:18px; }
    .cred-row { display:flex; justify-content:space-between; align-items:center; padding:3px 0; font-size:13px; }
    .cred-label { color:#a07850; letter-spacing:1px; }
    .cred-val { color:#f5c842; font-family:monospace; font-size:14px; background:#1f0d03; padding:2px 8px; border-radius:3px; cursor:pointer; }

    .field { text-align:left; margin-bottom:14px; }
    label { display:block; color:#a07850; font-size:11px; letter-spacing:1px; text-transform:uppercase; margin-bottom:5px; }
    input { width:100%; padding:12px 14px; background:#0a0401; border:1px solid #3d1a05; color:#fff8ef; border-radius:4px; font-size:14px; box-sizing:border-box; font-family:inherit; }
    input:focus { outline:none; border-color:#d4a017; }
    input::placeholder { color:#5a2e0e; }
    .err { color:#e74c3c; font-size:11px; }

    .err-banner { background:#3d0000; border:1px solid #6b0000; color:#e74c3c; padding:10px 12px; border-radius:4px; font-size:13px; margin-bottom:14px; text-align:left; }
    .err-hint { margin-top:6px; font-size:11px; color:#a07850; }
    .reset-link { color:#f5c842; }

    .btn-main { width:100%; padding:14px; background:linear-gradient(180deg,#f5c842,#d4a017); color:#1a0a02; border:none; border-radius:4px; font-size:16px; font-weight:700; cursor:pointer; letter-spacing:1px; font-family:inherit; margin-top:4px; }
    .btn-main:hover:not(:disabled) { filter:brightness(1.08); }
    .btn-main:disabled { opacity:0.6; cursor:not-allowed; }

    .auth-link { color:#a07850; font-size:13px; margin-top:16px; }
    .auth-link a { color:#f5c842; text-decoration:none; }
    .reset-info { margin-top:10px; font-size:12px; color:#5a2e0e; }
    .reset-info a { color:#a07850; }
    .reset-info a:hover { color:#f5c842; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  errMsg = signal('');

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required]
    });
    if (this.auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errMsg.set('');
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        const msg = e?.error?.message || e?.message || 'Login failed';
        this.errMsg.set(msg);
        this.loading.set(false);
      }
    });
  }
}
