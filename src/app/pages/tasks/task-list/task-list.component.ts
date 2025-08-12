import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PanelModule } from 'primeng/panel';
import { RespuestaTareasLista, Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/tasks/tasks.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

interface KanbanColumn {
  header: string;
  status: string;
  tasks: Task[];
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  imports: [
    CommonModule,
    PanelModule,
    CardModule,
    HeaderComponent,
    DragDropModule,
    ButtonModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  kanbanColumns: KanbanColumn[] = [];
  columnIds: string[] = [];

  constructor(
    private taskService: TaskService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    let username: string | null = null;

    if (typeof window !== 'undefined') {
      username = localStorage.getItem('username');
    }

    if (username) {
      this.taskService.getTasksByUser(username).subscribe({
        next: (res: RespuestaTareasLista) => {
          this.tasks = res.intData?.data ?? [];
          this.setKanbanColumns();
        },
        error: (err: unknown) => {
          this.tasks = [];
          console.error('Error fetching tasks:', err);
        },
      });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/tasks/task-create']);
  }

  navigateToEdit(taskId: number): void {
    console.log('Navegando a editar tarea con ID:', taskId);
    this.router.navigate([`/tasks/task-edit/${taskId}`]);
  }

  setKanbanColumns(): void {
    this.kanbanColumns = [
      { header: 'Pendiente', status: 'Incomplete', tasks: this.tasks.filter(t => t.status === 'Incomplete') },
      { header: 'En progreso', status: 'InProgress', tasks: this.tasks.filter(t => t.status === 'InProgress') },
      { header: 'Pausada', status: 'Paused', tasks: this.tasks.filter(t => t.status === 'Paused') },
      { header: 'Revisión', status: 'Revision', tasks: this.tasks.filter(t => t.status === 'Revision') },
      { header: 'Hecho', status: 'Completed', tasks: this.tasks.filter(t => t.status === 'Completed') },
    ];
    this.columnIds = this.kanbanColumns.map(column => column.status);
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.taskService.updateTaskStatus(task.id!, newStatus).subscribe({
        next: (res: any) => {
          console.log('Estado de la tarea actualizado:', res);
          const taskIndex = this.tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            this.tasks[taskIndex].status = newStatus;
          }
        },
        error: (err: unknown) => {
          console.error('Error al actualizar el estado de la tarea:', err);
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
        },
      });
    }
  }

  getCardColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return '#d1fae5';
      case 'paused': return '#fef9c3';
      case 'inprogress': return '#fed7aa';
      case 'revision': return '#bfdbfe';
      case 'incomplete':
      default: return '#f1f5f9';
    }
  }

  getColumnColor(status: string): { 'background-color': string } {
    switch (status.toLowerCase()) {
      case 'incomplete': return { 'background-color': '#334155' };
      case 'inprogress': return { 'background-color': '#f59e0b' };
      case 'paused': return { 'background-color': '#eab308' };
      case 'revision': return { 'background-color': '#3b82f6' };
      case 'completed': return { 'background-color': '#10b981' };
      default: return { 'background-color': '#6b7280' };
    }
  }

  confirmDelete(taskId?: number): void {
    if (!taskId) return;

    this.confirmationService.confirm({
      message: '¿Estás seguro que deseas eliminar esta tarea?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.taskService.deleteTask(taskId).subscribe({
          next: () => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.setKanbanColumns();
          },
          error: (err: unknown) => {
            console.error('Error al eliminar la tarea:', err);
          }
        });
      }
    });
  }
}