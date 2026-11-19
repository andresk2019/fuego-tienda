import Image from "next/image";
import EnlacePromocion from "@/components/EnlacePromocion";
import CuentaRegresiva from "@/components/CuentaRegresiva";
import Confeti from "@/components/Confeti";
import SelloAniversario from "@/components/SelloAniversario";
import { estiloFondo, type Promocion } from "@/lib/promociones";

// La promo de aniversario OCUPA EL LUGAR del bloque del logo ("Fuego —
// velas artesanales") en el encabezado de todas las páginas, mientras
// esté vigente (ver obtenerPromocionEncabezado en promociones-db.ts y
// SiteHeader.tsx): así el cliente la ve apenas entra, sin tener que
// bajar. Ocupa más o menos la misma altura que el logo, así que no
// empuja el contenido más abajo. Va de lado a lado de la pantalla.
export default function BannerEncabezado({
  promocion,
}: {
  promocion: Promocion;
}) {
  return (
    <section
      aria-label="Aniversario"
      style={estiloFondo(promocion)}
      className="relative overflow-hidden border-b border-[#e9c46a]/40 bg-gradient-to-br from-[#2b1d0e] via-[#4a3216] to-[#2b1d0e] text-[#fff3c4]"
    >
      {/* El nombre de la marca sigue estando para los lectores de
          pantalla y los buscadores, aunque el logo ya no se vea. */}
      <h1 className="sr-only">Fuego — velas artesanales</h1>

      {promocion.imagenUrl && (
        <>
          <Image
            src={promocion.imagenUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2b1d0e]/90 via-[#2b1d0e]/55 to-transparent" />
        </>
      )}

      <Confeti />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-8 sm:py-10">
        {/* Con sello, el texto deja libre el lado derecho en el celular
            (el sello va arriba a la derecha y si no tapa el título). */}
        <div
          className={`flex flex-col items-start gap-2 sm:gap-3 ${
            promocion.sello ? "pr-24 sm:pr-0" : ""
          }`}
        >
          <h2 className="texto-dorado font-serif text-3xl sm:text-5xl">
            {promocion.titulo}
          </h2>
          {promocion.texto && (
            <p className="text-base opacity-90 sm:text-lg">{promocion.texto}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {promocion.fin && (
              <CuentaRegresiva
                fin={promocion.fin}
                className="rounded-full bg-[#e9c46a]/20 px-3 py-1 text-xs text-[#f6dc8f] sm:text-sm"
              />
            )}
            {promocion.enlace && (
              <EnlacePromocion
                enlace={promocion.enlace}
                className="inline-block rounded-lg bg-[#e9c46a] px-5 py-2.5 text-sm font-semibold text-[#2b1d0e] transition-colors hover:bg-[#f6dc8f]"
              >
                Ver promoción
              </EnlacePromocion>
            )}
          </div>
        </div>

        {promocion.sello && (
          <div className="absolute top-4 right-4 sm:static">
            <SelloAniversario texto={promocion.sello} grande />
          </div>
        )}
      </div>
    </section>
  );
}
