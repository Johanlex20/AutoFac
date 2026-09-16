import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../../interface/producto.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductosPublicoService {
  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Producto[]>(`${environment.apiUrl}/producto`);
  }
}
