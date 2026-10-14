import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface Perfil {
  email: string;
  rol: string;
  nombre: string | null;
  telefono: string | null;
  fotoUrl: string | null;
  /** Solo viene cuando se cambió el correo. */
  token?: string | null;
}

export interface PerfilForm {
  email: string;
  nombre: string;
  telefono: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private url = `${environment.apiUrl}/perfil`;
  private perfilSubject = new BehaviorSubject<Perfil | null>(null);

  /** Perfil de la sesión actual; lo comparten la página de Profile y el menú lateral (foto). */
  perfil$ = this.perfilSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  cargar(): Observable<Perfil> {
    return this.http.get<Perfil>(this.url).pipe(tap((p) => this.perfilSubject.next(p)));
  }

  actualizar(datos: PerfilForm): Observable<Perfil> {
    return this.http.put<Perfil>(this.url, datos).pipe(
      tap((p) => {
        if (p.token) {
          this.authService.guardarSesion(p.token, p.email);
        }
        this.perfilSubject.next(p);
      })
    );
  }

  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<void> {
    return this.http.put<void>(`${this.url}/password`, { passwordActual, passwordNueva });
  }

  subirFoto(archivo: File): Observable<Perfil> {
    const formData = new FormData();
    formData.append('foto', archivo);
    return this.http.post<Perfil>(`${this.url}/foto`, formData).pipe(tap((p) => this.perfilSubject.next(p)));
  }

  quitarFoto(): Observable<Perfil> {
    return this.http.delete<Perfil>(`${this.url}/foto`).pipe(tap((p) => this.perfilSubject.next(p)));
  }

  /** Olvida el perfil guardado (al entrar al dashboard o cerrar sesión) para no mostrar la foto de otro usuario. */
  limpiar(): void {
    this.perfilSubject.next(null);
  }

  urlFoto(fotoUrl: string | null | undefined): string | null {
    return fotoUrl ? `${environment.apiUrl}${fotoUrl}` : null;
  }
}
