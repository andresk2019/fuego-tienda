import { obtenerCatalogoFuego } from "@/lib/db";
import CatalogoFiltrable from "@/components/CatalogoFiltrable";

// El stock puede cambiar en cualquier momento por una venta de mostrador
// registrada desde Contabilidad Lady (no solo por pedidos de esta tienda),
// así que esta página nunca se sirve cacheada: cada visita lee el
// inventario real en ese instante.
export const dynamic = "force-dynamic";

export default async function Home() {
  const productos = await obtenerCatalogoFuego();

  return (
    <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 px-6 py-10 text-center dark:border-neutral-800">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Fuego
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Velas artesanales
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {productos.length === 0 ? (
          <p className="text-center text-neutral-500 dark:text-neutral-400">
            Todavía no hay productos publicados.
          </p>
        ) : (
          <CatalogoFiltrable productos={productos} />
        )}
      </main>
    </div>
  );
}
