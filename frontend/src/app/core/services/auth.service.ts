import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem('chinook_token'));

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    const saved = localStorage.getItem('chinook_user');
    return saved ? JSON.parse(saved) : null;
  }

  getToken(): string | null {
    return this._token();
  }

  register(data: { email: string; password: string; first_name: string; last_name: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, data).pipe(
      tap(res => this.setSession(res))
    );
  }

  login(data: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, data).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('chinook_user');
    localStorage.removeItem('chinook_token');
    this.router.navigate(['/']);
  }

  private setSession(res: AuthResponse) {
    this._user.set(res.user);
    this._token.set(res.access_token);
    localStorage.setItem('chinook_user', JSON.stringify(res.user));
    localStorage.setItem('chinook_token', res.access_token);
  }
}
