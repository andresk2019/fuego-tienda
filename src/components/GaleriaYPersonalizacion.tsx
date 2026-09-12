"use client";

import { useState } from "react";
import type { CategoriaSlug } from "@/lib/categorias";
import ImagenProducto from "@/components/ImagenProducto";
import FichaProducto from "@/components/FichaProducto";
import PersonalizarVela from "@/components/PersonalizarVela";

// Envuelve la foto grande Y la ficha/personalización juntas (en vez
// de que cada una viva por su lado, como en productos/[id]/page.tsx)
// porque necesitan compartir el color elegido: la foto está en la
// columna izquierda, el selector de color en la derecha, y ninguna de
// las dos es dueña de la otra. Solo se usa para las velas
// personalizables — las demás velas siguen mostrando la foto fija
// directo desde la página (Server Component), sin este cliente.
export default function GaleriaYPersonalizacion({
  productoId,
  nombre,
  precioVenta,
  categoria,
  disponible,
  pocasUnidades,
  descripcion,
  fotoUrl,
  fotosPorColor,
  descripcionesAromas,
}: {
  productoId: number;
  nombre: string;
  precioVenta: number;
  categoria: CategoriaSlug;
  disponible: boolean;
  pocasUnidades: boolean;
  descripcion: string;
  fotoUrl: string | null;
  fotosPorColor: Record<string, string>;
  descripcionesAromas?: Record<string, string>;
}) {
  // null = no hay color "activo" todavía (el cliente no ha entrado a
  // personalizar) — se muestra la foto principal de siempre.
  const [colorActivo, setColorActivo] = useState<string | null>(null);
  const fotoActual =
    (colorActivo && fotosPorColor[colorActivo]) || fotoUrl;

  return (
    <>
      <ImagenProducto fotoUrl={fotoActual} alt={nombre} />

      <div className="flex flex-col gap-4">
        <FichaProducto
          categoria={categoria}
          nombre={nombre}
          precioVenta={precioVenta}
          disponible={disponible}
          pocasUnidades={pocasUnidades}
          descripcion={descripcion}
        />

        <PersonalizarVela
          productoId={productoId}
          nombre={nombre}
          precioUnitario={precioVenta}
          disponible={disponible}
          descripcionesAromas={descripcionesAromas}
          onCambiarColor={setColorActivo}
        />
      </div>
    </>
  );
}
