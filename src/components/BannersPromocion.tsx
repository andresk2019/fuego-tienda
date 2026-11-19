import Image from "next/image";
import EnlacePromocion from "@/components/EnlacePromocion";
import CuentaRegresiva from "@/components/CuentaRegresiva";
import Confeti from "@/components/Confeti";
import SelloAniversario from "@/components/SelloAniversario";
import type { Promocion } from "@/lib/promociones";

// Banners de promociones (ver obtenerPromocionesPortada en
// promociones-db.ts). Dos formas:
//  - "portada" (por defecto): uno grande por cada promo vigente. Con
//    imagen: la imagen de fondo con una capa oscura para que el texto se
//    lea; sin imagen: el color de la marca.
//  - "compacto": una sola tira delgada con la promo más reciente, para
//    el catálogo y el carrito, donde un banner grande empujaría los
//    productos hacia abajo.
// El estilo "aniversario" cambia el aspecto de ambas: fondo oscuro con
// dorado, confeti, título con brillo y sello. Sin promos vigentes no se
// renderiza nada.
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
    const esAniversario = promocion.estilo === "aniversario";
    const mostrarEnlace = promocion.enlace && promocion.enlace !== rutaActual;
    return (
      <section aria-label="Promoción" className="mb-8">
        <div
          className={`relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 ${
            esAniversario
              ? "border-[#e9c46a]/60 bg-gradient-to-r from-[#2b1d0e] to-[#4a3216] text-[#fff3c4]"
              : "border-ember/30 bg-gradient-to-r from-ember/15 via-ember/5 to-transparent"
          }`}
        >
          {esAniversario && <Confeti cantidad={12} />}
          {esAniversario && promocion.sello && (
            <div className="relative shrink-0">
              <SelloAniversario texto={promocion.sello} />
            </div>
          )}
          {promocion.imagenUrl && !(esAniversario && promocion.sello) && (
            <Image
              src={promocion.imagenUrl}
              alt=""
              width={96}
              height={64}
              className="relative hidden h-14 w-20 shrink-0 rounded-lg object-cover sm:block"
            />
          )}
          <div className="relative min-w-0 flex-1">
            <p
              className={`font-serif text-lg leading-snug ${
                esAniversario ? "texto-dorado" : "text-foreground"
              }`}
            >
              {promocion.titulo}
            </p>
            {promocion.texto && (
              <p className={`text-sm ${esAniversario ? "text-[#fff3c4]/80" : "text-muted"}`}>
                {promocion.texto}
              </p>
            )}
            {promocion.fin && (
              <CuentaRegresiva
                fin={promocion.fin}
                className={`mt-1 block text-xs ${esAniversario ? "text-[#f6dc8f]" : "text-ember"}`}
              />
            )}
          </div>
          {mostrarEnlace && promocion.enlace && (
            <EnlacePromocion
              enlace={promocion.enlace}
              className={`relative shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                esAniversario
                  ? "bg-[#e9c46a] text-[#2b1d0e] hover:bg-[#f6dc8f]"
                  : "bg-ember text-on-ember hover:bg-ember-hover"
              }`}
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
        const esAniversario = promocion.estilo === "aniversario";
        return (
          <div
            key={promocion.id}
            className={`relative flex min-h-40 overflow-hidden rounded-2xl sm:min-h-52 ${
              esAniversario
                ? "bg-gradient-to-br from-[#2b1d0e] via-[#4a3216] to-[#2b1d0e] text-[#fff3c4] ring-1 ring-[#e9c46a]/50"
                : conImagen
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
                  className={`object-cover ${esAniversario ? "opacity-60" : ""}`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    esAniversario
                      ? "from-[#2b1d0e]/90 via-[#2b1d0e]/55 to-transparent"
                      : "from-black/70 via-black/40 to-transparent"
                  }`}
                />
              </>
            )}

            {esAniversario && <Confeti />}

            {/* Con sello, el texto deja libre el lado derecho en el celular
                (el sello va arriba a la derecha y si no tapa el título). */}
            <div
              className={`relative z-10 flex max-w-lg flex-col items-start justify-center gap-2 p-6 sm:p-10 ${
                esAniversario && promocion.sello ? "pr-28 sm:pr-10" : ""
              }`}
            >
              <h2
                className={`font-serif text-2xl sm:text-3xl ${
                  esAniversario ? "texto-dorado" : ""
                }`}
              >
                {promocion.titulo}
              </h2>
              {promocion.texto && (
                <p className="text-sm opacity-90 sm:text-base">{promocion.texto}</p>
              )}
              {promocion.fin && (
                <CuentaRegresiva
                  fin={promocion.fin}
                  className={`rounded-full px-3 py-1 text-xs ${
                    esAniversario ? "bg-[#e9c46a]/20 text-[#f6dc8f]" : "bg-black/25"
                  }`}
                />
              )}
              {promocion.enlace && (
                <EnlacePromocion
                  enlace={promocion.enlace}
                  className={`mt-2 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                    esAniversario
                      ? "bg-[#e9c46a] text-[#2b1d0e] hover:bg-[#f6dc8f]"
                      : "bg-background text-ember hover:bg-surface-hover"
                  }`}
                >
                  Ver promoción
                </EnlacePromocion>
              )}
            </div>

            {esAniversario && promocion.sello && (
              <div className="absolute top-4 right-4 z-10 sm:top-1/2 sm:right-10 sm:-translate-y-1/2">
                <SelloAniversario texto={promocion.sello} grande />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
