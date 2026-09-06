import { obtenerCatalogoFuego } from "@/lib/db";
import CatalogoFiltrable from "@/components/CatalogoFiltrable";
import FlameIcon from "@/components/FlameIcon";

// El stock puede cambiar en cualquier momento por una venta de mostrador
// registrada desde Contabilidad Lady (no solo por pedidos de esta tienda),
// así que esta página nunca se sirve cacheada: cada visita lee el
// inventario real en ese instante.
export const dynamic = "force-dynamic";

export default async function Home() {
  const productos = await obtenerCatalogoFuego();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-14 text-center">
        <div className="mx-auto flex flex-col items-center gap-3">
          <FlameIcon className="h-8 w-8 text-ember" />
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            Fuego
          </h1>
          <p className="text-sm tracking-[0.2em] text-muted uppercase">
            Velas artesanales
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        {productos.length === 0 ? (
          <p className="text-center text-muted">
            Todavía no hay productos publicados.
          </p>
        ) : (
          <CatalogoFiltrable productos={productos} />
        )}
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-xs tracking-wide text-muted">
        Fuego — velas artesanales, hechas a mano.
      </footer>
    </div>
  );
}
