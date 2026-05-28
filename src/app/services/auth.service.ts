import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ALLOWED_EMAIL = 'rhakramer@gmail.com';
  private readonly STORAGE_KEY = 'blog_auth';
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  isLoggedIn = signal(false);

  constructor(private router: Router) {
    this.checkSession();
  }

  private checkSession(): void {
    if (!this.isBrowser) return;
    const session = localStorage.getItem(this.STORAGE_KEY);
    if (session) {
      const { email, expiry } = JSON.parse(session);
      if (email === this.ALLOWED_EMAIL && new Date(expiry) > new Date()) {
        this.isLoggedIn.set(true);
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  login(email: string, password: string): boolean {
    if (email.toLowerCase().trim() === this.ALLOWED_EMAIL) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      if (this.isBrowser) localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ email, expiry: expiry.toISOString() }));
      this.isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    if (this.isBrowser) localStorage.removeItem(this.STORAGE_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
}
