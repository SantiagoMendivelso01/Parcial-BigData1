import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <a class="nav-brand" routerLink="/">🎵 CHINOoK</a>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Store</a>
        @if (auth.isLoggedIn()) {
          <a routerLink="/history" routerLinkActive="active">My Purchases</a>
        }
        @if (!auth.isLoggedIn()) {
          <a routerLink="/login" routerLinkActive="active" class="nav-link">Login</a>
          <a routerLink="/register" class="btn-nav-cta">Sign Up</a>
        } @else {
          <div class="nav-user">
            <span class="user-email">{{ auth.user()?.email }}</span>
            @if (auth.isAdmin()) {
              <span class="badge-admin">Admin</span>
            }
            <button class="btn-logout" (click)="logout()">Logout</button>
          </div>
        }
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  toast = inject(ToastService);

  logout() {
    this.auth.logout();
    this.toast.show('Logged out successfully', 'info');
  }
}
