import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('🔵 Interceptor - Request URL:', req.url);
  console.log('🔵 Interceptor - API URL:', environment.apiUrl);
  console.log('🔵 Interceptor - Starts with API URL?', req.url.startsWith(environment.apiUrl));

  // Only add token for requests to our API
  if (req.url.startsWith(environment.apiUrl)) {
    const token = auth.getToken();
    console.log('🔵 Interceptor - Token from getToken():', token ? 'EXISTS' : 'NULL');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Interceptor - Authorization header added');
    } else {
      console.log('❌ Interceptor - No token, header not added');
    }
  } else {
    console.log('⚠️ Interceptor - URL does not match API URL, skipping');
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && req.url.startsWith(environment.apiUrl)) {
        // Token expired or invalid — logout and redirect
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
