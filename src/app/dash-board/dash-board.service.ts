import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data } from '../interface/data.interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashBoardService {

  constructor(
    private http: HttpClient
  ) { }

  list(){
    return this.http.get<Data[]>(`${environment.apiUrl}/data/list`);
  }
}
