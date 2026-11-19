"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import EnlacePromocion from "@/components/EnlacePromocion";
import CuentaRegresiva, { CuentaRegresivaCajas } from "@/components/CuentaRegresiva";
import Brasas from "@/components/Brasas";
import MarcoAniversario from "@/components/MarcoAniversario";
import SelloAniversario from "@/components/SelloAniversario";
import { estiloFondo, type Promocion } from "@/lib/promociones";

const clave = (id: number) => `fuego-popup-promo-${id}`;
const RETRASO_MS = 2500;

// Ventana emergente con la promo marcada como "Pop-up" en el admin (ver
// obtenerPromocionPopup). Sale UNA vez por visita (sessionStorage: al
// cerrar la pestaña vuelve a salir) y unos segundos después de entrar,
// no de golpe. No sale en el carrito ni en la política de datos, para no
// interrumpir a quien está pagando. En el estilo "aniversario" va
// oscura y dorada, con marco, brasas que suben y la medalla.
export default function PopupPromocion({
  promocion,
}: {
  promocion: Promocion | null;
}) {
  const ruta = usePathname();
  const rutaExcluida =
    ruta.startsWith("/carrito") || ruta.startsWith("/politica-de-datos");
  const [abierto, setAbierto] = useState(false);
  const botonCerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!promocion || rutaExcluida) return;
    try {
      if (sessionStorage.getItem(clave(promocion.id))) return;
    } catch {
      // sin storage (ventana privada): saldrá, y ya.
    }
    const temporizador = setTimeout(() => {
      setAbierto(true);
      try {
        sessionStorage.setItem(clave(promocion.id), "1");
      } catch {
        // idem
      }
    }, RETRASO_MS);
    return () => clearTimeout(temporizador);
  }, [promocion, rutaExcluida]);

  useEffect(() => {
    if (!abierto) return;
    botonCerrarRef.current?.focus();
    const estiloAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function alPulsarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("keydown", alPulsarTecla);
    return () => {
      document.body.style.overflow = estiloAnterior;
      document.removeEventListener("keydown", alPulsarTecla);
    };
  }, [abierto]);

  if (!promocion || !abierto || rutaExcluida) return null;

  const esAniversario = promocion.estilo === "aniversario";
  // Con un fondo listo elegido (oscuro) el texto va claro, aunque la
  // promo no sea de aniversario.
  const conFondo = estiloFondo(promocion) !== undefined;
  const claro = esAniversario || conFondo;
  const cerrar = () => setAbierto(false);
  const textoBoton = promocion.enlace ? "Ver promoción" : "Ver el catálogo";
  const claseBoton = esAniversario
    ? "boton-dorado"
    : "inline-block rounded-lg bg-ember px-6 py-3 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onClick={cerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-promocion-titulo"
        style={estiloFondo(promocion)}
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl shadow-2xl ${
          esAniversario
            ? "isolate bg-gradient-to-b from-[#1f140a] via-[#34230f] to-[#1f140a] text-[#fff3c4] ring-1 ring-[#e9c46a]/60"
            : conFondo
              ? "text-[#fff8ef]"
              : "bg-surface"
        }`}
      >
        {esAniversario && (
          <>
            <div className="aniv-resplandor absolute inset-0" aria-hidden="true" />
            <Brasas cantidad={20} encima />
            <div className="absolute inset-0 z-[6]">
              <MarcoAniversario redondeado />
            </div>
          </>
        )}

        <button
          ref={botonCerrarRef}
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-lg leading-none text-foreground shadow transition-colors hover:bg-background"
        >
          ×
        </button>

        {promocion.imagenUrl && (
          <div className="relative h-44 w-full bg-foreground">
            <Image
              src={promocion.imagenUrl}
              alt=""
              fill
              sizes="448px"
              className="object-cover"
            />
          </div>
        )}

        <div
          className={`relative z-10 flex flex-col items-center gap-3 p-6 text-center ${
            esAniversario && promocion.sello && promocion.imagenUrl ? "pt-0" : ""
          }`}
        >
          {esAniversario && promocion.sello && (
            <div className={promocion.imagenUrl ? "-mt-10" : ""}>
              <SelloAniversario texto={promocion.sello} grande />
            </div>
          )}
          {esAniversario && (
            <p className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] text-[#e9c46a] uppercase">
              <span
                aria-hidden="true"
                className="h-px w-6 bg-gradient-to-r from-transparent to-[#e9c46a]"
              />
              Edición de aniversario
              <span
                aria-hidden="true"
                className="h-px w-6 bg-gradient-to-l from-transparent to-[#e9c46a]"
              />
            </p>
          )}
          {promocion.descuentoPorcentaje !== null && (
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                esAniversario
                  ? "border border-[#e9c46a]/60 bg-[#e9c46a]/15 text-[#f6dc8f]"
                  : "bg-ember text-on-ember"
              }`}
            >
              -{promocion.descuentoPorcentaje}% en productos
            </span>
          )}
          <h2
            id="popup-promocion-titulo"
            className={`font-serif text-2xl ${
              esAniversario ? "texto-dorado" : claro ? "text-[#fff8ef]" : "text-foreground"
            }`}
          >
            {promocion.titulo}
          </h2>
          {promocion.texto && (
            <p className={claro ? "text-[#fff3c4]/85" : "text-muted"}>
              {promocion.texto}
            </p>
          )}
          {promocion.fin &&
            (esAniversario ? (
              <CuentaRegresivaCajas fin={promocion.fin} chica />
            ) : (
              <CuentaRegresiva
                fin={promocion.fin}
                className={`text-sm ${claro ? "text-[#f6dc8f]" : "text-ember"}`}
              />
            ))}

          <div className="mt-2 flex flex-col items-center gap-2">
            {promocion.enlace ? (
              <EnlacePromocion
                enlace={promocion.enlace}
                className={claseBoton}
                onClick={cerrar}
              >
                {textoBoton}
              </EnlacePromocion>
            ) : (
              <Link href="/catalogo" onClick={cerrar} className={claseBoton}>
                {textoBoton}
              </Link>
            )}
            <button
              type="button"
              onClick={cerrar}
              className={`px-4 py-2.5 text-sm transition-colors ${
                claro
                  ? "text-[#fff3c4]/70 hover:text-[#fff3c4]"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Seguir navegando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
