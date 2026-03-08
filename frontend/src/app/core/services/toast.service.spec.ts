import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with null toast', () => {
    expect(service.toast()).toBeNull();
  });

  it('should show a success toast', () => {
    service.show('Purchase complete!');
    expect(service.toast()?.message).toBe('Purchase complete!');
    expect(service.toast()?.type).toBe('success');
  });

  it('should show an error toast', () => {
    service.show('Something failed', 'error');
    expect(service.toast()?.type).toBe('error');
  });

  it('should auto-clear toast after 3.5s', fakeAsync(() => {
    service.show('Test message');
    expect(service.toast()).not.toBeNull();
    tick(3500);
    expect(service.toast()).toBeNull();
  }));
});
