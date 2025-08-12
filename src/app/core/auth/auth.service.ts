// app/core/auth/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RespuestaAutenticacion, Usuario } from '../models/user.model'; // Ajusta la ruta si es necesario
import { tap } from 'rxjs/operators'; // Importa tap

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Cambié el puerto a 5000 y la ruta base a /auth como en tu backend
  private apiUrl = 'http://localhost:5000/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  register(userData: Usuario): Observable<RespuestaAutenticacion> {
    return this.http.post<RespuestaAutenticacion>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: Usuario): Observable<RespuestaAutenticacion> {
    // Guarda el username desde las credenciales antes de la solicitud
    if (credentials.username) {
      localStorage.setItem('username', credentials.username);
    }
    return this.http.post<RespuestaAutenticacion>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: RespuestaAutenticacion) => {
        if (response.intData?.token) {
          this.setToken(response.intData.token);
          // El username ya está guardado desde las credenciales
        }
      })
    );
  }

  setToken(token: string) {
      localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    } else {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/auth/login']);
    console.log('Se cerró sesión correctamente');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
