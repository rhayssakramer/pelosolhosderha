import { Injectable, signal, computed } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  toasts$ = computed(() => this.toasts());
  
  private toastIdCounter = 0;

  constructor() {}

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 4000): string {
    const id = `toast-${++this.toastIdCounter}`;
    const toast: Toast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now()
    };

    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  success(message: string, duration: number = 4000): string {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): string {
    return this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 4000): string {
    return this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 4000): string {
    return this.show(message, 'warning', duration);
  }

  remove(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
