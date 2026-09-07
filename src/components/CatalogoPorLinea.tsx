"use client";

import { useState } from "react";
import { LINEAS, type LineaSlug } from "@/lib/lineas";
import type { ProductoCatalogo } from "@/lib/db";
import CatalogoFiltrable from "@/components/CatalogoFiltrable";
import Chip from "@/components/Chip";
import FlameIcon from "@/components/FlameIcon";

// Primer nivel de organización de la tienda: la línea de producto de
// Fuego (Velas / Sales Relajantes / Difusores de Olores). Dentro de
// "Velas" se anidan las categorías por ocasión (ver CatalogoFiltrable).
// Las demás líneas todavía no tienen productos en Contabilidad Lady,
// así que muestran un aviso de "Próximamente" en vez de un catálogo
// vacío o de esconder la sección.
export default function CatalogoPorLinea({
  productos,
}: {
  productos: ProductoCatalogo[];
}) {
  const [lineaActiva, setLineaActiva] = useState<LineaSlug>("velas");

  const productosDeLaLinea = productos.filter((p) => p.linea === lineaActiva);

  return (
    <div>
      <nav
        aria-label="Líneas de producto"
        className="mb-8 flex flex-wrap justify-center gap-3"
      >
        {LINEAS.map((linea) => (
          <Chip
            key={linea.slug}
            size="lg"
            activo={lineaActiva === linea.slug}
            onClick={() => setLineaActiva(linea.slug)}
          >
            {linea.nombre}
          </Chip>
        ))}
      </nav>

      {productosDeLaLinea.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FlameIcon className="h-8 w-8 text-ember/40" />
          <p className="text-muted">
            Estamos preparando esta línea. ¡Vuelve pronto!
          </p>
        </div>
      ) : (
        <CatalogoFiltrable productos={productosDeLaLinea} />
      )}
    </div>
  );
}
