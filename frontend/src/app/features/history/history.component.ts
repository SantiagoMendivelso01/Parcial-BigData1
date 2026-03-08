import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../core/services/invoice.service';
import { ToastService } from '../../core/services/toast.service';
import { Invoice } from '../../shared/models/models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="history-page">
      <h1 class="history-title">My Purchases</h1>

      @if (loading()) {
        <div class="loading-state"><div class="spinner"></div></div>
      } @else if (invoices().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">🧾</span>
          <p>No purchases yet. Go buy some music!</p>
        </div>
      } @else {
        <div class="invoices-list">
          @for (inv of invoices(); track inv.InvoiceId) {
            <div class="invoice-card">
              <div class="invoice-header" (click)="toggle(inv.InvoiceId)">
                <div class="invoice-left">
                  <span class="invoice-id">Invoice #{{ inv.InvoiceId }}</span>
                  <span class="invoice-date">{{ inv.InvoiceDate | date:'mediumDate' }}</span>
                </div>
                <div class="invoice-right">
                  <span class="invoice-total">\${{ inv.Total.toFixed(2) }}</span>
                  <span class="invoice-chevron">{{ expanded() === inv.InvoiceId ? '▲' : '▼' }}</span>
                </div>
              </div>

              @if (expanded() === inv.InvoiceId) {
                <div class="invoice-body">
                  <p class="billing-addr">
                    📍 {{ inv.BillingAddress }}, {{ inv.BillingCity }}, {{ inv.BillingCountry }}
                  </p>
                  <table class="invoice-table">
                    <thead>
                      <tr><th>Track</th><th>Price</th><th>Qty</th></tr>
                    </thead>
                    <tbody>
                      @for (line of inv.items; track line.InvoiceLineId) {
                        <tr>
                          <td>{{ line.track_name }}</td>
                          <td>\${{ line.UnitPrice.toFixed(2) }}</td>
                          <td>{{ line.Quantity }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class HistoryComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private toast = inject(ToastService);

  invoices = signal<Invoice[]>([]);
  loading = signal(true);
  expanded = signal<number | null>(null);

  ngOnInit() {
    this.invoiceService.getMyInvoices().subscribe({
      next: data => { this.invoices.set(data); this.loading.set(false); },
      error: err => {
        this.toast.show('Failed to load history', 'error');
        this.loading.set(false);
      }
    });
  }

  toggle(id: number) {
    this.expanded.set(this.expanded() === id ? null : id);
  }
}
