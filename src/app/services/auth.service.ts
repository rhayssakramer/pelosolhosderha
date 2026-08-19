import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'blog_auth_token';
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  isLoggedIn = signal(false);

  constructor(private router: Router) {
    this.checkSession();
  }

  private checkSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const token = localStorage.getItem(this.STORAGE_KEY);
      if (token) {
        this.isLoggedIn.set(true);
      }
    } catch (e) {
      // localStorage might not be available
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const token = localStorage.getItem(this.STORAGE_KEY);
      return token;
    } catch (e) {
      return null;
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
          `${this.API_URL}/login`,
          { email, password }
        )
      );
      if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem(this.STORAGE_KEY, response.token);
        } catch (e) {
          console.warn('Could not store token in localStorage:', e);
        }
      }
      this.isLoggedIn.set(true);
      return { success: true };
    } catch (err: any) {
      const message = err?.error?.error || 'Erro ao fazer login';
      return { success: false, error: message };
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (e) {
        console.warn('Could not clear localStorage:', e);
      }
    }
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
}
