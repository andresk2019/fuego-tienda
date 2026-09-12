// Productos que aceptan personalización COMPLETA (aroma + color +
// nombre secreto). Por ahora solo Estrella #2 y Vela Estrella, por
// pedido explícito del dueño (2026-09-06). Vive solo en la tienda,
// igual que categorias.ts: para agregar otro producto a la
// personalización completa, se agrega su id aquí.
//
// Ojo: esto es distinto de AROMAS_DISPONIBLES de abajo — elegir
// aroma aplica a TODAS las velas del catálogo (decisión del dueño,
// 2026-09-08), no solo a estas dos. Estas dos, además de aroma,
// también dejan elegir color y ponerle un nombre secreto.
const IDS_PERSONALIZABLES = new Set<number>([
  2, // Vela Estrella
  17, // Estrella #2
]);

export function esPersonalizable(id: number): boolean {
  return IDS_PERSONALIZABLES.has(id);
}

// Aromas disponibles para CUALQUIER vela del catálogo (decisión del
// dueño, 2026-09-08) — igual que los colores, es una lista fija que
// no se lee de `insumos` (no se maneja como inventario propio), vive
// aquí como los colores/categorías/secciones.
export const AROMAS_DISPONIBLES = [
  "Frutos Rojos",
  "Frutos Tropicales",
  "Palo Santo",
  "Canela",
  "Menta",
  "Limón",
  "Eucalipto Pino",
  "Toques de Vainilla",
  "Lavanda",
] as const;

// El "nombre secreto" es texto libre y corto (un nombre o una frase
// breve tipo "Feliz cumpleaños"), no una lista de opciones.
export const LONGITUD_MAXIMA_NOMBRE_SECRETO = 30;
