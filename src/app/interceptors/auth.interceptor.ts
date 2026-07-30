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
  if (req.url.startsWith(environment.apiUrl)) {
    const token = auth.getToken();
    console.log(`[Auth] Request to ${req.url}`);
    console.log(`[Auth] Token from getToken():`, token ? 'Present' : 'NULL');
    
    if (token) {
      console.log(`[Auth] Adding Authorization header`);
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    } else {
      console.log(`[Auth] WARNING: No token found, request will likely fail with 401`);
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && req.url.startsWith(environment.apiUrl)) {
        console.log(`[Auth] 401 Error on ${req.url} - logging out`);
        // Token expired or invalid — logout and redirect
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
