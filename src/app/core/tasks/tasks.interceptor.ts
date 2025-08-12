/*
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { TaskService } from './tasks.service'; // Ajusta la ruta según tu estructura
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const taskInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const taskService = inject(TaskService);
  const apiUrl = taskService['apiUrl']; // Accede a la propiedad privada apiUrl (no recomendado, ver nota)
  const token = localStorage.getItem('token'); // Usar localStorage como en auth.interceptor

  let taskReq = req;

  // Intercepta solo las solicitudes a las rutas de tareas
  if (req.url.startsWith(apiUrl) && token) {
    taskReq = req.clone({
      setHeaders: {
        Authorization: Bearer ${token}
      }
    });
  }

  return next(taskReq).pipe(
    catchError(error => {
      console.error('Error en taskInterceptor:', error);
      if (error.status === 403) {
        console.warn('Permiso denegado para esta tarea');
      } else if (error.status === 404) {
        console.warn('Tarea no encontrada');
      }
      return throwError(() => new Error('Error en la solicitud de tarea: ' + error.message));
    })
  );
};
*/
