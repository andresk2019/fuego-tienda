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

## Decisiones pendientes (a definir en la próxima sesión)

1. **¿La tienda se conecta al inventario real de Fuego (mismo Postgres
   que usa Contabilidad Lady, solo lectura) o maneja su propio catálogo
   independiente?** Se recomendó la primera opción (no duplicar
   mantenimiento) pero el usuario no la confirmó todavía — retomar esta
   pregunta antes de diseñar el modelo de datos.
2. **Pasarela de pago** — se compararon varias opciones para Colombia,
   sin decidir cuál usar todavía:
   - **Bold** — más simple/rápida de arrancar, comisiones bajas, muy
     usada hoy por negocios pequeños en Colombia.
   - **Wompi** — respaldada por Bancolombia, PSE nativo.
   - **PlacetoPay** (de Evertec) — la más institucional/confiable,
     usada por gobierno, universidades, aerolíneas; onboarding más
     formal que Bold/Wompi.
   - **Stripe** — mejor experiencia de desarrollador, soporta Colombia,
     útil si algún día se quiere vender también fuera del país.
   - Otras mencionadas pero de menor prioridad para arrancar: PayU,
     ePayco, Mercado Pago, Movii, RappiPay, Kushki, Adyen, EBANX,
     Checkout.com, Braintree, Addi (compra ahora paga después), Nequi/
     Daviplata (cobro directo sin gateway).
   - También sin definir: ¿pago en línea real desde el día uno, o
     pedido armado en la tienda + coordinación manual de pago/envío
     (ej. por WhatsApp), agregando pagos en línea más adelante?
3. **Hosting/despliegue** — probablemente Vercel (mismo que
   Contabilidad Lady), como proyecto nuevo y separado ahí. No
   confirmado formalmente todavía.
4. **Alcance de esta fase 1 de la tienda** — solo Fuego por ahora
   (Contabilidad Lady maneja 3 marcas: Fuego, LadySoul, Suave Capricho;
   esta tienda es únicamente para Fuego).

## Estado actual del proyecto

- Scaffold inicial creado con `create-next-app@latest` (sin modificar
  todavía — es la plantilla por defecto).
- Repo git inicializado localmente, sin remoto ni commits todavía.
- Nada desplegado.

## Próximos pasos sugeridos al retomar

1. Definir las 4 decisiones pendientes de arriba.
2. Revisar `node_modules/next/dist/docs/` para confirmar los patrones
   correctos de Next.js 16 antes de escribir páginas/rutas.
3. Si se conecta al Postgres existente: revisar `lib/db.js` en
   `C:\Contabilidad Lady` como referencia del esquema de `inventario`
   (columnas: `nombre`, `cantidad`, `precio_venta`, `costo_unitario`,
   `unidad`, `stock_minimo`, `es_informativo`) y decidir cómo exponerlo
   de forma segura a una app pública (probablemente una API de solo
   lectura, nunca exponer credenciales de escritura al cliente).
4. Crear un repositorio remoto (GitHub) y un proyecto nuevo en Vercel,
   separado del proyecto `contabilidad-lady`.
