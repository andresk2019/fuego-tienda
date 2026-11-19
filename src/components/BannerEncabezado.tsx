import Image from "next/image";
import EnlacePromocion from "@/components/EnlacePromocion";
import CuentaRegresiva, { CuentaRegresivaCajas } from "@/components/CuentaRegresiva";
import Brasas from "@/components/Brasas";
import MarcoAniversario from "@/components/MarcoAniversario";
import SelloAniversario from "@/components/SelloAniversario";
import { estiloFondo, type Promocion } from "@/lib/promociones";

// La promo de aniversario OCUPA EL LUGAR del bloque del logo ("Fuego —
// velas artesanales") en el encabezado de todas las páginas, mientras
// esté vigente (ver obtenerPromocionEncabezado en promociones-db.ts y
// SiteHeader.tsx): así el cliente la ve apenas entra, sin tener que
// bajar. Va de lado a lado de la pantalla.
//
// Capas, de atrás hacia adelante: fondo (foto, fondo listo o degradado
// oscuro) → velo oscuro para que el texto se lea → resplandor cálido →
// brasas que suben → marco con filetes dorados → contenido.
export default function BannerEncabezado({
  promocion,
}: {
  promocion: Promocion;
}) {
  return (
    <section
      aria-label="Aniversario"
      style={estiloFondo(promocion)}
      className="relative isolate overflow-hidden bg-gradient-to-br from-[#1f140a] via-[#34230f] to-[#1f140a] text-[#fff3c4]"
    >
      {/* El nombre de la marca sigue estando para los lectores de
          pantalla y los buscadores, aunque el logo ya no se vea. */}
      <h1 className="sr-only">Fuego — velas artesanales</h1>

      {promocion.imagenUrl ? (
        <>
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={promocion.imagenUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="zoom-lento object-cover opacity-55"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1b1208]/95 via-[#1b1208]/70 to-[#1b1208]/30" />
        </>
      ) : (
        // Sin foto: un velo más suave detrás del texto, porque algunos
        // fondos listos (ej. "Noche dorada") tienen destellos claros a la
        // izquierda que le quitarían contraste al título dorado.
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1208]/65 via-[#1b1208]/30 to-transparent" />
      )}

      <div className="aniv-resplandor absolute inset-0" aria-hidden="true" />
      <Brasas cantidad={18} />
      <MarcoAniversario />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-8 px-6 py-7 sm:px-10 sm:py-14">
        <div className="flex w-full max-w-2xl flex-col items-start gap-3 sm:gap-4">
          {/* Etiqueta + título. En el celular la medalla va a su lado
              (no encima): así el banner queda bajito y el título no se
              cruza con ella. */}
          <div className="flex w-full items-start justify-between gap-4">
            <div className="flex flex-col items-start gap-2.5 sm:gap-4">
              <p className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.32em] text-[#e9c46a] uppercase sm:text-xs">
                <span
                  aria-hidden="true"
                  className="h-px w-6 bg-gradient-to-r from-transparent to-[#e9c46a] sm:w-12"
                />
                Edición de aniversario
              </p>
              <h2 className="texto-dorado font-serif text-[1.65rem] leading-[1.15] sm:text-5xl sm:leading-[1.1]">
                {promocion.titulo}
              </h2>
            </div>
            {promocion.sello && (
              <div className="shrink-0 sm:hidden">
                <SelloAniversario texto={promocion.sello} grande />
              </div>
            )}
          </div>

          {promocion.texto && (
            <p className="max-w-xl text-sm leading-relaxed text-[#fff3c4]/85 sm:text-lg">
              {promocion.texto}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-3 sm:mt-2 sm:gap-x-6 sm:gap-y-4">
            {promocion.fin && (
              <>
                {/* Celular: una sola línea. Escritorio: cajitas. */}
                <CuentaRegresiva
                  fin={promocion.fin}
                  prefijo="Quedan"
                  className="rounded-full border border-[#e9c46a]/35 bg-black/30 px-2.5 py-1.5 text-[11px] text-[#f6dc8f] sm:hidden"
                />
                <div className="hidden sm:block">
                  <CuentaRegresivaCajas fin={promocion.fin} />
                </div>
              </>
            )}
            {promocion.enlace && (
              <EnlacePromocion enlace={promocion.enlace} className="boton-dorado">
                Ver promoción <span aria-hidden="true">→</span>
              </EnlacePromocion>
            )}
          </div>
        </div>

        {promocion.sello && (
          <div className="hidden sm:mr-6 sm:block">
            <SelloAniversario texto={promocion.sello} grande />
          </div>
        )}
      </div>
    </section>
  );
}
