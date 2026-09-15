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
//
// 30/31 (mayúscula, precio $0 en Contabilidad Lady) parecen entradas
// viejas sin usar; 34/35/36 son los productos reales que sí aparecen
// hoy en el catálogo con precio — se agregaron acá el 2026-09-15 al
// notar que caían en "velas" por no estar mapeados (aparecían en la
// sección equivocada del catálogo y con el link de "cuidado de la
// vela" sin corresponder).
const SUBCATEGORIA_POR_ID: Record<number, SubcategoriaSlug> = {
  30: "sales-relajantes", // Sal Relajante
  31: "exfoliantes", // Exfoliante Coco
  34: "sales-relajantes", // sal relajante
  35: "difusores", // difusor
  36: "exfoliantes", // exfoliante
};

export function subcategoriaDeProducto(id: number): SubcategoriaSlug {
  return SUBCATEGORIA_POR_ID[id] ?? "velas";
}
