import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  email: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = `${environment.apiUrl}/auth`;
  private tokenKey = 'autofac_token';
  private emailKey = 'autofac_email';
  private rolKey = 'autofac_rol';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, { email, password }).pipe(
      tap(respuesta => {
        localStorage.setItem(this.tokenKey, respuesta.token);
        localStorage.setItem(this.emailKey, respuesta.email);
        localStorage.setItem(this.rolKey, respuesta.rol);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
    localStorage.removeItem(this.rolKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const expiracion = this.obtenerExpiracion(token);
    if (!expiracion) {
      return false;
    }

    return expiracion > Date.now();
  }

  private obtenerExpiracion(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }
}
