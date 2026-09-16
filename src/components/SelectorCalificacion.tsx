"use client";

import { CALIFICACION_MAXIMA } from "@/lib/resenas";
import EstrellaIcon from "@/components/EstrellaIcon";

// Selector de calificación con estrellas clickeables — más rápido que
// escribir un número, y de una vez muestra cómo se va a ver la
// reseña ya publicada. Lo usan tanto el formulario de admin para
// cargar una reseña a mano (ListaResenas.tsx) como el formulario
// público para que el cliente deje la suya (FormularioResenaCliente.tsx).
export default function SelectorCalificacion({
  valor,
  onCambiar,
}: {
  valor: number;
  onCambiar: (valor: number) => void;
}) {
  return (
    <div className="flex gap-1 text-ember">
      {Array.from({ length: CALIFICACION_MAXIMA }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onCambiar(i + 1)}
          aria-label={`${i + 1} estrellas`}
          className="cursor-pointer"
        >
          <EstrellaIcon llena={i < valor} className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}
