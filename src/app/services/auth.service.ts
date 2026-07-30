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
    console.log('[AuthService] Constructor called, platformId:', this.platformId);
    console.log('[AuthService] isPlatformBrowser(platformId):', isPlatformBrowser(this.platformId));
    this.checkSession();
  }

  private checkSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = localStorage.getItem(this.STORAGE_KEY);
    if (token) {
      this.isLoggedIn.set(true);
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[AuthService] Not in browser, getToken() returning null');
      return null;
    }
    const token = localStorage.getItem(this.STORAGE_KEY);
    console.log('[AuthService] getToken():', token ? `Token found (${token.substring(0, 20)}...)` : 'No token in localStorage');
    return token;
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[AuthService] Attempting login for:', email);
      const response = await firstValueFrom(
        this.http.post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
          `${this.API_URL}/login`,
          { email, password }
        )
      );
      console.log('[AuthService] Login successful, saving token');
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.STORAGE_KEY, response.token);
        console.log('[AuthService] Token saved to localStorage');
      } else {
        console.log('[AuthService] WARNING: Not in browser, token not saved!');
      }
      this.isLoggedIn.set(true);
      return { success: true };
    } catch (err: any) {
      console.error('[AuthService] Login failed:', err?.error?.error);
      const message = err?.error?.error || 'Erro ao fazer login';
      return { success: false, error: message };
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(this.STORAGE_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
}
