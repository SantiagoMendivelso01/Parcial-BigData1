import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cart-panel">
      <div class="cart-header">
        <h3>Cart <span class="cart-badge">{{ cart.count() }}</span></h3>
      </div>

      @if (cart.count() === 0) {
        <div class="cart-empty">
          <span>🛒</span>
          <p>Your cart is empty</p>
        </div>
      } @else {
        <ul class="cart-items">
          @for (item of cart.items(); track item.TrackId) {
            <li class="cart-item">
              <div class="cart-item-info">
                <span class="cart-item-name">{{ item.Name }}</span>
                <span class="cart-item-artist">{{ item.ArtistName }}</span>
              </div>
              <span class="cart-item-price">\${{ item.UnitPrice.toFixed(2) }}</span>
              <button class="btn-remove" (click)="cart.remove(item.TrackId)">✕</button>
            </li>
          }
        </ul>

        <div class="cart-total">
          Total <strong>\${{ cart.total().toFixed(2) }}</strong>
        </div>

        <form class="billing-form" #billingForm="ngForm" (ngSubmit)="purchase(billingForm)">
          <p class="billing-label">Billing Details</p>

          <input
            name="address" [(ngModel)]="billing.address"
            placeholder="Address *" required
            #addressCtrl="ngModel"
            [class.field-error-input]="addressCtrl.invalid && addressCtrl.touched"
          />
          @if (addressCtrl.invalid && addressCtrl.touched) {
            <span class="field-error">Address is required</span>
          }

          <div class="billing-row">
            <div>
              <input
                name="city" [(ngModel)]="billing.city"
                placeholder="City *" required
                #cityCtrl="ngModel"
                [class.field-error-input]="cityCtrl.invalid && cityCtrl.touched"
              />
              @if (cityCtrl.invalid && cityCtrl.touched) {
                <span class="field-error">Required</span>
              }
            </div>
            <div>
              <input
                name="country" [(ngModel)]="billing.country"
                placeholder="Country *" required
                #countryCtrl="ngModel"
                [class.field-error-input]="countryCtrl.invalid && countryCtrl.touched"
              />
              @if (countryCtrl.invalid && countryCtrl.touched) {
                <span class="field-error">Required</span>
              }
            </div>
          </div>

          <button class="btn-purchase" type="submit" [disabled]="purchasing()">
            {{ purchasing() ? 'Processing...' : 'Complete Purchase' }}
          </button>
        </form>
      }
    </div>
  `
})
export class CartComponent {
  cart = inject(CartService);
  private invoiceService = inject(InvoiceService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  purchasing = signal(false);
  billing = { address: '', city: '', country: '' };

  purchase(form: NgForm) {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please login to purchase', 'warning');
      this.router.navigate(['/login']);
      return;
    }
    if (form.invalid) { form.form.markAllAsTouched(); return; }

    this.purchasing.set(true);
    this.invoiceService.purchase({
      items: this.cart.items().map(i => ({ track_id: i.TrackId, quantity: i.qty })),
      billing_address: this.billing.address,
      billing_city: this.billing.city,
      billing_country: this.billing.country,
    }).subscribe({
      next: inv => {
        this.toast.show(`Purchase successful! Invoice #${inv.InvoiceId} — $${inv.Total.toFixed(2)}`, 'success');
        this.cart.clear();
        form.resetForm();
        this.billing = { address: '', city: '', country: '' };
        this.purchasing.set(false);
      },
      error: err => {
        this.toast.show(err.error?.detail || 'Purchase failed', 'error');
        this.purchasing.set(false);
      }
    });
  }
}
