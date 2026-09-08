"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIAS, type CategoriaSlug } from "@/lib/categorias";
import { esPersonalizable } from "@/lib/personalizacion";
import type { ProductoCatalogo } from "@/lib/db";
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
  // Recuerda para qué límites es válido `rangoPrecio` — cuando cambian
  // (nueva subcategoría con otros precios) se reinicia el rango para
  // que vuelva a abarcar todo, ajustando el estado en el mismo render
  // (patrón de React para esto) en vez de con un useEffect: así nunca
  // se alcanza a pintar un instante con la lista vacía por un rango
  // que ya no aplica (ej. "Velas" en $25.000–$48.000 filtrando a cero
  // productos de "Sales Relajantes" antes de reajustarse).
  const [limitesRecordados, setLimitesRecordados] = useState([
    precioMinDisponible,
    precioMaxDisponible,
  ]);
  if (
    limitesRecordados[0] !== precioMinDisponible ||
    limitesRecordados[1] !== precioMaxDisponible
  ) {
    setLimitesRecordados([precioMinDisponible, precioMaxDisponible]);
    setRangoPrecio([precioMinDisponible, precioMaxDisponible]);
  }

  const productosFiltrados = productos
    .filter((p) =>
      categoriaActiva === "todas" ? true : p.categoria === categoriaActiva
    )
    .filter(
      (p) =>
        p.precioVenta >= rangoPrecio[0] && p.precioVenta <= rangoPrecio[1]
    );

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

      {precioMinDisponible < precioMaxDisponible && (
        <div className="mb-10 flex justify-center">
          <FiltroPrecio
            minDisponible={precioMinDisponible}
            maxDisponible={precioMaxDisponible}
            valor={rangoPrecio}
            onCambiar={setRangoPrecio}
          />
        </div>
      )}

      {productosFiltrados.length === 0 ? (
        <p className="text-center text-muted">
          No hay productos que coincidan con este filtro todavía.
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
