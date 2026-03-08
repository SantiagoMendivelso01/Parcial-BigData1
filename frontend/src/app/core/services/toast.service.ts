import { Injectable, signal } from '@angular/core';
import { Toast } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toast = signal<Toast | null>(null);

  show(message: string, type: Toast['type'] = 'success') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
