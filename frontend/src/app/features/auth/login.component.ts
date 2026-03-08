import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-icon">🔐</div>
        <h2>Welcome Back</h2>
        <p class="auth-sub">Sign in to your account</p>

        <form #loginForm="ngForm" (ngSubmit)="submit(loginForm)">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email" name="email" [(ngModel)]="form.email"
              placeholder="you@example.com"
              required email #emailCtrl="ngModel"
              [class.field-error-input]="emailCtrl.invalid && emailCtrl.touched"
            />
            @if (emailCtrl.errors?.['required'] && emailCtrl.touched) {
              <span class="field-error">Email is required</span>
            }
            @if (emailCtrl.errors?.['email'] && emailCtrl.touched) {
              <span class="field-error">Invalid email format</span>
            }
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              type="password" name="password" [(ngModel)]="form.password"
              placeholder="••••••••"
              required #pwCtrl="ngModel"
              [class.field-error-input]="pwCtrl.invalid && pwCtrl.touched"
            />
            @if (pwCtrl.invalid && pwCtrl.touched) {
              <span class="field-error">Password is required</span>
            }
          </div>

          <button class="btn-auth" type="submit" [disabled]="loading()">
            {{ loading() ? 'Signing in...' : 'Login' }}
          </button>
        </form>

        <p class="auth-switch">
          Don't have an account?
          <a routerLink="/register">Sign up</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = { email: '', password: '' };
  loading = signal(false);

  submit(f: any) {
    if (f.invalid) { f.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.auth.login(this.form).subscribe({
      next: () => {
        this.toast.show('Welcome back! 🎵', 'success');
        this.router.navigate(['/']);
      },
      error: err => {
        this.toast.show(err.error?.detail || 'Login failed', 'error');
        this.loading.set(false);
      }
    });
  }
}
