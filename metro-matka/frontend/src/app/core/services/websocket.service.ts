import { Injectable, signal } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs'; // ✅ FIX
import { TimerEvent, DrawResultEvent } from '../../shared/models';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

declare var SockJS: any;

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  subs:StompSubscription[] = [];
  private client: Client | null = null;

  timerEvent = signal<TimerEvent | null>(null);
  drawResult = signal<DrawResultEvent | null>(null);
  bettingClosed = signal<boolean>(false);

  connect(): void {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${environment.wsUrl}/ws`),
      reconnectDelay: 5000,
      debug: () => {}
    });

    this.client.activate();
  }

 
subscribeTimer(gameId: number, cb: (e: TimerEvent) => void): StompSubscription | undefined {
  return this.client?.subscribe(`/topic/timer/${gameId}`, (msg: IMessage) => {
    const e: TimerEvent = JSON.parse(msg.body);
    this.timerEvent.set(e);
    cb(e);
  });
}

subscribeResult(gameId: number, cb: (e: DrawResultEvent) => void): StompSubscription | undefined {
  return this.client?.subscribe(`/topic/result/${gameId}`, (msg: IMessage) => {
    const e: DrawResultEvent = JSON.parse(msg.body);
    this.drawResult.set(e);
    cb(e);
  });
}

subscribeBettingClosed(gameId: number, cb: () => void): StompSubscription | undefined {
  return this.client?.subscribe(`/topic/betting-closed/${gameId}`, () => {
    this.bettingClosed.set(true);
    cb();
  });
}

  disconnect(): void {
    this.client?.deactivate();
  }
}