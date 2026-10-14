/** Convierte el valor total capturado (texto como "365,000.00" o "$ 1.200.000") en numero. */
export function parseValorMonetario(valor: string): number {
  if (!valor) {
    return 0;
  }
  const soloNumeros = valor.replace(/[^\d.,-]/g, '').replace(/,/g, '');
  const numero = parseFloat(soloNumeros);
  return isNaN(numero) ? 0 : numero;
}
