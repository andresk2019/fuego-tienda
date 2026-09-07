// Líneas de producto de Fuego. Hoy todo el inventario son velas — Sales
// Relajantes y Difusores de Olores todavía no existen como productos en
// Contabilidad Lady, pero se deja la estructura lista para cuando se
// agreguen. Igual que categorias.ts, esto vive solo en la tienda.
export type LineaSlug = "velas" | "sales-relajantes" | "difusores";

export const LINEAS: { slug: LineaSlug; nombre: string }[] = [
  { slug: "velas", nombre: "Velas" },
  { slug: "sales-relajantes", nombre: "Sales Relajantes" },
  { slug: "difusores", nombre: "Difusores de Olores" },
];

// Por ahora TODO el inventario de Fuego es de la línea "velas" — no
// hace falta un mapa por id todavía. El día que se agreguen sales o
// difusores en Contabilidad Lady, esta función deberá cambiar a un
// mapa manual por id (como CATEGORIA_POR_ID en categorias.ts).
export function lineaDeProducto(): LineaSlug {
  return "velas";
}
