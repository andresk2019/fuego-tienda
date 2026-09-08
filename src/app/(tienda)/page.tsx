import { obtenerCatalogoFuego } from "@/lib/db";
import { obtenerLogoUrl } from "@/lib/admin-db";
import Hero from "@/components/Hero";
import BadgesConfianza from "@/components/BadgesConfianza";
import CarruselDestacados from "@/components/CarruselDestacados";

// Ver el catálogo real puede cambiar en cualquier momento (venta de
// mostrador en Contabilidad Lady), así que esta página nunca se sirve
// cacheada.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [productos, logoUrl] = await Promise.all([
    obtenerCatalogoFuego(),
    obtenerLogoUrl(),
  ]);

  const destacados = productos.filter((p) => p.destacado);

  return (
    <>
      <Hero logoUrl={logoUrl} />
      <BadgesConfianza />
      <CarruselDestacados productos={destacados} />
    </>
  );
}
