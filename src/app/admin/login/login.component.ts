import { Component,ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink  } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  formulario: FormGroup;
  cargando = false;
  errorMensaje = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef

  ) {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
 
  ingresar(): void {
    if (this.formulario.invalid) {
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';

    const { email, password } = this.formulario.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/admin/home']);
      },
      error: () => {
        this.cargando = false;
        this.errorMensaje = 'Correo o contraseña incorrectos.';
        this.cdr.detectChanges();
      }
    });
  }
}
