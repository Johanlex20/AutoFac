export interface Documento {
  id: number;
  nombreOriginal: string;
  nombreArchivo: string;
  tamanoBytes: number;
  contentType: string;
  fechaSubida: string;
}