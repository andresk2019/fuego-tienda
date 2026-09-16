"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCarrito } from "@/components/CarritoContext";
import { totalCarrito, detallesItem } from "@/lib/carrito";
import CerrarIcon from "@/components/CerrarIcon";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// Panel que aparece a la derecha apenas se agrega un producto (ver
// agregar() en CarritoContext.tsx) — antes la única señal era el
// texto del botón cambiando a "¡Agregado!" por 2 segundos, fácil de
// no notar. Ahora el cliente ve de una vez qué quedó en el carrito,
// sin salir de la página donde estaba comprando, y decide si sigue
// viendo el catálogo o va derecho a pagar.
export default function CarritoLateral() {
  const { items, abierto, cerrarCarrito } = useCarrito();
  const subtotal = totalCarrito(items);

  useEffect(() => {
    if (!abierto) return;
    document.body.style.overflow = "hidden";
    function alPresionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") cerrarCarrito();
    }
    window.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto, cerrarCarrito]);

  return (
    <>
      <div
        onClick={cerrarCarrito}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Carrito"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-surface shadow-xl transition-transform duration-300 ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-lg text-foreground">Tu carrito</h2>
          <button
            type="button"
            onClick={cerrarCarrito}
            aria-label="Cerrar carrito"
            className="p-1 text-muted transition-colors hover:text-foreground"
          >
            <CerrarIcon className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="flex-1 px-5 py-8 text-center text-sm text-muted">
            Tu carrito está vacío.
          </p>
        ) : (
          <ul className="flex-1 overflow-y-auto px-5 py-4">
            {items.map((item) => {
              const detalles = detallesItem(item);
              return (
                <li
                  key={item.clave}
                  className="flex items-start justify-between gap-3 border-b border-border py-3 first:pt-0 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.cantidad}x {item.nombre}
                    </p>
                    {detalles && (
                      <p className="text-xs text-muted">{detalles}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-muted">
                    {formatoCOP.format(item.precioUnitario * item.cantidad)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="flex items-center justify-between text-sm font-medium text-foreground">
              <span>Subtotal</span>
              <span>{formatoCOP.format(subtotal)}</span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/carrito"
                onClick={cerrarCarrito}
                className="rounded-lg bg-ember px-4 py-2.5 text-center text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
              >
                Ver carrito y pagar
              </Link>
              <button
                type="button"
                onClick={cerrarCarrito}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
