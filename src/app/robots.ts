import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /admin (panel del dueño) y /carrito (transaccional, sin valor de
// búsqueda) quedan fuera de lo que Google puede indexar.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/carrito"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
