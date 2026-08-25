import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Documento } from '../../documentos/documento.interface';
import { DocumentosService } from '../../documentos/documentos.service';

@Component({
  selector: 'app-documentos',
  imports: [CommonModule],
  templateUrl: './documentos.component.html',
  styleUrl: './documentos.component.css'
})
export class DocumentosComponent implements OnInit {

  documentos: Documento[] = [];
  cargando = true;

  constructor(
    private documentosService: DocumentosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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

  extension(nombre: string): string {
    const partes = nombre.split('.');
    return partes.length > 1 ? partes[partes.length - 1].toUpperCase() : '';
  }

  colorBadge(nombre: string): string {
    const ext = this.extension(nombre).toLowerCase();
    const colores: { [key: string]: string } = {
      pdf: 'documentos-badge-pdf',
      doc: 'documentos-badge-doc',
      docx: 'documentos-badge-doc',
      xls: 'documentos-badge-xls',
      xlsx: 'documentos-badge-xls',
      ppt: 'documentos-badge-ppt',
      pptx: 'documentos-badge-ppt',
      png: 'documentos-badge-img',
      jpg: 'documentos-badge-img',
      jpeg: 'documentos-badge-img'
    };
    return colores[ext] ?? 'documentos-badge-default';
  }

  formatoTamano(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  descargarUrl(documento: Documento): string {
    return this.documentosService.descargarUrl(documento);
  }
}
