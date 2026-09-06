"use client";

import { useMemo, useState } from "react";
import { CATEGORIAS, type CategoriaSlug } from "@/lib/categorias";
import type { ProductoCatalogo } from "@/lib/db";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

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
      <nav
        aria-label="Categorías"
        className="mb-8 flex flex-wrap justify-center gap-2"
      >
        <Chip
          activo={categoriaActiva === "todas"}
          onClick={() => setCategoriaActiva("todas")}
        >
          Todas
        </Chip>
        {categoriasConProductos.map((c) => (
          <Chip
            key={c.slug}
            activo={categoriaActiva === c.slug}
            onClick={() => setCategoriaActiva(c.slug)}
          >
            {c.nombre}
          </Chip>
        ))}
      </nav>

      {productosFiltrados.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400">
          No hay productos en esta categoría todavía.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {productosFiltrados.map((producto) => (
            <li
              key={producto.id}
              className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <h2 className="font-medium text-neutral-900 dark:text-neutral-50">
                {producto.nombre}
              </h2>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                {formatoCOP.format(producto.precioVenta)}
              </p>
              {!producto.disponible && (
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Agotado
                </span>
              )}
              {producto.disponible && producto.pocasUnidades && (
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  ¡Últimas unidades!
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        activo
          ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-900"
          : "border-neutral-300 text-neutral-700 hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
      }`}
    >
      {children}
    </button>
  );
}
