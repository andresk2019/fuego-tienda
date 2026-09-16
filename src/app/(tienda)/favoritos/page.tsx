import { obtenerCatalogoFuego, visibleEnTienda } from "@/lib/db";
import { obtenerResumenResenasPorProducto } from "@/lib/resenas-db";
import FavoritosCliente from "@/components/FavoritosCliente";

// Mismo trato que /catalogo: el stock y las fotos pueden cambiar en
// cualquier momento, así que esta página siempre lee el catálogo real
// en cada visita (los favoritos en sí viven en el navegador del
// cliente, ver FavoritosContext.tsx — acá solo se refresca la
// información de cada producto favorito).
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Favoritos | Fuego",
  description: "Los productos que guardaste para decidir después.",
};

export default async function FavoritosPage() {
  const [productosTodos, resumenResenasPorProducto] = await Promise.all([
    obtenerCatalogoFuego(),
    obtenerResumenResenasPorProducto(),
  ]);
  const productos = productosTodos.filter(visibleEnTienda);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="font-serif text-2xl text-foreground">Tus favoritos</h1>
      <p className="mt-1 text-sm text-muted">
        Guardados en este navegador — decide cuándo agregarlos al carrito.
      </p>
      <div className="mt-8">
        <FavoritosCliente
          productos={productos}
          resumenResenasPorProducto={resumenResenasPorProducto}
        />
      </div>
    </main>
  );
}
