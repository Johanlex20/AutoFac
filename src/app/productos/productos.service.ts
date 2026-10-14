import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto } from '../interface/producto.interface';

export type ProductoForm = Omit<Producto, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private url = `${environment.apiUrl}/producto`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url);
  }

  crear(producto: ProductoForm): Observable<Producto> {
    return this.http.post<Producto>(this.url, producto);
  }

  actualizar(id: number, producto: ProductoForm): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, producto);
  }

  subirImagen(archivo: File): Observable<{ imagenUrl: string }> {
    const formData = new FormData();
    formData.append('imagen', archivo);
    return this.http.post<{ imagenUrl: string }>(`${this.url}/imagen`, formData);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
