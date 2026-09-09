// Productos que aceptan personalización (aroma, color, nombre secreto).
// Por ahora solo Estrella #2 y Vela Estrella, por pedido explícito del
// dueño (2026-09-06). Vive solo en la tienda, igual que categorias.ts:
// para agregar otro producto a la personalización, se agrega su id
// aquí.
const IDS_PERSONALIZABLES = new Set<number>([
  2, // Vela Estrella
  17, // Estrella #2
]);

export function esPersonalizable(id: number): boolean {
  return IDS_PERSONALIZABLES.has(id);
}

// Colores disponibles para personalizar una vela (decisión del dueño,
// 2026-09-08) — a diferencia del aroma, el color no se lee de
// `insumos` (no se maneja como inventario propio), así que vive aquí
// como una lista fija, igual que categorias.ts/secciones.ts.
export const COLORES_DISPONIBLES = [
  "Rojo",
  "Verde",
  "Azul",
  "Rosa",
  "Morado",
  "Naranja",
  "Amarillo",
] as const;

// El "nombre secreto" es texto libre y corto (un nombre o una frase
// breve tipo "Feliz cumpleaños"), no una lista de opciones.
export const LONGITUD_MAXIMA_NOMBRE_SECRETO = 30;
