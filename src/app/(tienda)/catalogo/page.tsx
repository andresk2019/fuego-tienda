import { obtenerCatalogoFuego, visibleEnTienda } from "@/lib/db";
import { obtenerResumenResenasPorProducto } from "@/lib/resenas-db";
import { obtenerPromocionesPortada } from "@/lib/promociones-db";
import CatalogoPorSeccion from "@/components/CatalogoPorSeccion";
import BannersPromocion from "@/components/BannersPromocion";

// El stock puede cambiar en cualquier momento por una venta de mostrador
// registrada desde Contabilidad Lady (no solo por pedidos de esta tienda),
// así que esta página nunca se sirve cacheada: cada visita lee el
// inventario real en ese instante.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo | Fuego",
};

export default async function CatalogoPage() {
  const [productosTodos, resumenResenasPorProducto, promociones] =
    await Promise.all([
      obtenerCatalogoFuego(),
      obtenerResumenResenasPorProducto(),
      obtenerPromocionesPortada(),
    ]);
  const productos = productosTodos.filter(visibleEnTienda);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
      <BannersPromocion
        promociones={promociones}
        variante="compacto"
        rutaActual="/catalogo"
      />
      {productos.length === 0 ? (
        <p className="text-center text-muted">
          Todavía no hay productos publicados.
        </p>
      ) : (
        <CatalogoPorSeccion
          productos={productos}
          resumenResenasPorProducto={resumenResenasPorProducto}
        />
      )}
    </main>
  );
}
