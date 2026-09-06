// Categorías de la tienda, organizadas por ocasión (decisión del
// 2026-09-06 con el dueño). Este archivo asigna manualmente una
// categoría a cada producto del inventario de Fuego, por su `id` en la
// tabla `inventario` compartida.
//
// A propósito es una solución "solo en la tienda": no agrega ninguna
// columna al Postgres compartido ni toca Contabilidad Lady. Ventaja:
// no había que decidir todavía cómo reorganizar el inventario de
// fondo. Desventaja: cuando agregues un producto nuevo en Contabilidad
// Lady, hay que acordarse de agregarlo aquí también — si no, cae en
// "Sin categoría" (a propósito, para que se note en la tienda en vez
// de perderse en "Clásicas" silenciosamente).
export type CategoriaSlug =
  | "dia-de-la-madre"
  | "navidad"
  | "amor-y-amistad"
  | "clasicas"
  | "otros"
  | "sin-categoria";

// Orden en el que aparece el menú de categorías en la tienda.
export const CATEGORIAS: { slug: CategoriaSlug; nombre: string }[] = [
  { slug: "dia-de-la-madre", nombre: "Día de la Madre" },
  { slug: "navidad", nombre: "Navidad" },
  { slug: "amor-y-amistad", nombre: "Amor y Amistad" },
  { slug: "clasicas", nombre: "Clásicas" },
  { slug: "otros", nombre: "Otros" },
  { slug: "sin-categoria", nombre: "Sin categoría" },
];

// id de `inventario` -> categoría. Para ver los ids reales:
// SELECT id, nombre FROM inventario WHERE empresa_id = (id de Fuego).
//
// "Otros" (por pedido explícito del dueño): productos donde el nombre
// no deja claro si es una vela para vender o un insumo/contenedor
// interno (Moldes, porcelana, Recipiente Trenza+Vela).
const CATEGORIA_POR_ID: Record<number, CategoriaSlug> = {
  12: "clasicas", // Bomba #1
  13: "clasicas", // Bomba #2
  11: "clasicas", // Bubble
  20: "clasicas", // Cemento Rendondo Mediano
  16: "clasicas", // Chispa #2
  28: "clasicas", // cupcake grande
  29: "clasicas", // cupcake mini
  10: "clasicas", // Diamante
  8: "clasicas", // Diamante Cuadrado
  23: "dia-de-la-madre", // EDICION MADRES
  17: "clasicas", // Estrella #2
  15: "navidad", // Hojalata Navidad
  9: "clasicas", // Hojalata Plata
  5: "clasicas", // Magia #1
  6: "clasicas", // Magia #2
  18: "otros", // Moldes
  27: "otros", // porcelana
  19: "otros", // Recipiente Trenza+Vela
  7: "clasicas", // Suave Hoja
  3: "clasicas", // Vela Chispa
  14: "amor-y-amistad", // Vela Corazon
  21: "clasicas", // Vela duo cemento
  2: "clasicas", // Vela Estrella
};

export function categoriaDeProducto(id: number): CategoriaSlug {
  return CATEGORIA_POR_ID[id] ?? "sin-categoria";
}

export function nombreCategoria(slug: CategoriaSlug): string {
  return CATEGORIAS.find((c) => c.slug === slug)?.nombre ?? slug;
}
