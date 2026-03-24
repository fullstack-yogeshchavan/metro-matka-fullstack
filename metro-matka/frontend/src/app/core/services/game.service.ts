import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, Game, Draw, Bet, PlaceBetRequest } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private http: HttpClient) {}

  getGames(): Observable<Game[]> {
    return this.http.get<ApiResponse<Game[]>>(`${environment.apiUrl}/games`).pipe(map(r => r.data));
  }
  getGame(id: number): Observable<Game> {
    return this.http.get<ApiResponse<Game>>(`${environment.apiUrl}/games/${id}`).pipe(map(r => r.data));
  }
  getActiveDraw(gameId: number): Observable<Draw> {
    return this.http.get<ApiResponse<Draw>>(`${environment.apiUrl}/games/${gameId}/active-draw`).pipe(map(r => r.data));
  }
  getDrawHistory(gameId: number, page = 0, size = 10): Observable<Draw[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<Draw[]>>(`${environment.apiUrl}/games/${gameId}/history`, { params }).pipe(map(r => r.data));
  }
  placeBet(request: PlaceBetRequest): Observable<Bet[]> {
    return this.http.post<ApiResponse<Bet[]>>(`${environment.apiUrl}/bets`, request).pipe(map(r => r.data));
  }
  getMyBets(page = 0, size = 50): Observable<Bet[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<Bet[]>>(`${environment.apiUrl}/bets/my`, { params }).pipe(map(r => r.data));
  }
}
