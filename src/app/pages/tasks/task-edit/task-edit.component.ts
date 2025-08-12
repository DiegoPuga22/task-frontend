import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { RespuestaTareasDetalle, Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/tasks/tasks.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    InputGroupModule,
    InputGroupAddonModule,
    HeaderComponent,
  ],
  providers: [MessageService],
})
export class TaskEditComponent implements OnInit {
  task: Task = {
    name: '',
    description: '',
    created_at: new Date(),
    dead_line: new Date(),
    status: 'Incomplete',
    is_alive: true,
    created_by: '',
  };

  validStatuses = [
    { label: 'Pendiente', value: 'Incomplete' },
    { label: 'En progreso', value: 'InProgress' },
    { label: 'Pausada', value: 'Paused' },
    { label: 'Revisión', value: 'Revision' },
    { label: 'Completada', value: 'Completed' },
  ];

  taskId: number | null = null;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.taskId) {
      this.loadTask();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'ID de tarea no proporcionado',
      });
      this.router.navigate(['/tasks/task-list']);
    }
  }

  loadTask(): void {
    this.taskService.getTaskById(this.taskId!).subscribe({
      next: (res: RespuestaTareasDetalle) => {
        if (res.statusCode === 200 && res.intData?.data) {
          const task = res.intData.data;
          this.task = {
            name: task.name,
            description: task.description,
            created_at: new Date(task.created_at), // Convertir string a Date para p-calendar
            dead_line: new Date(task.dead_line), // Convertir string a Date para p-calendar
            status: task.status,
            is_alive: task.is_alive,
            created_by: task.created_by,
            id: task.id, // Incluir id si está presente
          };
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Tarea no encontrada',
          });
          this.router.navigate(['/tasks/task-list']);
        }
      },
      error: (err: unknown) => {
        console.error('Error al cargar tarea:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la tarea',
        });
        this.router.navigate(['/tasks/task-list']);
      },
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, completa todos los campos requeridos',
      });
      return;
    }

    const formatDate = (date: Date | string): string => {
      if (typeof date === 'string') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          throw new Error('Formato de fecha inválido');
        }
        return date;
      }
      return date.toISOString().split('T')[0]; // Convertir Date a YYYY-MM-DD
    };

    try {
      const taskToSubmit: Task = {
        ...this.task,
        created_at: formatDate(this.task.created_at),
        dead_line: formatDate(this.task.dead_line),
      };

      this.taskService.updateTask(this.taskId!, taskToSubmit).subscribe({
        next: (res: any) => {
          if (res.statusCode === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Tarea actualizada correctamente',
            });
            this.router.navigate(['/tasks/task-list']);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: res.intData?.message || 'Error al actualizar la tarea',
            });
          }
        },
        error: (err: unknown) => {
          console.error('Error al actualizar tarea:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la tarea',
          });
        },
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Formato de fecha inválido (YYYY-MM-DD)',
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks/task-list']);
  }
}