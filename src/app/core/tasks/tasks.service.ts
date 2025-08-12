import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RespuestaTareasDetalle, RespuestaTareasLista } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  
  private apiUrl = 'http://localhost:5000/task';

  constructor(private http: HttpClient) {}

  getTaskById(taskId: number): Observable<RespuestaTareasDetalle> {
    return this.http.get<RespuestaTareasDetalle>(`${this.apiUrl}/tasks/${taskId}`);
  }

  // Obtener tareas por usuario
  getTasksByUser(createdBy: string): Observable<RespuestaTareasLista> {
    return this.http.get<RespuestaTareasLista>(`${this.apiUrl}/Usertasks/${createdBy}`);
  }

  // Actualizar estado de tarea
  updateTaskStatus(taskId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_task_status/${taskId}`, { status });
  }

  // Crear nueva tarea
  createTask(taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register_task`, taskData);
  }

  // Actualizar tarea completa
  updateTask(taskId: number, taskData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_task/${taskId}`, taskData);
  }

  // Eliminar tarea
  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete_task/${taskId}`);
  }
}
