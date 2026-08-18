import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare var google: any; // Google Sign-In SDK

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private readonly GOOGLE_STORAGE_KEY = 'google_comment_token';
  private readonly API_URL = `${environment.apiUrl}/auth/google`;
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  googleUser = signal<GoogleUser | null>(null);
  isGoogleLoggedIn = signal(false);
  googleToken = signal<string | null>(null);

  constructor() {
    this.checkGoogleSession();
    this.initializeGoogleSDK();
  }

  private initializeGoogleSDK(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Carregar SDK do Google
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  private checkGoogleSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const token = localStorage.getItem(this.GOOGLE_STORAGE_KEY);
      if (token) {
        this.verifyToken(token).subscribe({
          next: (result) => {
            if (result.valid) {
              this.isGoogleLoggedIn.set(true);
              this.googleToken.set(token);
            } else {
              this.logout();
            }
          },
          error: () => this.logout(),
        });
      }
    } catch (e) {
      // localStorage might not be available
    }
  }

  loginWithGoogle(googleToken: string): Promise<GoogleUser> {
    return new Promise((resolve, reject) => {
      this.http
        .post<any>(`${this.API_URL}/google`, { token: googleToken })
        .subscribe({
          next: (response) => {
            console.log('Google login response:', response);
            this.googleToken.set(response.token);
            this.googleUser.set(response.user);
            this.isGoogleLoggedIn.set(true);

            if (isPlatformBrowser(this.platformId)) {
              try {
                localStorage.setItem(this.GOOGLE_STORAGE_KEY, response.token);
              } catch (e) {
                console.error('Failed to save token', e);
              }
            }

            resolve(response.user);
          },
          error: (error) => {
            console.error('Google login error:', error);
            reject(error);
          },
        });
    });
  }

  verifyToken(token: string) {
    return this.http.post<any>(`${this.API_URL}/verify`, { token });
  }

  refreshToken(token: string) {
    return this.http.post<any>(`${this.API_URL}/refresh`, { token });
  }

  logout(): void {
    this.googleUser.set(null);
    this.isGoogleLoggedIn.set(false);
    this.googleToken.set(null);

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(this.GOOGLE_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to remove token', e);
      }
    }

    // Logout do Google
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
  }

  getGoogleToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.googleToken() || localStorage.getItem(this.GOOGLE_STORAGE_KEY);
  }
}
