import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts$(); track toast.id) {
        <div 
          class="toast" 
          [class]="'toast-' + toast.type"
          [@toastAnimation]
          (click)="toastService.remove(toast.id)"
        >
          <div class="toast-content">
            <span class="toast-icon">
              @switch (toast.type) {
                @case ('success') { ✅ }
                @case ('error') { ❌ }
                @case ('warning') { ⚠️ }
                @case ('info') { ℹ️ }
              }
            </span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
          <div class="toast-progress" [style.animation-duration.ms]="toast.duration"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    }

    .toast {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid;
      transition: all 0.3s ease;
    }

    .toast:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      transform: translateX(-5px);
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .toast-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .toast-message {
      font-size: 14px;
      font-weight: 500;
      word-break: break-word;
      white-space: normal;
    }

    /* Toast types */
    .toast-success {
      border-left-color: #22c55e;
      background: linear-gradient(135deg, #f0fdf4 0%, #fff 100%);
    }

    .toast-success .toast-icon {
      color: #22c55e;
    }

    .toast-success .toast-message {
      color: #166534;
    }

    .toast-error {
      border-left-color: #ef4444;
      background: linear-gradient(135deg, #fef2f2 0%, #fff 100%);
    }

    .toast-error .toast-icon {
      color: #ef4444;
    }

    .toast-error .toast-message {
      color: #991b1b;
    }

    .toast-warning {
      border-left-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, #fff 100%);
    }

    .toast-warning .toast-icon {
      color: #f59e0b;
    }

    .toast-warning .toast-message {
      color: #92400e;
    }

    .toast-info {
      border-left-color: #3b82f6;
      background: linear-gradient(135deg, #eff6ff 0%, #fff 100%);
    }

    .toast-info .toast-icon {
      color: #3b82f6;
    }

    .toast-info .toast-message {
      color: #1e40af;
    }

    /* Progress bar animation */
    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      animation: progress linear forwards;
    }

    .toast-success .toast-progress {
      background: #22c55e;
    }

    .toast-error .toast-progress {
      background: #ef4444;
    }

    .toast-warning .toast-progress {
      background: #f59e0b;
    }

    .toast-info .toast-progress {
      background: #3b82f6;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    @media (max-width: 600px) {
      .toast-container {
        left: 10px;
        right: 10px;
        max-width: none;
      }

      .toast {
        margin-bottom: 8px;
      }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
