// Enlaces del menú principal — un solo lugar para que el header de
// escritorio (horizontal) y el menú lateral de móvil (vertical, ver
// MenuMovil.tsx) siempre muestren exactamente lo mismo.
//
// Catálogo va antes que Quiénes somos (decisión del dueño,
// 2026-09-16): lo primero que un cliente nuevo quiere ver son los
// productos, no la historia de la marca — captar esa atención pesa
// más que el orden "institucional" que traía antes.
export const ENLACES_NAV = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/catalogo", etiqueta: "Catálogo" },
  { href: "/quienes-somos", etiqueta: "Quiénes somos" },
  { href: "/cuidado-de-las-velas", etiqueta: "Cuidado de velas" },
] as const;
