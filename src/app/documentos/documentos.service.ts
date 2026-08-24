import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Documento } from './documento.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {

  private url = `${environment.apiUrl}/documento`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Documento[]> {
    return this.http.get<Documento[]>(this.url);
  }

  subir(archivo: File): Observable<HttpEvent<Documento>> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.post<Documento>(this.url, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  descargarUrl(documento: Documento): string {
    return `${this.url}/${documento.id}/descargar`;
  }
}
