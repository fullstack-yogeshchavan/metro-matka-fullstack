import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PaymentOrder, Transaction } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(private http: HttpClient) {}

  createDepositOrder(amount: number): Observable<PaymentOrder> {
    const params = new HttpParams().set('amount', amount);
    return this.http.post<ApiResponse<PaymentOrder>>(`${environment.apiUrl}/wallet/deposit/create-order`, {}, { params }).pipe(map(r => r.data));
  }
  verifyPayment(orderId: string, paymentId: string, signature: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/wallet/deposit/verify`,
      { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature });
  }
  requestWithdrawal(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/wallet/withdraw`, data);
  }
  getTransactions(page = 0, size = 20): Observable<Transaction[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<Transaction[]>>(`${environment.apiUrl}/wallet/transactions`, { params }).pipe(map(r => r.data));
  }
}
