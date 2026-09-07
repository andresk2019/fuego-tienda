// Estructura del catálogo en 2 niveles, definida con el dueño
// (2026-09-07): Sección -> Subcategoría. Hoy todo el inventario es
// "velas" — Difusores, Sales Relajantes y Exfoliantes todavía no
// existen como productos en Contabilidad Lady, pero se deja la
// estructura lista para cuando se agreguen. Igual que categorias.ts,
// esto vive solo en la tienda.
export type SubcategoriaSlug =
  | "velas"
  | "difusores"
  | "sales-relajantes"
  | "exfoliantes";

export type SeccionSlug = "aromas-hogar" | "cuidado-cuerpo";

export const SECCIONES: {
  slug: SeccionSlug;
  nombre: string;
  subcategorias: { slug: SubcategoriaSlug; nombre: string }[];
}[] = [
  {
    slug: "aromas-hogar",
    nombre: "Aromas para tu Hogar",
    subcategorias: [
      { slug: "velas", nombre: "Velas" },
      { slug: "difusores", nombre: "Difusores de Olores" },
    ],
  },
  {
    slug: "cuidado-cuerpo",
    nombre: "Cuidado para tu Cuerpo",
    subcategorias: [
      { slug: "sales-relajantes", nombre: "Sales Relajantes" },
      { slug: "exfoliantes", nombre: "Exfoliantes" },
    ],
  },
];

// Por ahora TODO el inventario de Fuego es de la subcategoría "velas"
// — no hace falta un mapa por id todavía. El día que se agreguen
// difusores/sales/exfoliantes en Contabilidad Lady, esta función
// deberá cambiar a un mapa manual por id (como CATEGORIA_POR_ID en
// categorias.ts).
export function subcategoriaDeProducto(): SubcategoriaSlug {
  return "velas";
}
