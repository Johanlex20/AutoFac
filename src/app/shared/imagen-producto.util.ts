import { environment } from '../../environments/environment';

const IMAGEN_POR_DEFECTO = 'assets/img/envase-20l.jpg';

/**
 * Las imagenes de producto vienen de dos lugares:
 *  - "assets/img/..."      -> estaticas del frontend, se usan tal cual
 *  - "/producto/imagen/x"  -> subidas desde el dashboard, las sirve la API
 */
export function urlImagenProducto(imagenUrl: string | null | undefined): string {
  if (!imagenUrl) {
    return IMAGEN_POR_DEFECTO;
  }
  if (imagenUrl.startsWith('/')) {
    return `${environment.apiUrl}${imagenUrl}`;
  }
  return imagenUrl;
}
