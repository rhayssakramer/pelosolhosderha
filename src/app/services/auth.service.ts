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
    const token = localStorage.getItem(this.STORAGE_KEY);
    if (token) {
      this.isLoggedIn.set(true);
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.STORAGE_KEY);
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
          `${this.API_URL}/login`,
          { email, password }
        )
      );
      if (this.isBrowser) {
        localStorage.setItem(this.STORAGE_KEY, response.token);
      }
      this.isLoggedIn.set(true);
      return { success: true };
    } catch (err: any) {
      const message = err?.error?.error || 'Erro ao fazer login';
      return { success: false, error: message };
    }
  }

  logout(): void {
    if (this.isBrowser) localStorage.removeItem(this.STORAGE_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
}
