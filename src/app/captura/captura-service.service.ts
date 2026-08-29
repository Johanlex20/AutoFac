import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CapturaServiceService {

private url = `${environment.apiUrl}/data/capturar`;

  constructor(private http: HttpClient) {}

  capturar(): Observable<any> {
    return this.http.post<any>(this.url, {});
  }
}
