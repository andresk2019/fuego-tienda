// Enlaces del menú principal — un solo lugar para que el header de
// escritorio (horizontal) y el menú lateral de móvil (vertical, ver
// MenuMovil.tsx) siempre muestren exactamente lo mismo.
export const ENLACES_NAV = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/quienes-somos", etiqueta: "Quiénes somos" },
  { href: "/catalogo", etiqueta: "Catálogo" },
  { href: "/cuidado-de-las-velas", etiqueta: "Cuidado de velas" },
] as const;
