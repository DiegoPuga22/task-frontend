import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DividerModule } from 'primeng/divider';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Usuario, RespuestaAutenticacion } from '../../../core/models/user.model';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    DividerModule,
    RouterModule,
    ToastModule,
    PasswordModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [MessageService]
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  qrCode: string = '';
  secret: string = '';

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
    private messageService: MessageService
  ) {}

  register() {
    if (!this.username || !this.password || !this.confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Completa todos los campos' });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Las contraseñas no coinciden' });
      return;
    }

    const userData: Usuario = { username: this.username, password: this.password };
    this.authService.register(userData).subscribe({
      next: (response: RespuestaAutenticacion) => {
        if (response.statusCode === 201 && response.intData?.data?.qr_code) {
          this.qrCode = response.intData.data.qr_code;
          this.secret = response.intData.data.secret || '';
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.intData.message || 'Usuario registrado correctamente.'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.intData?.message || 'No se pudo registrar el usuario.'
          });
        }
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.intData?.message || 'Error de conexión con el servidor'
        });
      }
    });
  }
}
