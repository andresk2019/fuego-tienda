import Image from "next/image";
import EnlacePromocion from "@/components/EnlacePromocion";
import CuentaRegresiva, { CuentaRegresivaCajas } from "@/components/CuentaRegresiva";
import Brasas from "@/components/Brasas";
import MarcoAniversario from "@/components/MarcoAniversario";
import SelloAniversario from "@/components/SelloAniversario";
import { estiloFondo, type Promocion } from "@/lib/promociones";

// Banners de promociones (ver obtenerPromocionesPortada en
// promociones-db.ts). Dos formas:
//  - "portada" (por defecto): uno grande por cada promo vigente. Con
//    imagen: la imagen de fondo con una capa oscura para que el texto se
//    lea; sin imagen: el color de la marca.
//  - "compacto": una sola tira delgada con la promo más reciente, para
//    el catálogo y el carrito, donde un banner grande empujaría los
//    productos hacia abajo.
// El estilo "aniversario" cambia el aspecto de ambas: fondo oscuro con
// dorado, brasas que suben, título con brillo y medalla. Sin promos vigentes no se
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
    // Con un fondo listo elegido (oscuro) el texto va claro, aunque la
    // promo no sea de aniversario.
    const conFondo = estiloFondo(promocion) !== undefined;
    const oscuro = esAniversario || conFondo;
    const mostrarEnlace = promocion.enlace && promocion.enlace !== rutaActual;
    return (
      <section aria-label="Promoción" className="mb-8">
        <div
          style={estiloFondo(promocion)}
          className={`relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 ${
            esAniversario
              ? "border-[#e9c46a]/50 bg-gradient-to-r from-[#1f140a] via-[#34230f] to-[#1f140a] text-[#fff3c4] shadow-md shadow-[#2b1d0e]/15"
              : conFondo
                ? "border-ember/30 text-[#fff8ef]"
                : "border-ember/30 bg-gradient-to-r from-ember/15 via-ember/5 to-transparent"
          }`}
        >
          {esAniversario && (
            <>
              <div className="aniv-resplandor absolute inset-0" aria-hidden="true" />
              <Brasas cantidad={8} />
            </>
          )}
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
                esAniversario ? "texto-dorado" : oscuro ? "text-[#fff8ef]" : "text-foreground"
              }`}
            >
              {promocion.titulo}
            </p>
            {promocion.texto && (
              <p className={`text-sm ${oscuro ? "text-[#fff3c4]/80" : "text-muted"}`}>
                {promocion.texto}
              </p>
            )}
            {promocion.fin && (
              <CuentaRegresiva
                fin={promocion.fin}
                className={`mt-1 block text-xs ${oscuro ? "text-[#f6dc8f]" : "text-ember"}`}
              />
            )}
          </div>
          {mostrarEnlace && promocion.enlace && (
            <EnlacePromocion
              enlace={promocion.enlace}
              className={
                esAniversario
                  ? "boton-dorado boton-dorado-chico relative shrink-0"
                  : "relative shrink-0 rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
              }
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
            style={estiloFondo(promocion)}
            className={`relative isolate flex min-h-44 overflow-hidden rounded-2xl sm:min-h-56 ${
              esAniversario
                ? "bg-gradient-to-br from-[#1f140a] via-[#34230f] to-[#1f140a] text-[#fff3c4] shadow-xl shadow-[#2b1d0e]/25"
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
                  className={`object-cover ${esAniversario ? "opacity-55" : ""}`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    esAniversario
                      ? "from-[#1b1208]/95 via-[#1b1208]/70 to-[#1b1208]/30"
                      : "from-black/70 via-black/40 to-transparent"
                  }`}
                />
              </>
            )}

            {esAniversario && (
              <>
                <div className="aniv-resplandor absolute inset-0" aria-hidden="true" />
                <Brasas cantidad={14} />
                <MarcoAniversario redondeado />
              </>
            )}

            {/* Con sello, el texto deja libre el lado derecho en el celular
                (el sello va arriba a la derecha y si no tapa el título). */}
            <div
              className={`relative z-10 flex max-w-xl flex-col items-start justify-center gap-2 p-6 sm:gap-3 sm:p-10 ${
                esAniversario && promocion.sello ? "pr-28 sm:pr-10" : ""
              }`}
            >
              {esAniversario && (
                <p className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] text-[#e9c46a] uppercase">
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-gradient-to-r from-transparent to-[#e9c46a]"
                  />
                  Edición de aniversario
                </p>
              )}
              <h2
                className={`font-serif text-2xl leading-tight sm:text-3xl ${
                  esAniversario ? "texto-dorado" : ""
                }`}
              >
                {promocion.titulo}
              </h2>
              {promocion.texto && (
                <p
                  className={`text-sm sm:text-base ${
                    esAniversario ? "text-[#fff3c4]/85" : "opacity-90"
                  }`}
                >
                  {promocion.texto}
                </p>
              )}
              {promocion.fin &&
                (esAniversario ? (
                  <div className="mt-1">
                    <CuentaRegresivaCajas fin={promocion.fin} chica />
                  </div>
                ) : (
                  <CuentaRegresiva
                    fin={promocion.fin}
                    className="rounded-full bg-black/25 px-3 py-1 text-xs"
                  />
                ))}
              {promocion.enlace && (
                <EnlacePromocion
                  enlace={promocion.enlace}
                  className={
                    esAniversario
                      ? "boton-dorado mt-2"
                      : "mt-2 inline-block rounded-lg bg-background px-5 py-2.5 text-sm font-semibold text-ember transition-colors hover:bg-surface-hover"
                  }
                >
                  Ver promoción {esAniversario && <span aria-hidden="true">→</span>}
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
