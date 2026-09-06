# Tienda Fuego — Fase 2 de Contabilidad Lady

Este proyecto es la tienda online pública de **Fuego** (una de las 3 marcas
gestionadas en `Contabilidad Lady`, la herramienta interna de contabilidad).
Es un proyecto deliberadamente **separado** — repo propio, stack propio,
despliegue propio — para no mezclar contexto ni memoria con la app interna
que vive en `C:\Contabilidad Lady`.

Este archivo resume las decisiones tomadas antes de empezar a construir,
para que una sesión nueva de Claude Code (o cualquier desarrollador) tenga
el contexto completo sin tener que repetir la conversación.

## Quién es el dueño

Andres (andresuchimaserna@gmail.com) — el mismo dueño/operador de
Contabilidad Lady. Trabaja en Evertec (dueña de PlacetoPay, una de las
pasarelas candidatas — ver abajo).

## Decisiones ya tomadas

- **Framework: Next.js** (React), confirmado sobre Nuxt (Vue). Razón:
  es el estándar de facto para tiendas online reales, con más ejemplos y
  librerías de carrito/checkout/pagos ya armadas, y SSR de fábrica para
  buen SEO del catálogo.
- **Versión instalada: Next.js 16.3.4, React 19.2.8, Tailwind CSS v4,
  TypeScript, App Router, ESLint** — todo con la configuración por
  defecto de `create-next-app@latest` (ver `package.json`).
- **⚠️ Aviso importante para quien retome esto**: Next.js 16 es una
  versión más nueva que la que conoce el modelo por entrenamiento (y
  Tailwind v4 cambió bastante su forma de configurarse vs. v3 — ya no
  usa `tailwind.config.js` por defecto, se configura vía CSS con
  `@theme` en el propio `globals.css`). El propio proyecto lo advierte
  en `AGENTS.md`: **revisar `node_modules/next/dist/docs/` antes de
  escribir código**, para no aplicar patrones de versiones viejas de
  Next.js/React/Tailwind que ya no aplican.
- **Repo separado, no monorepo** — carpeta hermana de Contabilidad Lady,
  en `C:\fuego-tienda`. Sesión de Claude Code propia (memoria/contexto
  independientes), no una continuación de la sesión de Contabilidad
  Lady.

## Decisiones ya tomadas (actualización 2026-09-06)

1. **Inventario compartido, confirmado.** La tienda lee el mismo
   Postgres/tabla `inventario` que usa Contabilidad Lady (solo lectura
   desde la tienda). Restricción importante que esto implica:
   - Cuando se registra una venta a un cliente **desde Contabilidad
     Lady** (venta presencial/manual, no desde la tienda online), esa
     venta ya descuenta `cantidad` en `inventario` — y ese descuento
     debe reflejarse de inmediato en el stock que ve/usa la tienda.
     Como es la misma tabla, no hay que "sincronizar" nada aparte,
     pero sí hay que **diseñar el checkout de la tienda asumiendo que
     el stock puede cambiar por fuera** (venta de mostrador concurrente
     con un pedido online): validar/descontar stock en el momento de
     confirmar el pedido (no solo al cargar la página del producto),
     para evitar vender algo que ya se agotó por una venta presencial.
   - Pendiente para cuando se diseñe el modelo de datos: decidir si el
     descuento de stock por pedido online lo hace la tienda directamente
     sobre `inventario` (requeriría credenciales de escritura, aunque
     acotadas) o si pasa por una función/endpoint que ya use
     Contabilidad Lady, para mantener una sola ruta de escritura sobre
     el inventario.
2. **Pasarela de pago:** probablemente **Wompi** a futuro, pero
   **no se integra pasarela en esta fase**. Por ahora la tienda es solo
   catálogo/pedido — sin cobro en línea todavía (pedido armado en la
   tienda + coordinación manual de pago/envío, ej. WhatsApp, como punto
   de partida). Integrar Wompi queda para una fase posterior.
3. **Hosting/despliegue: Vercel, confirmado.** Proyecto nuevo y
   separado del proyecto `contabilidad-lady` que ya está en Vercel.
4. **Alcance de esta fase 1 de la tienda: solo Fuego, confirmado.**
   Contabilidad Lady maneja 3 marcas (Fuego, LadySoul, Suave Capricho);
   esta tienda es únicamente para Fuego. Si en el futuro se quiere
   vender otra marca en línea, se evalúa como proyecto/decisión aparte.

No quedan decisiones pendientes de las 4 iniciales — el proyecto ya
puede pasar a diseño/implementación.

## Estado actual del proyecto

- Scaffold inicial creado con `create-next-app@latest` (sin modificar
  todavía — es la plantilla por defecto).
- Repo git inicializado localmente, sin remoto ni commits todavía.
- Nada desplegado.

## Próximos pasos sugeridos al retomar

1. Revisar `node_modules/next/dist/docs/` para confirmar los patrones
   correctos de Next.js 16 antes de escribir páginas/rutas.
2. Diseñar cómo se expone `inventario` a la tienda: revisar `lib/db.js`
   en `C:\Contabilidad Lady` como referencia del esquema (columnas:
   `nombre`, `cantidad`, `precio_venta`, `costo_unitario`, `unidad`,
   `stock_minimo`, `es_informativo`); API de solo lectura para el
   catálogo, nunca exponer credenciales de escritura al cliente, y
   validar/descontar stock en el momento de confirmar un pedido (ver
   nota de inventario compartido arriba) para no vender sobre una
   venta de mostrador concurrente.
3. Crear un repositorio remoto (GitHub) y un proyecto nuevo en Vercel,
   separado del proyecto `contabilidad-lady`.
