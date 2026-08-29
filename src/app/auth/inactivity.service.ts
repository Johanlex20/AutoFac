import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {

  private readonly limiteMs = 15 * 60 * 1000; // 15 minutos sin actividad
  private readonly eventos = ['mousemove', 'keydown', 'click', 'scroll'];
  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private readonly handler = () => this.reiniciarTemporizador();

  constructor(
    private ngZone: NgZone,
    private authService: AuthService,
    private router: Router
  ) {}

  iniciar(): void {
    this.ngZone.runOutsideAngular(() => {
      this.eventos.forEach(evento => document.addEventListener(evento, this.handler));
    });
    this.reiniciarTemporizador();
  }

  detener(): void {
    this.eventos.forEach(evento => document.removeEventListener(evento, this.handler));
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }

  private reiniciarTemporizador(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
    }
    this.temporizador = setTimeout(() => this.cerrarPorInactividad(), this.limiteMs);
  }

  private cerrarPorInactividad(): void {
    this.detener();
    this.authService.logout();
    this.ngZone.run(() => this.router.navigate(['/admin/login']));
  }
}
