import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngFor="let modal of modalService.modals$()">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">{{ modal.title }}</h2>
            <button 
              class="modal-close" 
              (click)="modalService.cancel_action(modal.id)"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          
          <div class="modal-body">
            <p class="modal-message">{{ modal.message }}</p>
          </div>
          
          <div class="modal-footer">
            @if (modal.type === 'confirm') {
              <button 
                class="btn btn-secondary" 
                (click)="modalService.cancel_action(modal.id)"
              >
                {{ modal.cancelText }}
              </button>
            }
            <button 
              class="btn btn-primary"
              [class.btn-danger]="modal.type === 'confirm'"
              (click)="modalService.confirm_action(modal.id)"
            >
              {{ modal.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    }

    .modal-dialog {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    .modal-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .modal-header {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .modal-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      flex: 1;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background-color: #f3f4f6;
      color: #111827;
    }

    .modal-body {
      padding: 24px;
      flex: 1;
      overflow-y: auto;
    }

    .modal-message {
      margin: 0;
      font-size: 15px;
      color: #374151;
      line-height: 1.6;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background-color: #f9fafb;
    }

    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 120px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transform: translateY(-2px);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-secondary {
      background-color: #e5e7eb;
      color: #111827;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #d1d5db;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .btn-secondary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-danger {
      background-color: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #dc2626;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    @keyframes slideIn {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @media (max-width: 640px) {
      .modal-dialog {
        width: 95%;
        max-height: 90vh;
      }

      .modal-header {
        padding: 16px;
      }

      .modal-body {
        padding: 16px;
      }

      .modal-footer {
        padding: 12px 16px;
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class ModalContainerComponent {
  modalService = inject(ModalService);
}

