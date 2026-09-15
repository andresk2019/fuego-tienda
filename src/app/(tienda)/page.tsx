import { obtenerCatalogoFuego, visibleEnTienda } from "@/lib/db";
import { obtenerLogoUrl } from "@/lib/admin-db";
import { obtenerResenasVisibles } from "@/lib/resenas-db";
import Hero from "@/components/Hero";
import BadgesConfianza from "@/components/BadgesConfianza";
import CarruselDestacados from "@/components/CarruselDestacados";
import Resenas from "@/components/Resenas";

// Ver el catálogo real puede cambiar en cualquier momento (venta de
// mostrador en Contabilidad Lady), así que esta página nunca se sirve
// cacheada.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [productos, logoUrl, resenas] = await Promise.all([
    obtenerCatalogoFuego(),
    obtenerLogoUrl(),
    obtenerResenasVisibles(),
  ]);

  const destacados = productos.filter((p) => p.destacado && visibleEnTienda(p));
  const nombresProductos = Object.fromEntries(
    productos.map((p) => [p.id, p.nombre])
  );

  return (
    <>
      <Hero logoUrl={logoUrl} />
      <BadgesConfianza />
      <CarruselDestacados productos={destacados} />
      <Resenas resenas={resenas} nombresProductos={nombresProductos} />
    </>
  );
}
