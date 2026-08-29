import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CapturaServiceService } from './captura-service.service';

@Component({
    selector: 'app-captura',
    templateUrl: './captura.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CapturaComponent implements OnInit {

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
