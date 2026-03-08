import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toast.toast()) {
      <div class="toast" [class]="'toast-' + toast.toast()!.type">
        <span class="toast-icon">{{ icons[toast.toast()!.type] }}</span>
        <span>{{ toast.toast()!.message }}</span>
      </div>
    }
  `
})
export class ToastComponent {
  toast = inject(ToastService);
  icons: Record<string, string> = {
    success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
  };
}
