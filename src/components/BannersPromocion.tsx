import Image from "next/image";
import EnlacePromocion from "@/components/EnlacePromocion";
import type { Promocion } from "@/lib/promociones";

// Banners grandes de la portada, uno por cada promo vigente (ver
// obtenerPromocionesPortada en promociones-db.ts). Con imagen: la
// imagen de fondo con una capa oscura para que el texto se lea; sin
// imagen: el color de la marca. Sin promos vigentes no se renderiza
// nada.
export default function BannersPromocion({
  promociones,
}: {
  promociones: Promocion[];
}) {
  if (promociones.length === 0) return null;

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
