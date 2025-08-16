// src/app/log.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'https://api-gateway-345o.onrender.com/logs'; // Ahora apunta al endpoint correcto

  constructor(private http: HttpClient) {}

  getLogs(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
