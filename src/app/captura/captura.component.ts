import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CapturaServiceService } from './captura-service.service';

@Component({
    selector: 'app-captura',
    templateUrl: './captura.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CapturaComponent implements OnInit {

  constructor(
    private capturaService: CapturaServiceService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  mensaje:string = '';
  esError = false;

  capturar(): void {
      this.mensaje = '';
      this.esError = false;

      this.capturaService.capturar().subscribe({
        next: (res: any) => {
          this.mensaje = res.mensaje;
          this.esError = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.esError = true;
          if (err.status === 409 && err.error?.mensaje) {
            this.mensaje = `No se guardó: ${err.error.mensaje}`;
          } else {
            this.mensaje = 'No se pudo capturar la factura. Intenta de nuevo.';
          }
          console.error(err);
          this.cdr.detectChanges();
        }
      });
    }
}
