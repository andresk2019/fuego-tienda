"use client";

import { useMemo, useState } from "react";
import { SECCIONES } from "@/lib/secciones";
import type { ProductoCatalogo } from "@/lib/db";
import CatalogoFiltrable from "@/components/CatalogoFiltrable";
import Chip from "@/components/Chip";
import FlameIcon from "@/components/FlameIcon";

// Primer y segundo nivel de organización de la tienda: Sección (ej.
// "Aromas para tu Hogar") -> Subcategoría (ej. "Velas", "Difusores de
// Olores"). Dentro de la subcategoría "Velas" se anida un tercer
// nivel, las categorías por ocasión (ver CatalogoFiltrable). Las
// demás subcategorías todavía no tienen productos en Contabilidad
// Lady, así que muestran un aviso de "Próximamente".
//
// Los 3 niveles se ven a propósito distintos entre sí (pestañas con
// subrayado / píldoras sólidas / píldoras solo de contorno), para que
// no se confundan entre sí como pasaba antes, cuando los tres usaban
// el mismo estilo de botón.
export default function CatalogoPorSeccion({
  productos,
}: {
  productos: ProductoCatalogo[];
}) {
  const [seccionActiva, setSeccionActiva] = useState(SECCIONES[0]);
  const [subcategoriaActiva, setSubcategoriaActiva] = useState(
    SECCIONES[0].subcategorias[0].slug
  );
  const [busqueda, setBusqueda] = useState("");

  function elegirSeccion(seccion: (typeof SECCIONES)[number]) {
    setSeccionActiva(seccion);
    setSubcategoriaActiva(seccion.subcategorias[0].slug);
  }

  // Buscar por nombre ignora a propósito la sección/subcategoría
  // activa (mismo criterio que ya usa el buscador del panel de
  // admin): cruza TODO el catálogo, no solo lo que se esté viendo en
  // ese momento — si no, habría que adivinar primero en qué
  // sección/subcategoría vive el producto antes de poder buscarlo.
  const buscando = busqueda.trim().length > 0;

  const productosMostrados = useMemo(() => {
    if (buscando) {
      const termino = busqueda.trim().toLowerCase();
      return productos.filter((p) => p.nombre.toLowerCase().includes(termino));
    }
    return productos.filter((p) => p.subcategoria === subcategoriaActiva);
  }, [productos, buscando, busqueda, subcategoriaActiva]);

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto por nombre..."
          className="w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
        />
      </div>

      {/* La navegación por sección/subcategoría solo tiene sentido
          cuando no se está buscando — buscar ya cruza todos los
          grupos. */}
      {!buscando && (
        <>
          {/* Nivel 1: Sección — pestañas con subrayado, como la
              navegación principal del catálogo. */}
          <nav
            aria-label="Secciones"
            className="mb-8 flex justify-center gap-8 border-b border-border"
          >
            {SECCIONES.map((seccion) => (
              <button
                key={seccion.slug}
                type="button"
                onClick={() => elegirSeccion(seccion)}
                aria-pressed={seccionActiva.slug === seccion.slug}
                className={`-mb-px border-b-2 pb-3 font-serif text-base transition-colors ${
                  seccionActiva.slug === seccion.slug
                    ? "border-ember text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {seccion.nombre}
              </button>
            ))}
          </nav>

          {/* Nivel 2: Subcategoría, dentro de la sección activa —
              píldoras sólidas, más protagonistas que el filtro de
              categoría de más abajo. Sin etiqueta visible:
              "subcategoría" es un término de organización interna,
              no algo para mostrar al cliente. */}
          <div className="mb-10 flex justify-center">
            <nav
              aria-label="Subcategorías"
              className="flex flex-wrap justify-center gap-2"
            >
              {seccionActiva.subcategorias.map((sub) => (
                <Chip
                  key={sub.slug}
                  size="lg"
                  activo={subcategoriaActiva === sub.slug}
                  onClick={() => setSubcategoriaActiva(sub.slug)}
                >
                  {sub.nombre}
                </Chip>
              ))}
            </nav>
          </div>
        </>
      )}

      {productosMostrados.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FlameIcon className="h-8 w-8 text-ember/40" />
          <p className="text-muted">
            {buscando
              ? `No encontramos productos que coincidan con "${busqueda}".`
              : "Estamos preparando esta categoría. ¡Vuelve pronto!"}
          </p>
        </div>
      ) : (
        <CatalogoFiltrable productos={productosMostrados} />
      )}
    </div>
  );
}
