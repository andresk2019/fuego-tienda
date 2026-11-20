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

// Cómo se ve una promo. "aniversario": fondo oscuro con marco dorado,
// brasas que suben, título con brillo, cuenta regresiva en cajitas y una
// medalla (ej. "5 años").
export type EstiloPromocion = "normal" | "aniversario";

export const ESTILOS_PROMOCION: { valor: EstiloPromocion; nombre: string }[] = [
  { valor: "normal", nombre: "Normal (color de la marca)" },
  { valor: "aniversario", nombre: "Aniversario (dorado, con brasas)" },
];

export const LONGITUD_MAXIMA_SELLO = 16;

// Fondos listos para elegir en el admin (cuando la promo no lleva foto).
// Son todos oscuros/intensos a propósito: el texto del banner es claro.
export type FondoPromocion = "noche-dorada" | "brasas" | "vino" | "medianoche";

export const FONDOS_PROMOCION: {
  valor: FondoPromocion;
  nombre: string;
  css: string;
}[] = [
  {
    valor: "noche-dorada",
    nombre: "Noche dorada",
    css: "radial-gradient(circle at 15% 25%, rgba(233,196,106,0.40), transparent 45%), radial-gradient(circle at 88% 78%, rgba(217,102,46,0.30), transparent 50%), linear-gradient(135deg, #2b1d0e, #4a3216)",
  },
  {
    valor: "brasas",
    nombre: "Brasas",
    css: "radial-gradient(circle at 85% 15%, rgba(255,214,150,0.55), transparent 42%), radial-gradient(circle at 10% 90%, rgba(120,30,10,0.55), transparent 50%), linear-gradient(135deg, #b8441a, #e8793a)",
  },
  {
    valor: "vino",
    nombre: "Vino",
    css: "radial-gradient(circle at 80% 20%, rgba(233,196,106,0.35), transparent 45%), linear-gradient(135deg, #3d0f1f, #7a2338)",
  },
  {
    valor: "medianoche",
    nombre: "Medianoche",
    css: "radial-gradient(circle at 20% 20%, rgba(246,220,143,0.30), transparent 40%), radial-gradient(circle at 80% 85%, rgba(120,150,230,0.25), transparent 50%), linear-gradient(135deg, #0f1a30, #26365a)",
  },
];

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
  // Fondo listo elegido (solo se usa si la promo no lleva foto); null =
  // el de siempre según el estilo.
  fondo: FondoPromocion | null;
  // Porcentaje que se rebaja del precio de los productos mientras la
  // promo esté vigente (null = promo solo informativa, sin descuento).
  descuentoPorcentaje: number | null;
  // Productos que NO entran en el descuento (ej. accesorios baratos
  // donde un 20% se comería el margen).
  productosExcluidos: number[];
  estado: EstadoPromocion;
};

// El fondo elegido, como estilo en línea — undefined si la promo lleva
// foto (la foto manda) o no eligió ninguno.
export function estiloFondo(
  promocion: Pick<Promocion, "imagenUrl" | "fondo">
): React.CSSProperties | undefined {
  if (promocion.imagenUrl || !promocion.fondo) return undefined;
  const fondo = FONDOS_PROMOCION.find((f) => f.valor === promocion.fondo);
  return fondo ? { backgroundImage: fondo.css } : undefined;
}

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

// El descuento PROPIO de un producto (el que se le pone desde su fila
// en /admin) siempre manda: si lo tiene vigente se usa ese, aunque una
// promo de toda la tienda ofrezca más (o menos) — nunca se suman ni se
// compite. Sin descuento propio, aplica el de las promos vigentes (ver
// porcentajeDescuentoDe). Es la única fórmula: la usan tanto el catálogo
// como el servidor al registrar el pedido, para que siempre coincidan.
export function porcentajeEfectivo(
  descuentoPropio: number | undefined,
  promociones: Pick<Promocion, "descuentoPorcentaje" | "productosExcluidos">[],
  productoId: number
): number {
  if (descuentoPropio !== undefined && descuentoPropio > 0) return descuentoPropio;
  return porcentajeDescuentoDe(promociones, productoId);
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
