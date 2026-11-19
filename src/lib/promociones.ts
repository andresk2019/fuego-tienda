// Tipos y reglas puras de las promociones (banners de Black Friday,
// Navidad, etc.) — sin servidor ni React, para poder usarlas tanto en
// la base de datos como en los formularios del admin.

export const LONGITUD_MAXIMA_TITULO = 60;
export const LONGITUD_MAXIMA_TEXTO = 160;

// "vigente": activa y dentro de sus fechas — es lo único que se ve en
// la tienda. Las demás solo existen en el panel de administración.
export type EstadoPromocion =
  | "vigente"
  | "programada"
  | "vencida"
  | "desactivada";

// Cómo se ve una promo. "aniversario": fondo oscuro con dorado, confeti
// animado, título con brillo y un sello (ej. "5 años").
export type EstiloPromocion = "normal" | "aniversario";

export const ESTILOS_PROMOCION: { valor: EstiloPromocion; nombre: string }[] = [
  { valor: "normal", nombre: "Normal (color de la marca)" },
  { valor: "aniversario", nombre: "Aniversario (dorado, con confeti)" },
];

export const LONGITUD_MAXIMA_SELLO = 16;

export type Promocion = {
  id: number;
  titulo: string;
  texto: string;
  imagenUrl: string | null;
  enlace: string | null;
  // Formato YYYY-MM-DD (día calendario de Colombia), o null si no hay
  // límite de ese lado.
  inicio: string | null;
  fin: string | null;
  activa: boolean;
  enFranja: boolean;
  // Banners: portada, catálogo y carrito.
  enPortada: boolean;
  // Ventana emergente al entrar (una vez por visita).
  enPopup: boolean;
  estilo: EstiloPromocion;
  // Texto del sello del estilo "aniversario" (ej. "5 años"); null si
  // no lleva.
  sello: string | null;
  // Porcentaje que se rebaja del precio de los productos mientras la
  // promo esté vigente (null = promo solo informativa, sin descuento).
  descuentoPorcentaje: number | null;
  // Productos que NO entran en el descuento (ej. accesorios baratos
  // donde un 20% se comería el margen).
  productosExcluidos: number[];
  estado: EstadoPromocion;
};

// Momento exacto en que termina una promo: el final del día `fin`
// (YYYY-MM-DD) en hora de Colombia (UTC-5, sin horario de verano) —
// la fecha de fin es inclusiva, igual que en la base de datos.
export function finDePromocion(fin: string): number {
  return Date.parse(`${fin}T23:59:59.999-05:00`);
}

export const DESCUENTO_MINIMO = 1;
export const DESCUENTO_MAXIMO = 90;

// Si hay varias promos con descuento vigentes a la vez, NO se suman:
// a cada producto le toca el mayor porcentaje que no lo excluya.
export function porcentajeDescuentoDe(
  promociones: Pick<Promocion, "descuentoPorcentaje" | "productosExcluidos">[],
  productoId: number
): number {
  let mayor = 0;
  for (const promo of promociones) {
    if (promo.descuentoPorcentaje === null) continue;
    if (promo.productosExcluidos.includes(productoId)) continue;
    if (promo.descuentoPorcentaje > mayor) mayor = promo.descuentoPorcentaje;
  }
  return mayor;
}

// Pesos colombianos enteros: se redondea al peso más cercano. Es la
// única fórmula de precio con descuento — la usan tanto el catálogo
// como el servidor al registrar el pedido, para que siempre coincidan.
export function aplicarDescuento(precio: number, porcentaje: number): number {
  if (porcentaje <= 0) return precio;
  return Math.round((precio * (100 - porcentaje)) / 100);
}

// El enlace lo escribe el dueño en el panel, pero igual se valida: solo
// una ruta de la propia tienda ("/catalogo") o una dirección https —
// nunca algo como "javascript:..." que se ejecutaría al hacer clic.
export function enlaceValido(enlace: string): boolean {
  if (enlace.startsWith("/")) return !enlace.startsWith("//");
  try {
    return new URL(enlace).protocol === "https:";
  } catch {
    return false;
  }
}

export function esEnlaceInterno(enlace: string): boolean {
  return enlace.startsWith("/");
}

export const ETIQUETA_ESTADO: Record<EstadoPromocion, string> = {
  vigente: "Vigente",
  programada: "Programada",
  vencida: "Vencida",
  desactivada: "Desactivada",
};
