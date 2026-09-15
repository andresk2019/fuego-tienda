import type { NextConfig } from "next";

const esDev = process.env.NODE_ENV === "development";

// Sin nonces (ver docs/01-app/02-guides/content-security-policy.md):
// una política de nonce por request obligaría a renderizar TODO
// dinámico (nada de páginas estáticas ni ISR) y tocar proxy.ts para
// que cubra el sitio entero, no solo /admin — un costo/riesgo que no
// se justifica todavía para una tienda de este tamaño.
//
// `script-src` necesita 'unsafe-inline': Next.js inyecta scripts
// inline propios para hidratar la página (el payload de React Server
// Components vía self.__next_f), incluso en producción — lo comprobé
// sirviendo un build de producción real: sin 'unsafe-inline' la
// hidratación se rompía por completo (React error #412). Es la misma
// política que recomienda la documentación oficial de Next.js para
// quien no usa nonces — no frena un script inline ya inyectado, pero
// sí bloquea cargar un script/objeto/iframe de un dominio ajeno,
// que es el vector más común. `style-src` necesita 'unsafe-inline'
// por lo mismo (Next/Tailwind inyectan estilos inline); `img-src`
// necesita blob: para la vista previa de foto sin guardar en /admin
// (ver SubirFotoForm.tsx, URL.createObjectURL). Verificado sirviendo
// un build de producción real en un puerto aparte: sin violaciones de
// CSP en consola en portada, catálogo, producto, carrito y admin.
// script-src/connect-src también abren los dominios de Google
// Analytics (agregado 2026-09-15, ver analytics.ts): gtag.js se carga
// desde googletagmanager.com, y desde ahí manda los datos de
// navegación a los dominios de google-analytics.com/analytics.google.com
// — sin esto la CSP bloquearía Analytics en silencio (el script ni
// siquiera cargaría). Nada de esto abre la puerta a scripts de
// cualquier dominio: sigue siendo una lista explícita, solo con estos
// 2 dominios de Google agregados.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${esDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com${esDev ? " ws:" : ""};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Por defecto Next.js corta cualquier Server Action en 1MB —
      // muy por debajo del límite de 8MB que ya validaba nuestro
      // propio código en admin/actions.ts (LIMITE_MB). Una foto de
      // celular casi siempre pesa más de 1MB, así que se rechazaba
      // ANTES de que nuestro código llegara a verla, con un error
      // genérico de Next en vez del mensaje claro que ya teníamos
      // escrito. 10mb deja margen sobre los 8MB reales (el propio
      // límite del multipart le suma peso de más por los separadores
      // entre campos).
      bodySizeLimit: "10mb",
    },
  },
  images: {
    // Fotos de producto subidas desde el panel de administración,
    // guardadas en el bucket público de Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yaxagfzxibjipavncujr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // No hace falta anunciar el framework — un dato gratis de menos
  // para quien esté reconociendo el sitio.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          // frame-ancestors de la CSP ya cubre esto en navegadores
          // modernos; X-Frame-Options queda de respaldo para los que
          // no lo soportan.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
