import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data } from '../interface/data.interfaces';
import { Pagina } from '../interface/pagina.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashBoardService {

  constructor(
    private http: HttpClient
  ) { }

  list(pagina: number = 0, tamano: number = 10){
    return this.http.get<Pagina<Data>>(`${environment.apiUrl}/data/list?pagina=${pagina}&tamano=${tamano}`);
  }

  crear(data: Data){
    return this.http.post<Data>(`${environment.apiUrl}/data`, data);
  }

  actualizar(id: number, data: Data){
    return this.http.put<Data>(`${environment.apiUrl}/data/${id}`, data);
  }

  eliminar(id: number){
    return this.http.delete<void>(`${environment.apiUrl}/data/${id}`);
  }
}
