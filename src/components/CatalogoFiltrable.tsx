"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIAS, type CategoriaSlug } from "@/lib/categorias";
import type { ProductoCatalogo } from "@/lib/db";
import FlameIcon from "@/components/FlameIcon";

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
        className="mb-10 flex flex-wrap justify-center gap-2"
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
        <p className="text-center text-muted">
          No hay productos en esta categoría todavía.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {productosFiltrados.map((producto) => (
            <li key={producto.id}>
              <Link
                href={`/productos/${producto.id}`}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-ember/60 hover:bg-surface-hover"
              >
                <FlameIcon className="h-5 w-5 text-ember/70 transition-colors group-hover:text-ember" />
                <h2 className="font-serif text-lg text-foreground">
                  {producto.nombre}
                </h2>
                <p className="text-lg font-semibold text-foreground">
                  {formatoCOP.format(producto.precioVenta)}
                </p>
                {!producto.disponible && (
                  <span className="inline-flex w-fit rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
                    Agotado
                  </span>
                )}
                {producto.disponible && producto.pocasUnidades && (
                  <span className="inline-flex w-fit rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                    ¡Últimas unidades!
                  </span>
                )}
                <span className="mt-auto text-xs text-muted transition-colors group-hover:text-ember">
                  Ver más →
                </span>
              </Link>
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
          ? "border-ember bg-ember text-foreground"
          : "border-border text-muted hover:border-ember/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
