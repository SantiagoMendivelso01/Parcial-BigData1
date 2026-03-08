import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Invoice, PurchaseRequest } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  constructor(private http: HttpClient) {}

  purchase(data: PurchaseRequest) {
    return this.http.post<Invoice>(`${environment.apiUrl}/api/invoices/purchase`, data);
  }

  getMyInvoices() {
    return this.http.get<Invoice[]>(`${environment.apiUrl}/api/invoices/my`);
  }
}
