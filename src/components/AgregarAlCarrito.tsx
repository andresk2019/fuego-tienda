'use client';

import { useState } from 'react';
import { useCarrito } from '@/components/CarritoContext';

export default function AgregarAlCarrito({
  productoId,
  nombre,
  precioUnitario,
  disponible,
}: {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  disponible: boolean;
}) {
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  if (!disponible) return null;

  function manejarAgregar() {
    agregar({ productoId, nombre, precioUnitario, cantidad });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={cantidad}
        onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
        aria-label="Cantidad"
        className="w-16 rounded-lg border border-border bg-background px-2 py-2 text-center text-foreground"
      />
      <button
        type="button"
        onClick={manejarAgregar}
        className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
      >
        {agregado ? '¡Agregado!' : 'Agregar al carrito'}
      </button>
    </div>
  );
}
