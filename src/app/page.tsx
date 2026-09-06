import { obtenerCatalogoFuego } from "@/lib/db";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

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
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productos.map((producto) => (
              <li
                key={producto.id}
                className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <h2 className="font-medium text-neutral-900 dark:text-neutral-50">
                  {producto.nombre}
                </h2>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  {formatoCOP.format(producto.precioVenta)}
                </p>
                {!producto.disponible && (
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Agotado
                  </span>
                )}
                {producto.disponible && producto.pocasUnidades && (
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    ¡Últimas unidades!
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
