import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Usuario, RespuestaAutenticacion } from '../../../core/models/user.model';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    DividerModule,
    InputGroupAddonModule,
    InputGroupModule,
    RouterModule,
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  otp: string = '';

  cardStyles = {
    width: '25rem',
    overflow: 'hidden',
    borderRadius: '1rem',
    boxShadow: '0 4px 12px rgba(248, 18, 195, 1)',
    background: 'rgba(172, 22, 227, 0.8)',
    textAlign: 'center',
    padding: '1.5rem'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const theme = localStorage.getItem('theme');
      if (theme === 'light') {
        document.querySelector('.login-container')?.classList.add('light-mode');
      }
    }
  }

  login() {
    if (!this.username || !this.password || !this.otp) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Usuario, contraseña y código OTP son requeridos' });
      return;
    }

    const credentials: Usuario & { otp?: string } = {
      username: this.username,
      password: this.password,
      otp: this.otp
    };

    this.authService.login(credentials).subscribe({
      next: (response: RespuestaAutenticacion) => {
        console.log('Respuesta de login:', response);
        if (response.intData?.token) {
          this.authService.setToken(response.intData.token);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('username', this.username);
          }
          this.router.navigate(['/tasks/task-list']);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Login exitoso' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.intData?.message || 'Credenciales incorrectas' });
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.intData?.message || 'Error al iniciar sesión' });
      }
    });
  }

  toggleTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const loginContainer = document.querySelector('.login-container');
      if (loginContainer) {
        loginContainer.classList.toggle('light-mode');
        const isLightMode = loginContainer.classList.contains('light-mode');
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');

        const button = document.getElementById('theme-toggle');
        if (button) {
          button.setAttribute('label', isLightMode ? 'Modo Oscuro' : 'Modo Claro');
        }
      }
    }
  }
}
