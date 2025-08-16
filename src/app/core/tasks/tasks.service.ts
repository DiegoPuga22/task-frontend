import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RespuestaTareasDetalle, RespuestaTareasLista } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'https://task-service-jw9n.onrender.com';

  constructor(private http: HttpClient) {}

  getTaskById(taskId: string): Observable<RespuestaTareasDetalle> {
    return this.http.get<RespuestaTareasDetalle>(`${this.apiUrl}/tasks/${taskId}`);
  }

  // Obtener tareas por usuario
  getTasksByUser(createdBy: string): Observable<RespuestaTareasLista> {
    return this.http.get<RespuestaTareasLista>(`${this.apiUrl}/Usertasks/${createdBy}`);
  }

  // Actualizar estado de tarea
  updateTaskStatus(taskId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_task_status/${taskId}`, { status });
  }

  // Crear nueva tarea
  createTask(taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register_task`, taskData);
  }

  // Actualizar tarea completa
  updateTask(taskId: string, taskData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_task/${taskId}`, taskData);
  }

  // Eliminar tarea
  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete_task/${taskId}`);
  }
}
