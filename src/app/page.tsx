import { obtenerCatalogoFuego } from "@/lib/db";
import { obtenerLogoUrl } from "@/lib/admin-db";
import CatalogoPorSeccion from "@/components/CatalogoPorSeccion";
import Hero from "@/components/Hero";

// El stock puede cambiar en cualquier momento por una venta de mostrador
// registrada desde Contabilidad Lady (no solo por pedidos de esta tienda),
// así que esta página nunca se sirve cacheada: cada visita lee el
// inventario real en ese instante.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [productos, logoUrl] = await Promise.all([
    obtenerCatalogoFuego(),
    obtenerLogoUrl(),
  ]);

  return (
    <>
      <Hero logoUrl={logoUrl} />

      <main
        id="catalogo"
        className="mx-auto w-full max-w-5xl flex-1 scroll-mt-6 px-6 py-12"
      >
        {productos.length === 0 ? (
          <p className="text-center text-muted">
            Todavía no hay productos publicados.
          </p>
        ) : (
          <CatalogoPorSeccion productos={productos} />
        )}
      </main>
    </>
  );
}
