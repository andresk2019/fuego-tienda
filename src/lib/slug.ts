// Genera el link "bonito" de un producto, tipo /productos/2-vela-estrella
// en vez de /productos/2 — solo estética (se ve más profesional y se
// comparte mejor), el id sigue siendo lo único que de verdad identifica
// al producto. Por eso un link viejo sin el nombre (`/productos/2`)
// sigue funcionando exactamente igual: ver el parseo en
// `(tienda)/productos/[id]/page.tsx`, que solo lee los dígitos del
// inicio y descarta el resto.
export function slugificarNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // quita tildes: "María" -> "Maria"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productoHref(producto: { id: number; nombre: string }): string {
  const slug = slugificarNombre(producto.nombre);
  return slug ? `/productos/${producto.id}-${slug}` : `/productos/${producto.id}`;
}
