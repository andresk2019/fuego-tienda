"use client";

import { useFavoritos } from "@/components/FavoritosContext";
import CorazonIcon from "@/components/CorazonIcon";

// Corazón para marcar/desmarcar un producto como favorito — vive
// dentro de la tarjeta del catálogo (que a su vez vive dentro de un
// <Link>, ver TarjetaProducto.tsx), así que detiene el clic para que
// marcar como favorito no navegue a la ficha por accidente.
export default function FavoritoBoton({
  productoId,
  className = "absolute top-3 right-3 z-10 rounded-full bg-surface/90 p-1.5 text-ember shadow-sm backdrop-blur-sm transition-transform hover:scale-110",
}: {
  productoId: number;
  className?: string;
}) {
  const { esFavorito, alternarFavorito } = useFavoritos();
  const activo = esFavorito(productoId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alternarFavorito(productoId);
      }}
      aria-label={activo ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={activo}
      className={className}
    >
      <CorazonIcon llena={activo} className="h-4 w-4" />
    </button>
  );
}
