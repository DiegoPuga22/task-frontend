import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [ButtonModule, RippleModule]
})
export class HeaderComponent {
  @Input() headerTitle: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    console.log('Se hizo clic en Cerrar sesión');
  }

  addTask() {
    console.log('Add task clicked');
    this.router.navigate(['/tasks/task-create']);
  }
  getTasksByUser(): void {
  console.log('getTasksByUser called');
    this.router.navigate(['/tasks/task-list'], { queryParams: { refresh: 'true' } });
  }

goToDashLogs(): void {
    this.router.navigate(['/logs/dash-logs']); // Navega a la ruta /logs
    console.log('Navegando a DashLogs');
}


}
