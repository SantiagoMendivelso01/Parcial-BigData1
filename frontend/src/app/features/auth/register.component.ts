import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-icon">🎵</div>
        <h2>Create Account</h2>
        <p class="auth-sub">Join the music store</p>

        <form #regForm="ngForm" (ngSubmit)="submit(regForm)">
          <div class="form-row">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" name="first_name" [(ngModel)]="form.first_name"
                placeholder="John" required #fnCtrl="ngModel"
                [class.field-error-input]="fnCtrl.invalid && fnCtrl.touched" />
              @if (fnCtrl.invalid && fnCtrl.touched) {
                <span class="field-error">Required</span>
              }
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" name="last_name" [(ngModel)]="form.last_name"
                placeholder="Doe" required #lnCtrl="ngModel"
                [class.field-error-input]="lnCtrl.invalid && lnCtrl.touched" />
              @if (lnCtrl.invalid && lnCtrl.touched) {
                <span class="field-error">Required</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" [(ngModel)]="form.email"
              placeholder="you@example.com" required email #emCtrl="ngModel"
              [class.field-error-input]="emCtrl.invalid && emCtrl.touched" />
            @if (emCtrl.errors?.['required'] && emCtrl.touched) {
              <span class="field-error">Email is required</span>
            }
            @if (emCtrl.errors?.['email'] && emCtrl.touched) {
              <span class="field-error">Invalid email</span>
            }
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" [(ngModel)]="form.password"
              placeholder="Min 6 characters" required minlength="6" #pwCtrl="ngModel"
              [class.field-error-input]="pwCtrl.invalid && pwCtrl.touched" />
            @if (pwCtrl.errors?.['required'] && pwCtrl.touched) {
              <span class="field-error">Password is required</span>
            }
            @if (pwCtrl.errors?.['minlength'] && pwCtrl.touched) {
              <span class="field-error">Minimum 6 characters</span>
            }
          </div>

          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirm" [(ngModel)]="form.confirm"
              placeholder="Repeat password" required #cfCtrl="ngModel"
              [class.field-error-input]="cfCtrl.touched && form.confirm !== form.password" />
            @if (cfCtrl.touched && form.confirm !== form.password) {
              <span class="field-error">Passwords do not match</span>
            }
          </div>

          <button class="btn-auth" type="submit" [disabled]="loading()">
            {{ loading() ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="auth-switch">
          Already have an account? <a routerLink="/login">Login</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = { email: '', password: '', confirm: '', first_name: '', last_name: '' };
  loading = signal(false);

  submit(f: NgForm) {
    if (f.invalid || this.form.password !== this.form.confirm) {
      f.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.register({
      email: this.form.email,
      password: this.form.password,
      first_name: this.form.first_name,
      last_name: this.form.last_name,
    }).subscribe({
      next: () => {
        this.toast.show('Account created! Welcome 🎵', 'success');
        this.router.navigate(['/']);
      },
      error: err => {
        this.toast.show(err.error?.detail || 'Registration failed', 'error');
        this.loading.set(false);
      }
    });
  }
}
