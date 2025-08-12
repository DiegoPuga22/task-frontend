import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: any = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService); // Inyecta AuthService
  const token = authService.getToken();

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Agrega el encabezado X-User si existe username en localStorage
  const username = localStorage.getItem('username');
  if (username) {
    authReq = authReq.clone({
      setHeaders: {
        'X-User': username
      }
    });
  } else {
    authReq = authReq.clone({
      setHeaders: {
        'X-User': 'anonymous'
      }
    });
  }

  return next(authReq); // Corrección: usa next(authReq) directamente con HttpHandlerFn
};
