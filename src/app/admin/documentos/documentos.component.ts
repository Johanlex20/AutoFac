import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Documento } from '../../documentos/documento.interface';
import { DocumentosService } from '../../documentos/documentos.service';
import { HttpEventType } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-documentos',
  imports: [CommonModule, FormsModule],
  templateUrl: './documentos.component.html',
  styleUrl: './documentos.component.css',
})
export class DocumentosComponent implements OnInit {

  documentos: Documento[] = [];
  cargando = true;
  subiendo = false;
  progreso = 0;

  modoCreacion = false;
  documentoEnEdicion: Documento | null = null;
  nombreEditado = '';
  archivoSeleccionado: File | null = null;

  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  constructor(
    private documentosService: DocumentosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarLista();
  }

  cargarLista(): void {
    this.cargando = true;
    this.documentosService.listar().subscribe({
      next: (docs) => {
        this.documentos = docs;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  nuevoDocumento(): void {
    this.modoCreacion = true;
    this.documentoEnEdicion = null;
    this.nombreEditado = '';
    this.archivoSeleccionado = null;
  }

  iniciarEdicion(documento: Documento): void {
    this.modoCreacion = false;
    this.documentoEnEdicion = documento;
    this.nombreEditado = documento.nombreOriginal;
    this.archivoSeleccionado = null;
  }

  cancelarEdicion(): void {
    this.modoCreacion = false;
    this.documentoEnEdicion = null;
    this.nombreEditado = '';
    this.archivoSeleccionado = null;
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoSeleccionado = input.files?.[0] ?? null;
  }

  guardarFormulario(): void {
    if (this.modoCreacion) {
      this.subir();
    } else {
      this.guardarEdicion();
    }
  }

  private subir(): void {
    if (!this.archivoSeleccionado) return;

    this.subiendo = true;
    this.progreso = 0;

    this.documentosService.subir(this.archivoSeleccionado).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progreso = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          this.subiendo = false;
          this.cancelarEdicion();
          this.cargarLista();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.subiendo = false;
        Swal.fire({ icon: 'error', title: 'No se pudo subir', text: 'Intenta de nuevo.' });
        this.cdr.detectChanges();
      }
    });
  }

  private guardarEdicion(): void {
    if (!this.documentoEnEdicion) return;

    this.subiendo = true;
    this.progreso = 0;

    this.documentosService.actualizar(this.documentoEnEdicion, this.nombreEditado, this.archivoSeleccionado ?? undefined).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progreso = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          this.subiendo = false;
          this.cancelarEdicion();
          this.cargarLista();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.subiendo = false;
        Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: 'Intenta de nuevo.' });
        this.cdr.detectChanges();
      }
    });
  }

  descargarUrl(documento: Documento): string {
    return this.documentosService.descargarUrl(documento);
  }

  formatoTamano(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async eliminar(documento: Documento): Promise<void> {
    const resultado = await Swal.fire({
      title: '¿Eliminar documento?',
      text: `"${documento.nombreOriginal}" — esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    });

    if (!resultado.isConfirmed) {
      return;
    }

    this.documentosService.eliminar(documento).subscribe({
      next: () => {
        this.cargarLista();
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: 'Intenta de nuevo.' });
        this.cdr.detectChanges();
      }
    });
  }
}
