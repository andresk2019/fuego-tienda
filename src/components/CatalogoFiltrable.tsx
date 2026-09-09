"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIAS, type CategoriaSlug } from "@/lib/categorias";
import { esPersonalizable } from "@/lib/personalizacion";
import type { ProductoCatalogo } from "@/lib/db";
import { productoHref } from "@/lib/slug";
import Chip from "@/components/Chip";
import FiltroPrecio from "@/components/FiltroPrecio";
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
  const [busqueda, setBusqueda] = useState("");

  // Rango de precio "dinámico": el mínimo/máximo del slider no está
  // fijo en el código, se calcula a partir de los productos que de
  // verdad llegan por props (ya filtrados por sección/subcategoría en
  // CatalogoPorSeccion) — así que si cambias de subcategoría, el
  // slider se ajusta solo al precio real de esos productos.
  const [precioMinDisponible, precioMaxDisponible] = useMemo(() => {
    if (productos.length === 0) return [0, 0];
    const precios = productos.map((p) => p.precioVenta);
    return [Math.min(...precios), Math.max(...precios)];
  }, [productos]);

  const [rangoPrecio, setRangoPrecio] = useState<[number, number]>([
    precioMinDisponible,
    precioMaxDisponible,
  ]);

  // Cuando `productos` cambia de verdad (nueva sección/subcategoría,
  // ver CatalogoPorSeccion), los 3 filtros vuelven a su estado inicial
  // — si no, un filtro elegido para "Velas" (ej. categoría "Navidad",
  // o un rango de precio angosto) podría dejar vacía a "Sales
  // Relajantes" sin que se note por qué. Se ajusta el estado en el
  // mismo render (patrón de React para esto) en vez de con un
  // useEffect: así nunca se alcanza a pintar un instante con la lista
  // vacía por un filtro que ya no aplica.
  const [productosRecordados, setProductosRecordados] = useState(productos);
  if (productosRecordados !== productos) {
    setProductosRecordados(productos);
    setRangoPrecio([precioMinDisponible, precioMaxDisponible]);
    setCategoriaActiva("todas");
    setBusqueda("");
  }

  const terminoBusqueda = busqueda.trim().toLowerCase();

  const productosFiltrados = productos
    .filter((p) =>
      categoriaActiva === "todas" ? true : p.categoria === categoriaActiva
    )
    .filter(
      (p) =>
        p.precioVenta >= rangoPrecio[0] && p.precioVenta <= rangoPrecio[1]
    )
    .filter(
      (p) => !terminoBusqueda || p.nombre.toLowerCase().includes(terminoBusqueda)
    );

  return (
    <div>
      {/* Los 3 filtros viven juntos en un solo recuadro — antes el
          buscador estaba suelto arriba de todo y se veía más
          protagonista que el resto del menú. Aquí busca solo dentro
          de lo que ya se está viendo (misma sección/subcategoría),
          igual que categoría y precio — no cruza a otras secciones. */}
      <div className="mb-10 flex flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex w-full flex-col items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">
            Buscar producto
          </span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
          />
        </div>

        <div className="flex flex-col items-center gap-2">
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

        {precioMinDisponible < precioMaxDisponible && (
          <FiltroPrecio
            minDisponible={precioMinDisponible}
            maxDisponible={precioMaxDisponible}
            valor={rangoPrecio}
            onCambiar={setRangoPrecio}
          />
        )}
      </div>

      {productosFiltrados.length === 0 ? (
        <p className="text-center text-muted">
          No hay productos que coincidan con este filtro todavía.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {productosFiltrados.map((producto) => (
            <li key={producto.id}>
              <Link href={productoHref(producto)} className="block h-full">
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
