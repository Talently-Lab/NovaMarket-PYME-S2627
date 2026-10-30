/**
 * Formato de moneda local (pesos argentinos): $ 1.210.000,00
 * Un solo formateador para todo el sistema, así los precios se leen igual en todas las pantallas.
 */
const formatoPesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

export function formatearPrecio(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  const numero = Number(valor);
  return Number.isFinite(numero) ? formatoPesos.format(numero) : '—';
}
