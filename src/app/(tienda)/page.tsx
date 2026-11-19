import { obtenerCatalogoFuego, visibleEnTienda } from "@/lib/db";
import { obtenerLogoUrl } from "@/lib/admin-db";
import { obtenerResenasVisibles } from "@/lib/resenas-db";
import {
  obtenerPromocionesPortada,
  obtenerPromocionesVigentes,
} from "@/lib/promociones-db";
import Hero from "@/components/Hero";
import BannersPromocion from "@/components/BannersPromocion";
import CuentaRegresiva from "@/components/CuentaRegresiva";
import BadgesConfianza from "@/components/BadgesConfianza";
import CarruselDestacados from "@/components/CarruselDestacados";
import Resenas from "@/components/Resenas";

// Ver el catálogo real puede cambiar en cualquier momento (venta de
// mostrador en Contabilidad Lady), así que esta página nunca se sirve
// cacheada.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [productos, logoUrl, resenas, promocionesPortada, promocionesVigentes] =
    await Promise.all([
      obtenerCatalogoFuego(),
      obtenerLogoUrl(),
      obtenerResenasVisibles(),
      obtenerPromocionesPortada(),
      obtenerPromocionesVigentes(),
    ]);

  const destacados = productos.filter((p) => p.destacado && visibleEnTienda(p));
  // Productos con descuento vigente (ver descuentoPorcentaje en
  // ProductoCatalogo) — los agotados no, para no mostrar lo que no se
  // puede comprar.
  const enPromocion = productos.filter(
    (p) => p.descuentoPorcentaje !== null && p.disponible && visibleEnTienda(p)
  );
  // La cuenta regresiva de la sección es la de la promo con descuento
  // que termina primero (la que más urge).
  const finPromoDescuento = promocionesVigentes
    .filter((p) => p.descuentoPorcentaje !== null && p.fin)
    .map((p) => p.fin as string)
    .sort()[0];
  const nombresProductos = Object.fromEntries(
    productos.map((p) => [p.id, p.nombre])
  );

  return (
    <>
      <Hero logoUrl={logoUrl} />
      <BannersPromocion promociones={promocionesPortada} />
      <CarruselDestacados
        productos={enPromocion}
        etiqueta="Precios rebajados"
        titulo="En promoción"
        mostrarInsignia={false}
        extra={
          finPromoDescuento ? (
            <CuentaRegresiva fin={finPromoDescuento} prefijo="Aprovecha: termina en" />
          ) : undefined
        }
      />
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
