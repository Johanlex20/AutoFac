import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Data } from '../interface/data.interfaces';
import { DashBoardService } from '../dash-board/dash-board.service';

const REGISTRO_VACIO: Data = {
  id: 0,
  numeroFactura: '',
  cliente: '',
  nit: '',
  fechaGeneracion: '',
  fechaVencimiento: '',
  valorTotal: '',
  formaPago: '',
  medioPago: ''
};

@Component({
    selector: 'app-registros',
    templateUrl: './registros.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class RegistrosComponent implements OnInit {

dataObj?:Data[];
registroEnEdicion: Data | null = null;
formularioEdicion: Data | null = null;
modoCreacion = false;
mensajeError = '';
camposFaltantes: Partial<Record<keyof Data, boolean>> = {};
valorTotalInvalido = false;

paginaActual = 0;
totalPaginas = 0;
tamanoPagina = 10;

  constructor(
    private dataService: DashBoardService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit():void {
    this.loadData();
  }

  loadData(){
    this.dataService.list(this.paginaActual, this.tamanoPagina)
    .subscribe(pagina =>{
      this.dataObj = pagina.content;
      this.totalPaginas = pagina.totalPages;
      this.cdr.detectChanges();
    });
  }

  paginaAnterior(): void {
    if (this.paginaActual === 0) {
      return;
    }
    this.paginaActual--;
    this.loadData();
  }

  paginaSiguiente(): void {
    if (this.paginaActual >= this.totalPaginas - 1) {
      return;
    }
    this.paginaActual++;
    this.loadData();
  }

  nuevoRegistro(): void {
    this.modoCreacion = true;
    this.registroEnEdicion = null;
    this.formularioEdicion = { ...REGISTRO_VACIO };
    this.mensajeError = '';
    this.camposFaltantes = {};
    this.valorTotalInvalido = false;
  }

  iniciarEdicion(data: Data): void {
    this.modoCreacion = false;
    this.registroEnEdicion = data;
    this.formularioEdicion = {
      ...data,
      fechaGeneracion: this.aFechaISO(data.fechaGeneracion),
      fechaVencimiento: this.aFechaISO(data.fechaVencimiento)
    };
    this.mensajeError = '';
    this.camposFaltantes = {};
    this.valorTotalInvalido = false;
  }

  private aFechaISO(fecha: string): string {
    if (!fecha) {
      return '';
    }

    // Ya viene en formato ISO (AAAA-MM-DD), como quedan los registros creados/editados desde el formulario
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }

    // Formato tal como lo captura Siigo: DD-MM-AA
    const coincide = fecha.match(/^(\d{2})-(\d{2})-(\d{2})$/);
    if (!coincide) {
      return '';
    }

    const [, dia, mes, anioCorto] = coincide;
    const anio = Number(anioCorto) <= 49 ? `20${anioCorto}` : `19${anioCorto}`;
    return `${anio}-${mes}-${dia}`;
  }

  cancelarEdicion(): void {
    this.modoCreacion = false;
    this.registroEnEdicion = null;
    this.formularioEdicion = null;
    this.mensajeError = '';
    this.camposFaltantes = {};
    this.valorTotalInvalido = false;
  }

  private formularioValido(): boolean {
    if (!this.formularioEdicion) {
      return false;
    }

    const campos: (keyof Data)[] = [
      'numeroFactura', 'cliente', 'nit',
      'fechaGeneracion', 'fechaVencimiento',
      'valorTotal', 'formaPago', 'medioPago'
    ];

    this.camposFaltantes = {};
    campos.forEach(campo => {
      const valor = this.formularioEdicion![campo]?.toString().trim();
      if (!valor) {
        this.camposFaltantes[campo] = true;
      }
    });

    this.valorTotalInvalido = false;
    const valorTotal = this.formularioEdicion.valorTotal?.toString().trim();
    if (valorTotal && !this.camposFaltantes['valorTotal']) {
      const limpio = valorTotal.replace(/,/g, '');
      const esNumerico = /^\d+(\.\d{1,2})?$/.test(limpio);
      if (!esNumerico) {
        this.valorTotalInvalido = true;
      }
    }

    return Object.keys(this.camposFaltantes).length === 0 && !this.valorTotalInvalido;
  }

  guardarEdicion(): void {
    if (!this.formularioEdicion) {
      return;
    }

    if (!this.formularioValido()) {
      this.mensajeError = 'Revisa los campos marcados en rojo.';
      return;
    }

    this.mensajeError = '';

    const peticion = this.modoCreacion
      ? this.dataService.crear(this.formularioEdicion)
      : this.dataService.actualizar(this.registroEnEdicion!.id, this.formularioEdicion);

    peticion.subscribe({
      next: () => {
        this.cancelarEdicion();
        this.loadData();
      },
      error: (err) => {
        this.mensajeError = err.error?.mensaje ?? 'No se pudo guardar el registro.';
        this.cdr.detectChanges();
      }
    });
  }

  eliminar(data: Data): void {
    if (!confirm(`¿Eliminar el registro de la factura ${data.numeroFactura}?`)) {
      return;
    }

    this.dataService.eliminar(data.id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }
}
