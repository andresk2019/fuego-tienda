"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIAS, type CategoriaSlug } from "@/lib/categorias";
import { esPersonalizable } from "@/lib/personalizacion";
import type { ProductoCatalogo } from "@/lib/db";
import Chip from "@/components/Chip";
import TarjetaProducto from "@/components/TarjetaProducto";

export default function CatalogoFiltrable({
  productos,
}: {
  productos: ProductoCatalogo[];
}) {
  // Solo se muestran en el menú las categorías que de verdad tienen
  // productos hoy (en el orden definido en CATEGORIAS), para no listar
  // secciones vacías.
  const categoriasConProductos = useMemo(() => {
    const presentes = new Set(productos.map((p) => p.categoria));
    return CATEGORIAS.filter((c) => presentes.has(c.slug));
  }, [productos]);

  const [categoriaActiva, setCategoriaActiva] = useState<
    CategoriaSlug | "todas"
  >("todas");

  const productosFiltrados =
    categoriaActiva === "todas"
      ? productos
      : productos.filter((p) => p.categoria === categoriaActiva);

  return (
    <div>
      <div className="mb-10 flex flex-col items-center gap-2">
        <span className="text-xs font-medium tracking-wide text-muted uppercase">
          Filtrar por categoría
        </span>
        <nav
          aria-label="Categorías"
          className="flex flex-wrap justify-center gap-2"
        >
          <Chip
            variant="contorno"
            size="sm"
            activo={categoriaActiva === "todas"}
            onClick={() => setCategoriaActiva("todas")}
          >
            Todas
          </Chip>
          {categoriasConProductos.map((c) => (
            <Chip
              key={c.slug}
              variant="contorno"
              size="sm"
              activo={categoriaActiva === c.slug}
              onClick={() => setCategoriaActiva(c.slug)}
            >
              {c.nombre}
            </Chip>
          ))}
        </nav>
      </div>

      {productosFiltrados.length === 0 ? (
        <p className="text-center text-muted">
          No hay productos en esta categoría todavía.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {productosFiltrados.map((producto) => (
            <li key={producto.id}>
              <Link href={`/productos/${producto.id}`} className="block h-full">
                <TarjetaProducto
                  nombre={producto.nombre}
                  precioVenta={producto.precioVenta}
                  fotoUrl={producto.fotoUrl}
                  disponible={producto.disponible}
                  pocasUnidades={producto.pocasUnidades}
                  personalizable={esPersonalizable(producto.id)}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
