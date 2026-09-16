"use client";

import Link from "next/link";
import { useFavoritos } from "@/components/FavoritosContext";
import { esPersonalizable } from "@/lib/personalizacion";
import { productoHref } from "@/lib/slug";
import type { ProductoCatalogo } from "@/lib/db";
import type { ResumenResenas } from "@/lib/resenas-db";
import TarjetaProducto from "@/components/TarjetaProducto";
import CorazonIcon from "@/components/CorazonIcon";

// Cruza los ids guardados en el navegador (ver FavoritosContext.tsx)
// contra el catálogo real que llega por props desde el servidor — así
// cada visita muestra el producto tal cual está HOY (precio,
// disponibilidad, foto), nunca una versión guardada que se pueda
// desactualizar. Si un producto se elimina del catálogo, su id
// guardado simplemente deja de encontrar coincidencia y desaparece
// solo, sin dejar un favorito "roto".
export default function FavoritosCliente({
  productos,
  resumenResenasPorProducto,
}: {
  productos: ProductoCatalogo[];
  resumenResenasPorProducto: Record<number, ResumenResenas>;
}) {
  const { favoritos } = useFavoritos();
  const productosFavoritos = productos.filter((p) =>
    favoritos.includes(p.id)
  );

  if (productosFavoritos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-ember/40">
          <CorazonIcon llena={false} className="h-8 w-8" />
        </span>
        <div>
          <p className="font-medium text-foreground">
            Todavía no tienes favoritos
          </p>
          <p className="mt-1 text-sm text-muted">
            Toca el corazón en cualquier producto para guardarlo aquí y
            decidir después si lo compras.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {productosFavoritos.map((producto) => (
        <li key={producto.id}>
          <TarjetaProducto
            href={productoHref(producto)}
            productoId={producto.id}
            nombre={producto.nombre}
            precioVenta={producto.precioVenta}
            fotoUrl={producto.fotoUrl}
            disponible={producto.disponible}
            pocasUnidades={producto.pocasUnidades}
            personalizable={esPersonalizable(producto.id)}
            esVela={producto.subcategoria === "velas"}
            resumenResenas={resumenResenasPorProducto[producto.id] ?? null}
          />
        </li>
      ))}
    </ul>
  );
}
