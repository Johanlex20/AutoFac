/**
 * Convierte una fecha capturada a formato ISO (AAAA-MM-DD).
 * La captura de Siigo ha entregado fechas en tres formatos distintos
 * según el flujo (manual antiguo vs. sincronizacion automatica nueva),
 * asi que hay que reconocer los tres:
 *   - Ya ISO (AAAA-MM-DD): registros creados/editados desde el formulario.
 *   - DD-MM-AA (año corto): flujo de captura manual mas antiguo.
 *   - DD/MM/AAAA (año completo, con barras): flujo de sincronizacion automatica.
 */
export function aFechaISO(fecha: string): string {
  if (!fecha) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }

  const conBarras = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (conBarras) {
    const [, dia, mes, anio] = conBarras;
    return `${anio}-${mes}-${dia}`;
  }

  const coincide = fecha.match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (!coincide) {
    return '';
  }

  const [, dia, mes, anioCorto] = coincide;
  const anio = Number(anioCorto) <= 49 ? `20${anioCorto}` : `19${anioCorto}`;
  return `${anio}-${mes}-${dia}`;
}
