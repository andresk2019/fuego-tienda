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
// nivel, las categorías por ocasión (ver CatalogoFiltrable). Las
// demás subcategorías todavía no tienen productos en Contabilidad
// Lady, así que muestran un aviso de "Próximamente".
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
      <nav
        aria-label="Secciones"
        className="mb-4 flex flex-wrap justify-center gap-3"
      >
        {SECCIONES.map((seccion) => (
          <Chip
            key={seccion.slug}
            size="lg"
            activo={seccionActiva.slug === seccion.slug}
            onClick={() => elegirSeccion(seccion)}
          >
            {seccion.nombre}
          </Chip>
        ))}
      </nav>

      <nav
        aria-label="Subcategorías"
        className="mb-8 flex flex-wrap justify-center gap-2"
      >
        {seccionActiva.subcategorias.map((sub) => (
          <Chip
            key={sub.slug}
            activo={subcategoriaActiva === sub.slug}
            onClick={() => setSubcategoriaActiva(sub.slug)}
          >
            {sub.nombre}
          </Chip>
        ))}
      </nav>

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
