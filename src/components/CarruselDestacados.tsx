"use client";

import { useRef } from "react";
import Link from "next/link";
import type { ProductoCatalogo } from "@/lib/db";
import { productoHref } from "@/lib/slug";
import FotoProducto from "@/components/FotoProducto";
import EstrellaIcon from "@/components/EstrellaIcon";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// Los productos que aparecen aquí los elige el dueño desde el panel
// de administración (checkbox "Destacar" en cada producto) — todavía
// no hay ventas reales en la tienda para calcular esto solo, así que
// es una selección manual.
//
// Va envuelto en su propia franja con fondo distinto (no el mismo
// crema del resto de la página) y las tarjetas son más grandes que
// las del catálogo — a propósito, para que sea lo primero que salte a
// la vista después del banner de bienvenida, antes que la franja de
// confianza (decisión del dueño, 2026-09-16: los productos deben
// captar la atención primero).
export default function CarruselDestacados({
  productos,
}: {
  productos: ProductoCatalogo[];
}) {
  const listaRef = useRef<HTMLUListElement>(null);

  if (productos.length === 0) return null;

  function desplazar(direccion: 1 | -1) {
    listaRef.current?.scrollBy({ left: direccion * 280, behavior: "smooth" });
  }

  return (
    <section className="border-b border-border bg-gradient-to-b from-ember/10 via-ember/5 to-background px-6 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ember/15 px-3 py-1 text-xs font-semibold tracking-wide text-ember uppercase">
              <EstrellaIcon llena className="h-3.5 w-3.5" />
              Elegidas por nuestros clientes
            </span>
            <h2 className="mt-3 font-serif text-3xl text-foreground">
              Las más vendidas
            </h2>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => desplazar(-1)}
              aria-label="Anterior"
              className="rounded-full border border-ember/30 bg-surface p-2.5 text-ember transition-colors hover:border-ember hover:bg-ember hover:text-on-ember"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => desplazar(1)}
              aria-label="Siguiente"
              className="rounded-full border border-ember/30 bg-surface p-2.5 text-ember transition-colors hover:border-ember hover:bg-ember hover:text-on-ember"
            >
              →
            </button>
          </div>
        </div>

        <ul
          ref={listaRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {productos.map((producto) => (
            <li key={producto.id} className="w-56 shrink-0 snap-start">
              <Link
                href={productoHref(producto)}
                className="group relative flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-ember/60 hover:shadow-lg"
              >
                <span className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-ember px-2 py-1 text-[10px] font-semibold text-on-ember shadow-sm">
                  <EstrellaIcon llena className="h-3 w-3" />
                  Destacado
                </span>
                <FotoProducto
                  fotoUrl={producto.fotoUrl}
                  alt={producto.nombre}
                  sizes="224px"
                  iconClassName="h-6 w-6 text-ember/70 transition-colors group-hover:text-ember"
                />
                <h3 className="font-serif text-lg text-foreground">
                  {producto.nombre}
                </h3>
                <p className="text-base font-semibold text-ember">
                  {formatoCOP.format(producto.precioVenta)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
