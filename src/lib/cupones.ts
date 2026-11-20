// Cupones de descuento por temporada (ej. "Escribe FUEGO y obtén 10%").
// Reglas puras, sin servidor ni React: las usan tanto la base de datos
// y el servidor (que es quien de verdad cobra) como el panel de admin.
//
// REGLA DE SUMA (decisión del dueño, 2026-11-19): el cupón SE SUMA al
// descuento que el producto ya tenga (propio o de una promo de toda la
// tienda, ver porcentajeEfectivo en promociones.ts), pero el total
// nunca pasa del TOPE del cupón (ej. 20%). Con cupón de 10% y tope 20%:
//   producto sin descuento  -> 10%
//   producto con 10%        -> 20%
//   producto con 15%        -> 20% (solo los 5 puntos que faltan)
//   producto con 20% o más  -> el cupón no aplica
// Los puntos se suman sobre el precio normal (10% + 10% = 20% del precio
// normal), no uno encima del otro.

export const LONGITUD_MINIMA_CODIGO = 3;
export const LONGITUD_MAXIMA_CODIGO = 20;
export const CUPON_PORCENTAJE_MINIMO = 1;
export const CUPON_PORCENTAJE_MAXIMO = 90;
export const TOPE_POR_DEFECTO = 20;

export type EstadoCupon = 'vigente' | 'programado' | 'vencido' | 'desactivado';

export type Cupon = {
  id: number;
  codigo: string;
  // Puntos de descuento que suma el cupón (ej. 10).
  porcentaje: number;
  // Descuento TOTAL máximo (producto + cupón) (ej. 20).
  topeTotal: number;
  // YYYY-MM-DD (día calendario de Colombia) o null si no hay límite.
  inicio: string | null;
  fin: string | null;
  activo: boolean;
  estado: EstadoCupon;
  // Pedidos (no cancelados) que lo usaron — solo para el panel.
  usos: number;
};

export const ETIQUETA_ESTADO_CUPON: Record<EstadoCupon, string> = {
  vigente: 'Vigente',
  programado: 'Programado',
  vencido: 'Vencido',
  desactivado: 'Desactivado',
};

// Mayúsculas, sin espacios: "fuego", " Fuego " y "FUEGO" son el mismo
// código. Solo letras y números (sin tildes ni símbolos) para que sea
// fácil de escribir en un celular y de compartir.
export function normalizarCodigo(texto: string): string {
  return texto.replace(/\s+/g, '').toUpperCase();
}

export function codigoValido(codigo: string): boolean {
  return (
    codigo.length >= LONGITUD_MINIMA_CODIGO &&
    codigo.length <= LONGITUD_MAXIMA_CODIGO &&
    /^[A-Z0-9]+$/.test(codigo)
  );
}

// Puntos EXTRA que aporta el cupón a un producto que ya tiene
// `porcentajeActual` de descuento: lo que cabe hasta el tope, sin pasar
// del porcentaje del cupón. 0 = el cupón no aplica a ese producto.
export function puntosExtraCupon(
  porcentajeActual: number,
  cupon: Pick<Cupon, 'porcentaje' | 'topeTotal'>
): number {
  return Math.max(0, Math.min(cupon.porcentaje, cupon.topeTotal - porcentajeActual));
}
