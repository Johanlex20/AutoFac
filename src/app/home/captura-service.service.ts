import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CapturaServiceService {

private url = 'http://localhost:8080/api/data/capturar';

  constructor(private http: HttpClient) {}

  capturar(): Observable<any> {
    return this.http.post<any>(this.url, {});
  }
}
