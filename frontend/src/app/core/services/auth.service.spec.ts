import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with null user when localStorage is empty', () => {
    expect(service.user()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should set user and token after login', () => {
    const mockResponse = {
      access_token: 'test-token',
      token_type: 'bearer',
      user: { id: 1, email: 'test@test.com', role: 'user', customer_id: 1 }
    };

    service.login({ email: 'test@test.com', password: 'password' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/auth/login'));
    req.flush(mockResponse);

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.user()?.email).toBe('test@test.com');
    expect(service.getToken()).toBe('test-token');
  });

  it('should clear user on logout', () => {
    service.logout();
    expect(service.user()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });

  it('should identify admin role correctly', () => {
    const mockResponse = {
      access_token: 'admin-token',
      token_type: 'bearer',
      user: { id: 2, email: 'admin@test.com', role: 'admin', customer_id: null }
    };

    service.login({ email: 'admin@test.com', password: 'pass' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/auth/login'));
    req.flush(mockResponse);

    expect(service.isAdmin()).toBeTrue();
  });
});
