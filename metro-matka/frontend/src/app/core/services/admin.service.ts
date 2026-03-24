import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, User, Bet, Game, AdminStats } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getUsers(page = 0, size = 20): Observable<User[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<User[]>>(`${environment.apiUrl}/admin/users`, { params }).pipe(map(r => r.data));
  }
  blockUser(id: number): Observable<any> { return this.http.patch(`${environment.apiUrl}/admin/users/${id}/block`, {}); }
  unblockUser(id: number): Observable<any> { return this.http.patch(`${environment.apiUrl}/admin/users/${id}/unblock`, {}); }
  createGame(data: any): Observable<Game> {
    return this.http.post<ApiResponse<Game>>(`${environment.apiUrl}/admin/games`, data).pipe(map(r => r.data));
  }
  updateGame(id: number, data: any): Observable<Game> {
    return this.http.patch<ApiResponse<Game>>(`${environment.apiUrl}/admin/games/${id}`, data).pipe(map(r => r.data));
  }
  triggerManualDraw(gameId: number, result: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/games/${gameId}/draw/manual`, { result });
  }
  getStats(): Observable<AdminStats> {
    return this.http.get<ApiResponse<AdminStats>>(`${environment.apiUrl}/admin/stats`).pipe(map(r => r.data));
  }
  getAllBets(page = 0, size = 50): Observable<Bet[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<Bet[]>>(`${environment.apiUrl}/admin/bets`, { params }).pipe(map(r => r.data));
  }
}
