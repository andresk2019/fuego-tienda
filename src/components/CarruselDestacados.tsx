"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProductoCatalogo } from "@/lib/db";
import FlameIcon from "@/components/FlameIcon";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// Los productos que aparecen aquí los elige el dueño desde el panel
// de administración (checkbox "Destacar" en cada producto) — todavía
// no hay ventas reales en la tienda para calcular esto solo, así que
// es una selección manual.
export default function CarruselDestacados({
  productos,
}: {
  productos: ProductoCatalogo[];
}) {
  const listaRef = useRef<HTMLUListElement>(null);

  if (productos.length === 0) return null;

  function desplazar(direccion: 1 | -1) {
    listaRef.current?.scrollBy({ left: direccion * 260, behavior: "smooth" });
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl text-foreground">
          Las más vendidas
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => desplazar(-1)}
            aria-label="Anterior"
            className="rounded-full border border-border p-2 text-muted transition-colors hover:border-ember/60 hover:text-foreground"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => desplazar(1)}
            aria-label="Siguiente"
            className="rounded-full border border-border p-2 text-muted transition-colors hover:border-ember/60 hover:text-foreground"
          >
            →
          </button>
        </div>
      </div>

      <ul
        ref={listaRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {productos.map((producto) => (
          <li key={producto.id} className="w-48 shrink-0 snap-start">
            <Link
              href={`/productos/${producto.id}`}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-ember/60 hover:bg-surface-hover"
            >
              {producto.fotoUrl ? (
                <Image
                  src={producto.fotoUrl}
                  alt={producto.nombre}
                  width={160}
                  height={160}
                  className="h-32 w-full rounded-xl object-cover"
                />
              ) : (
                <FlameIcon className="h-5 w-5 text-ember/70 transition-colors group-hover:text-ember" />
              )}
              <h3 className="font-serif text-base text-foreground">
                {producto.nombre}
              </h3>
              <p className="text-sm font-semibold text-foreground">
                {formatoCOP.format(producto.precioVenta)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
