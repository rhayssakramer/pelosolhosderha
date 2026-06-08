import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Only add token for requests to our API
  if (environment.production && req.url.startsWith(environment.apiUrl)) {
    const token = auth.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
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
