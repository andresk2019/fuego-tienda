"use client";

import { useState } from "react";
import { SECCIONES } from "@/lib/secciones";
import type { ProductoCatalogo } from "@/lib/db";
import CatalogoFiltrable from "@/components/CatalogoFiltrable";
import Chip from "@/components/Chip";
import FlameIcon from "@/components/FlameIcon";

// Primer y segundo nivel de organización de la tienda: Sección (ej.
// "Aromas para tu Hogar") -> Subcategoría (ej. "Velas", "Difusores de
// Olores"). Dentro de la subcategoría "Velas" se anida un tercer
// nivel, las categorías por ocasión, el precio y el buscador por
// nombre (ver CatalogoFiltrable) — los 3 filtran solo dentro de la
// subcategoría activa, no cruzan a otras. Las demás subcategorías
// todavía no tienen productos en Contabilidad Lady, así que muestran
// un aviso de "Próximamente".
//
// Los 2 niveles de aquí se ven a propósito distintos entre sí
// (pestañas con subrayado / píldoras sólidas), para que no se
// confundan entre sí como pasaba antes, cuando usaban el mismo
// estilo de botón.
export default function CatalogoPorSeccion({
  productos,
}: {
  productos: ProductoCatalogo[];
}) {
  const [seccionActiva, setSeccionActiva] = useState(SECCIONES[0]);
  const [subcategoriaActiva, setSubcategoriaActiva] = useState(
    SECCIONES[0].subcategorias[0].slug
  );

  function elegirSeccion(seccion: (typeof SECCIONES)[number]) {
    setSeccionActiva(seccion);
    setSubcategoriaActiva(seccion.subcategorias[0].slug);
  }

  const productosDeLaSubcategoria = productos.filter(
    (p) => p.subcategoria === subcategoriaActiva
  );

  return (
    <div>
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
          píldoras sólidas, más protagonistas que los filtros de más
          abajo. Sin etiqueta visible: "subcategoría" es un término de
          organización interna, no algo para mostrar al cliente. */}
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

      {productosDeLaSubcategoria.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FlameIcon className="h-8 w-8 text-ember/40" />
          <p className="text-muted">
            Estamos preparando esta categoría. ¡Vuelve pronto!
          </p>
        </div>
      ) : (
        <CatalogoFiltrable productos={productosDeLaSubcategoria} />
      )}
    </div>
  );
}
