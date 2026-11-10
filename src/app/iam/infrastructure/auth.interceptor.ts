import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/** Sends the bearer token to the Innova Carty API and signs out when it expires. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.currentUser()?.token;
  const isApi = req.url.startsWith(environment.apiBaseUrl);
  const isAuthEndpoint = req.url.includes('/authentication/');
  const request = isApi && token && !isAuthEndpoint ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isApi && !isAuthEndpoint && error.status === 401 && auth.isSignedIn()) auth.signOut();
      return throwError(() => error);
    }),
  );
};
