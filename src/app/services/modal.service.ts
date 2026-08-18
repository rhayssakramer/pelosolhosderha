import { Injectable, signal } from '@angular/core';

export type ModalType = 'confirm' | 'alert' | 'custom';

export interface Modal {
  id: string;
  type: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  resolve?: (value: boolean) => void;
  reject?: (reason?: any) => void;
  customContent?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals = signal<Modal[]>([]);
  modals$ = this.modals.asReadonly();
  
  private modalIdCounter = 0;

  confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const id = `modal-${++this.modalIdCounter}`;
      const modal: Modal = {
        id,
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        isConfirming: false,
        resolve,
      };

      this.modals.update(m => [...m, modal]);
    });
  }

  alert(title: string, message: string, confirmText: string = 'OK'): Promise<boolean> {
    return new Promise((resolve) => {
      const id = `modal-${++this.modalIdCounter}`;
      const modal: Modal = {
        id,
        type: 'alert',
        title,
        message,
        confirmText,
        isConfirming: false,
        resolve,
      };

      this.modals.update(m => [...m, modal]);
    });
  }

  confirm_action(id: string): void {
    const modals = this.modals();
    const modal = modals.find(m => m.id === id);
    if (modal?.resolve) {
      modal.resolve(true);
      setTimeout(() => this.remove(id), 300);
    }
  }

  cancel_action(id: string): void {
    const modals = this.modals();
    const modal = modals.find(m => m.id === id);
    if (modal?.resolve) {
      modal.resolve(false);
      this.remove(id);
    }
  }

  remove(id: string): void {
    this.modals.update(m => m.filter(mod => mod.id !== id));
  }

  clear(): void {
    this.modals.set([]);
  }
}
