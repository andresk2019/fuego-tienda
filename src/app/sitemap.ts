import type { MetadataRoute } from "next";
import { obtenerCatalogoFuego, visibleEnTienda } from "@/lib/db";
import { productoHref } from "@/lib/slug";
import { SITE_URL } from "@/lib/site";

// force-dynamic (igual que el resto de páginas públicas, ver
// (tienda)/catalogo/page.tsx) — así un producto nuevo o eliminado
// aparece/desaparece del sitemap sin esperar a un redeploy.
export const dynamic = "force-dynamic";

// No incluye /carrito (transaccional, no aporta nada indexado) ni
// nada bajo /admin (privado — ver robots.ts, que además lo bloquea).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await obtenerCatalogoFuego();

  const paginasFijas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/catalogo`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/quienes-somos`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/cuidado-de-las-velas`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/politica-de-datos`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const paginasProducto: MetadataRoute.Sitemap = productos
    .filter(visibleEnTienda)
    .map((producto) => ({
      url: `${SITE_URL}${productoHref(producto)}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...paginasFijas, ...paginasProducto];
}
