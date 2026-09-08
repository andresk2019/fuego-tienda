// Estructura del catálogo en 2 niveles, definida con el dueño
// (2026-09-07): Sección -> Subcategoría. Igual que categorias.ts,
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

// id de `inventario` -> subcategoría. Los primeros productos reales
// de Sales Relajantes/Exfoliantes ya aparecieron en Contabilidad
// Lady — cualquier id que no esté aquí cae por defecto en "velas"
// (que es lo que ha sido el inventario de Fuego hasta ahora).
const SUBCATEGORIA_POR_ID: Record<number, SubcategoriaSlug> = {
  30: "sales-relajantes", // Sal Relajante
  31: "exfoliantes", // Exfoliante Coco
};

export function subcategoriaDeProducto(id: number): SubcategoriaSlug {
  return SUBCATEGORIA_POR_ID[id] ?? "velas";
}
