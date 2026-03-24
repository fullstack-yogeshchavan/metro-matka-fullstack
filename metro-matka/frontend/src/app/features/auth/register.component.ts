import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="logo-wrap">
          <div class="logo-main">METRO</div>
          <div class="logo-sub">MATKA SYSTEM</div>
        </div>
        <h2>Create Account</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field-row">
            <div class="field">
              <label>Username</label>
              <input formControlName="username" placeholder="e.g. lucky777" />
              <span class="err" *ngIf="hasErr('username','minlength')">Min 3 chars</span>
            </div>
            <div class="field">
              <label>Phone</label>
              <input formControlName="phoneNumber" placeholder="9876543210" />
              <span class="err" *ngIf="hasErr('phoneNumber','pattern')">Invalid</span>
            </div>
          </div>
          <div class="field">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="you@email.com" />
            <span class="err" *ngIf="hasErr('email','email')">Valid email required</span>
          </div>
          <div class="field">
            <label>Password</label>
            <input formControlName="password" type="password" placeholder="Min 6 chars, upper+lower+digit" />
            <span class="err" *ngIf="hasErr('password','pattern')">Needs upper, lower & number</span>
          </div>
          <div class="err-banner" *ngIf="errMsg()">{{ errMsg() }}</div>
          <div class="ok-banner"  *ngIf="okMsg()">{{ okMsg() }}</div>
          <button type="submit" class="btn-main" [disabled]="loading()">
            {{ loading() ? 'Creating...' : 'Create Account' }}
          </button>
        </form>
        <p class="auth-link">Have account? <a routerLink="/auth/login">Login</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0401; }
    .auth-card { background: #1a0a02; border: 2px solid #d4a017; border-radius: 8px; padding: 40px; width: 100%; max-width: 440px; text-align: center; }
    .logo-wrap { margin-bottom: 10px; }
    .logo-main { font-size: 38px; font-weight: 700; color: #f5c842; letter-spacing: 6px; font-family: 'Teko', sans-serif; }
    .logo-sub { font-size: 12px; color: #a07850; letter-spacing: 4px; text-transform: uppercase; margin-top: -4px; }
    h2 { color: #fff8ef; font-size: 18px; margin: 14px 0 18px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field { text-align: left; margin-bottom: 14px; }
    label { display: block; color: #a07850; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px; }
    input { width: 100%; padding: 11px 12px; background: #0a0401; border: 1px solid #3d1a05; color: #fff8ef; border-radius: 4px; font-size: 13px; box-sizing: border-box; font-family: inherit; }
    input:focus { outline: none; border-color: #d4a017; }
    .err { color: #e74c3c; font-size: 11px; }
    .err-banner { background: #3d0000; color: #e74c3c; padding: 8px; border-radius: 4px; font-size: 12px; margin-bottom: 12px; }
    .ok-banner  { background: #0d4a1a; color: #2ecc71; padding: 8px; border-radius: 4px; font-size: 12px; margin-bottom: 12px; }
    .btn-main { width: 100%; padding: 13px; background: linear-gradient(180deg, #f5c842, #d4a017); color: #1a0a02; border: none; border-radius: 4px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .btn-main:hover:not(:disabled) { filter: brightness(1.08); }
    .btn-main:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-link { color: #a07850; font-size: 13px; margin-top: 18px; }
    .auth-link a { color: #f5c842; text-decoration: none; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);
  errMsg = signal('');
  okMsg = signal('');

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username:    ['', [Validators.required, Validators.minLength(3)]],
      email:       ['', [Validators.required, Validators.email]],
      password:    ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
      phoneNumber: ['', [Validators.pattern(/^[6-9]\d{9}$/)]]
    });
  }

  hasErr(f: string, e: string): boolean {
    const c = this.form.get(f);
    return !!(c?.touched && c?.hasError(e));
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.auth.register(this.form.value).subscribe({
      next: () => { this.okMsg.set('Account created! Redirecting...'); setTimeout(() => this.router.navigate(['/dashboard']), 1200); },
      error: (e) => { this.errMsg.set(e?.error?.message || 'Registration failed'); this.loading.set(false); }
    });
  }
}
