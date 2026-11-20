"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SeguimientoPedido from "@/components/SeguimientoPedido";
import CerrarIcon from "@/components/CerrarIcon";

// Botón "¿Cómo va mi pedido?" del menú: abre la consulta de pedido en
// una ventana emergente, sin sacar al cliente de la página donde está.
// La página /seguimiento sigue existiendo — es a donde apuntan los
// enlaces del mensaje de WhatsApp y de la pantalla de confirmación.
//
// La ventana se pinta con un portal directo en <body>: el menú de
// escritorio es `sticky` con su propio z-index, y una ventana anidada
// ahí dentro quedaría atrapada debajo de otros elementos.
export default function BotonSeguimiento({
  className,
  children,
  alAbrir,
}: {
  className?: string;
  children: React.ReactNode;
  alAbrir?: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const botonCerrarRef = useRef<HTMLButtonElement>(null);

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

  return (
    <>
      <button
        type="button"
        onClick={() => {
          alAbrir?.();
          setAbierto(true);
        }}
        className={className}
      >
        {children}
      </button>

      {abierto &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
            onClick={() => setAbierto(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="seguimiento-titulo"
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-surface p-6 shadow-2xl"
            >
              <button
                ref={botonCerrarRef}
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
              >
                <CerrarIcon className="h-5 w-5" />
              </button>
              <h2
                id="seguimiento-titulo"
                className="pr-10 font-serif text-2xl text-foreground"
              >
                ¿Cómo va mi pedido?
              </h2>
              <p className="mt-1 mb-5 text-sm text-muted">
                Escribe tu número de pedido y el WhatsApp con el que lo
                hiciste. No necesitas crear una cuenta.
              </p>
              <SeguimientoPedido numeroInicial="" />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
