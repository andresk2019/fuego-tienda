import Image from "next/image";
import EnlacePromocion from "@/components/EnlacePromocion";
import CuentaRegresiva from "@/components/CuentaRegresiva";
import type { Promocion } from "@/lib/promociones";

// Banners de promociones (ver obtenerPromocionesPortada en
// promociones-db.ts). Dos formas:
//  - "portada" (por defecto): uno grande por cada promo vigente. Con
//    imagen: la imagen de fondo con una capa oscura para que el texto se
//    lea; sin imagen: el color de la marca.
//  - "compacto": una sola tira delgada con la promo más reciente, para
//    el catálogo y el carrito, donde un banner grande empujaría los
//    productos hacia abajo.
// Sin promos vigentes no se renderiza nada.
export default function BannersPromocion({
  promociones,
  variante = "portada",
  rutaActual,
}: {
  promociones: Promocion[];
  variante?: "portada" | "compacto";
  // Solo en "compacto": si el enlace de la promo apunta a la misma
  // página donde ya se está (ej. /catalogo en el catálogo), no se
  // muestra el botón — no llevaría a ninguna parte.
  rutaActual?: string;
}) {
  if (promociones.length === 0) return null;

  if (variante === "compacto") {
    const promocion = promociones[0];
    const mostrarEnlace = promocion.enlace && promocion.enlace !== rutaActual;
    return (
      <section aria-label="Promoción" className="mb-8">
        <div className="flex items-center gap-4 overflow-hidden rounded-xl border border-ember/30 bg-gradient-to-r from-ember/15 via-ember/5 to-transparent p-4">
          {promocion.imagenUrl && (
            <Image
              src={promocion.imagenUrl}
              alt=""
              width={96}
              height={64}
              className="hidden h-14 w-20 shrink-0 rounded-lg object-cover sm:block"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg leading-snug text-foreground">
              {promocion.titulo}
            </p>
            {promocion.texto && (
              <p className="text-sm text-muted">{promocion.texto}</p>
            )}
            {promocion.fin && (
              <CuentaRegresiva
                fin={promocion.fin}
                className="mt-1 block text-xs text-ember"
              />
            )}
          </div>
          {mostrarEnlace && promocion.enlace && (
            <EnlacePromocion
              enlace={promocion.enlace}
              className="shrink-0 rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
            >
              Ver
            </EnlacePromocion>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Promociones"
      className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 pt-8"
    >
      {promociones.map((promocion) => {
        const conImagen = promocion.imagenUrl !== null;
        return (
          <div
            key={promocion.id}
            className={`relative flex min-h-40 overflow-hidden rounded-2xl sm:min-h-52 ${
              conImagen
                ? "bg-foreground text-white"
                : "bg-gradient-to-br from-ember to-ember-hover text-on-ember"
            }`}
          >
            {promocion.imagenUrl && (
              <>
                <Image
                  src={promocion.imagenUrl}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              </>
            )}

            <div className="relative z-10 flex max-w-lg flex-col items-start justify-center gap-2 p-6 sm:p-10">
              <h2 className="font-serif text-2xl sm:text-3xl">{promocion.titulo}</h2>
              {promocion.texto && (
                <p className="text-sm opacity-90 sm:text-base">{promocion.texto}</p>
              )}
              {promocion.fin && (
                <CuentaRegresiva
                  fin={promocion.fin}
                  className="rounded-full bg-black/25 px-3 py-1 text-xs"
                />
              )}
              {promocion.enlace && (
                <EnlacePromocion
                  enlace={promocion.enlace}
                  className="mt-2 inline-block rounded-lg bg-background px-5 py-2.5 text-sm font-semibold text-ember transition-colors hover:bg-surface-hover"
                >
                  Ver promoción
                </EnlacePromocion>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
