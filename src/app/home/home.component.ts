import { Component, OnInit } from '@angular/core';
import { CapturaServiceService } from './captura-service.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: [],
    standalone: false
})
export class HomeComponent implements OnInit {

  constructor( private capturaService: CapturaServiceService) { }

  ngOnInit(): void {
  }

  mensaje:string = '';

  capturar(): void {
      this.capturaService.capturar().subscribe({
        next: (res: any) => {
          this.mensaje = res.mensaje;
          console.log(res);
        },
        error: (err) => {
          this.mensaje = 'Error al capturar';
          console.error(err);
        }
      });
    }
}
