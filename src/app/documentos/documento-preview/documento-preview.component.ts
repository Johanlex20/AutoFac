import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Documento } from '../documento.interface';
import { DocumentosService } from '../documentos.service';

const EXTENSIONES_IMAGEN = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

@Component({
  selector: 'app-documento-preview',
  imports: [CommonModule],
  templateUrl: './documento-preview.component.html',
  styleUrl: './documento-preview.component.css'
})
export class DocumentoPreviewComponent implements OnChanges, OnDestroy {

  @Input() documento: Documento | null = null;
  @Output() cerrar = new EventEmitter<void>();

  cargando = false;
  esImagen = false;
  esPdf = false;
  noPrevisualizable = false;
  urlImagen: string | null = null;
  urlIframe: SafeResourceUrl | null = null;

  private urlObjeto: string | null = null;

  constructor(
    private http: HttpClient,
    private documentosService: DocumentosService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['documento']) {
      return;
    }

    this.limpiar();

    if (this.documento) {
      this.cargarPreview(this.documento);
    }
  }

  ngOnDestroy(): void {
    this.limpiar();
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  private cargarPreview(documento: Documento): void {
    const extension = this.extension(documento.nombreOriginal);
    this.esImagen = EXTENSIONES_IMAGEN.includes(extension);
    this.esPdf = extension === 'pdf';
    this.noPrevisualizable = !this.esImagen && !this.esPdf;

    if (this.noPrevisualizable) {
      return;
    }

    this.cargando = true;

    this.http.get(this.documentosService.descargarUrl(documento), { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.urlObjeto = URL.createObjectURL(blob);
        this.urlImagen = this.urlObjeto;
        this.urlIframe = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlObjeto);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.noPrevisualizable = true;
        this.cdr.detectChanges();
      }
    });
  }

  private limpiar(): void {
    if (this.urlObjeto) {
      URL.revokeObjectURL(this.urlObjeto);
      this.urlObjeto = null;
    }
    this.urlImagen = null;
    this.urlIframe = null;
    this.cargando = false;
    this.esImagen = false;
    this.esPdf = false;
    this.noPrevisualizable = false;
  }

  private extension(nombre: string): string {
    const partes = nombre.split('.');
    return partes.length > 1 ? partes[partes.length - 1].toLowerCase() : '';
  }
}
