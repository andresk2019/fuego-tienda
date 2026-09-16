"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ENLACES_NAV } from "@/lib/navegacion";
import MenuIcon from "@/components/MenuIcon";
import CerrarIcon from "@/components/CerrarIcon";

// Menú lateral para móvil: antes los enlaces se apretaban en una fila
// que se partía en 2-3 líneas junto al ícono del carrito (ver
// SiteHeader.tsx) — incómodo de tocar en pantallas angostas. Ahora
// solo se ve un botón de hamburguesa; los enlaces viven en un panel
// que entra desde la izquierda, con letra más grande y separación
// pensada para el dedo. En escritorio el header sigue mostrando todo
// de una vez (este componente se oculta con md:hidden).
//
// El panel y el fondo oscuro se renderizan siempre (no solo cuando
// está abierto) y se animan con translate-x/opacity — así la
// transición de apertura Y cierre se ve suave, sin depender de una
// librería de animación.
export default function MenuMovil() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    // Evita que el fondo se desplace mientras el menú está abierto.
    document.body.style.overflow = "hidden";
    function alPresionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    window.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        className="p-1 text-foreground"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      <div
        onClick={() => setAbierto(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        aria-label="Principal"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80%] flex-col gap-1 bg-surface p-6 shadow-xl transition-transform duration-300 ${
          abierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="font-serif text-lg text-foreground">Menú</span>
          <button
            type="button"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar menú"
            className="p-1 text-muted transition-colors hover:text-foreground"
          >
            <CerrarIcon className="h-5 w-5" />
          </button>
        </div>

        {ENLACES_NAV.map((enlace) => (
          <Link
            key={enlace.href}
            href={enlace.href}
            onClick={() => setAbierto(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            {enlace.etiqueta}
          </Link>
        ))}
      </nav>
    </div>
  );
}
