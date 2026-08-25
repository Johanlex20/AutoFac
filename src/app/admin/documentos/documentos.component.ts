import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Documento } from '../../documentos/documento.interface';
import { DocumentosService } from '../../documentos/documentos.service';
import { HttpEventType } from '@angular/common/http';

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
  archivoSeleccionado: File | null = null;
  documentoEnEdicion: Documento | null = null;
  nombreEditado = '';
  archivoEditado: File | null = null;
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputEdit') fileInputEditRef?: ElementRef<HTMLInputElement>;


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

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoSeleccionado = input.files?.[0] ?? null;
  }

  subir(): void {
    if (!this.archivoSeleccionado) return;

    this.subiendo = true;
    this.progreso = 0;

    this.documentosService.subir(this.archivoSeleccionado).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progreso = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          this.subiendo = false;
          this.archivoSeleccionado = null;

          if (this.fileInputRef) {
            this.fileInputRef.nativeElement.value = '';
          }

          this.cargarLista();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.subiendo = false;
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

  eliminar(documento: Documento): void {
    const confirmado = confirm(`¿Eliminar "${documento.nombreOriginal}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    this.documentosService.eliminar(documento).subscribe({
      next: () => {
        this.cargarLista();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  iniciarEdicion(documento: Documento): void {
    this.documentoEnEdicion = documento;
    this.nombreEditado = documento.nombreOriginal;
    this.archivoEditado = null;
  }

  cancelarEdicion(): void {
    this.documentoEnEdicion = null;
    this.nombreEditado = '';
    this.archivoEditado = null;
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }

  }

  onArchivoEditado(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoEditado = input.files?.[0] ?? null;
  }

  guardarEdicion(): void {
    if (!this.documentoEnEdicion) return;

    this.subiendo = true;
    this.progreso = 0;

    this.documentosService.actualizar(this.documentoEnEdicion, this.nombreEditado, this.archivoEditado ?? undefined).subscribe({
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
        this.cdr.detectChanges();
      }
    });
  }


}
