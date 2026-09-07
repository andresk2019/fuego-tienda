import { obtenerCatalogoFuego } from "@/lib/db";
import CatalogoPorLinea from "@/components/CatalogoPorLinea";

// El stock puede cambiar en cualquier momento por una venta de mostrador
// registrada desde Contabilidad Lady (no solo por pedidos de esta tienda),
// así que esta página nunca se sirve cacheada: cada visita lee el
// inventario real en ese instante.
export const dynamic = "force-dynamic";

export default async function Home() {
  const productos = await obtenerCatalogoFuego();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      {productos.length === 0 ? (
        <p className="text-center text-muted">
          Todavía no hay productos publicados.
        </p>
      ) : (
        <CatalogoPorLinea productos={productos} />
      )}
    </main>
  );
}
