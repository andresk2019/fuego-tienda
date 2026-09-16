"use client";

import { useCarrito } from "@/components/CarritoContext";
import { cantidadTotalCarrito } from "@/lib/carrito";
import CarritoIcon from "@/components/CarritoIcon";

// Botón fijo para abrir el carrito lateral desde cualquier punto de
// la página, sin tener que volver a subir al header — útil sobre
// todo en el catálogo, donde el cliente puede estar varios scrolls
// abajo cuando quiere revisar qué lleva. Esquina opuesta al botón de
// WhatsApp (ver WhatsAppFlotante.tsx) para que nunca se encimen.
export default function CarritoFlotante() {
  const { items, abrirCarrito } = useCarrito();
  const cantidad = cantidadTotalCarrito(items);

  return (
    <button
      type="button"
      onClick={abrirCarrito}
      aria-label="Ver carrito"
      className="fixed bottom-5 left-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-on-ember shadow-lg transition-colors hover:bg-ember-hover"
    >
      <span className="relative">
        <CarritoIcon className="h-6 w-6" />
        {cantidad > 0 && (
          <span className="absolute -top-2.5 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1 text-[10px] font-semibold text-ember">
            {cantidad}
          </span>
        )}
      </span>
    </button>
  );
}
