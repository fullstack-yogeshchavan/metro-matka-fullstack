import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'metro_access_token';
  private readonly REFRESH_KEY = 'metro_refresh_token';
  private readonly USER_KEY = 'metro_user';

  private _user = signal<AuthResponse | null>(this.loadUser());
  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isAdmin = computed(() => {
    const r = this._user()?.role;
    return r === 'ADMIN' || r === 'SUPER_ADMIN';
  });

  constructor(private http: HttpClient, private router: Router) {}

  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap(res => this.save(res.data)));
  }

  login(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, data)
      .pipe(tap(res => this.save(res.data)));
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe();
    this.clear();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const token = localStorage.getItem(this.REFRESH_KEY) || '';
    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/refresh`, {},
      { headers: { 'X-Refresh-Token': token } }
    ).pipe(
      tap(res => this.save(res.data)),
      catchError(err => { this.clear(); this.router.navigate(['/auth/login']); return throwError(() => err); })
    );
  }

  getAccessToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }

  updateBalance(balance: number): void {
    const user = this._user();
    if (user) {
      const updated = { ...user, balance };
      this._user.set(updated);
      localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
    }
  }

  private save(data: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, data.accessToken);
    localStorage.setItem(this.REFRESH_KEY, data.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data));
    this._user.set(data);
  }

  private clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user.set(null);
  }

  private loadUser(): AuthResponse | null {
    try { const s = localStorage.getItem(this.USER_KEY); return s ? JSON.parse(s) : null; }
    catch { return null; }
  }
}
