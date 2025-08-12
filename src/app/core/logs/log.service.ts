// src/app/log.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'http://localhost:5000/logs'; // Ajusta la URL según tu backend

  constructor(private http: HttpClient) {}

  getLogs(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}