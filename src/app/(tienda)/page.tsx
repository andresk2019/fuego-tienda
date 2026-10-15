import { obtenerCatalogoFuego, visibleEnTienda } from "@/lib/db";
import { obtenerLogoUrl } from "@/lib/admin-db";
import { obtenerResenasVisibles } from "@/lib/resenas-db";
import { obtenerPromocionesPortada } from "@/lib/promociones-db";
import Hero from "@/components/Hero";
import BannersPromocion from "@/components/BannersPromocion";
import BadgesConfianza from "@/components/BadgesConfianza";
import CarruselDestacados from "@/components/CarruselDestacados";
import Resenas from "@/components/Resenas";

// Ver el catálogo real puede cambiar en cualquier momento (venta de
// mostrador en Contabilidad Lady), así que esta página nunca se sirve
// cacheada.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [productos, logoUrl, resenas, promocionesPortada] = await Promise.all([
    obtenerCatalogoFuego(),
    obtenerLogoUrl(),
    obtenerResenasVisibles(),
    obtenerPromocionesPortada(),
  ]);

  const destacados = productos.filter((p) => p.destacado && visibleEnTienda(p));
  const nombresProductos = Object.fromEntries(
    productos.map((p) => [p.id, p.nombre])
  );

  return (
    <>
      <Hero logoUrl={logoUrl} />
      <BannersPromocion promociones={promocionesPortada} />
      {/* Los productos van antes que la franja de confianza (decisión
          del dueño, 2026-09-16) — lo primero que debe saltar a la
          vista después del banner de bienvenida son las velas, no el
          texto institucional. */}
      <CarruselDestacados productos={destacados} />
      <BadgesConfianza />
      <Resenas resenas={resenas} nombresProductos={nombresProductos} />
    </>
  );
}
