// Descripciones para la página de detalle de cada producto.
//
// Igual que categorias.ts, esto vive solo en la tienda — el Postgres
// compartido no tiene ningún campo pensado para una descripción de
// cara al público (`nota` está vacío en los 23 productos de Fuego
// hoy, así que no sirve como fuente).
//
// Si un producto todavía no tiene descripción propia, se usa un texto
// genérico según su categoría. En cuanto tengas el texto real de un
// producto, agrégalo aquí por su `id` y reemplaza al genérico.
import type { CategoriaSlug } from "./categorias";

const DESCRIPCION_POR_ID: Record<number, string> = {
  // 14: "Vela en forma de corazón, aroma a...", // Vela Corazon
};

const DESCRIPCION_GENERICA_POR_CATEGORIA: Record<CategoriaSlug, string> = {
  "dia-de-la-madre":
    "Vela artesanal de edición especial para el Día de la Madre, hecha a mano por Fuego.",
  navidad: "Vela artesanal de edición especial de Navidad, hecha a mano por Fuego.",
  "amor-y-amistad":
    "Vela artesanal ideal para regalar en Amor y Amistad, hecha a mano por Fuego.",
  clasicas: "Vela artesanal hecha a mano por Fuego.",
  otros: "Producto de Fuego — escríbenos si tienes dudas sobre este artículo.",
  "sin-categoria": "Vela artesanal hecha a mano por Fuego.",
};

export function descripcionDeProducto(
  id: number,
  categoria: CategoriaSlug
): string {
  return DESCRIPCION_POR_ID[id] ?? DESCRIPCION_GENERICA_POR_CATEGORIA[categoria];
}
