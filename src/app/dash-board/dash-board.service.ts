import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data } from '../interface/data.interfaces';


@Injectable({
  providedIn: 'root'
})
export class DashBoardService {

  constructor(
    private http: HttpClient
  ) { }

  list(){
    return this.http.get<Data[]>('http://localhost:8080/api/data/list');
  }
}
