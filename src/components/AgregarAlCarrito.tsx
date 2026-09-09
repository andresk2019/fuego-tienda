'use client';

import { useState } from 'react';
import { useCarrito } from '@/components/CarritoContext';
import SelectorConBusqueda from '@/components/SelectorConBusqueda';

export default function AgregarAlCarrito({
  productoId,
  nombre,
  precioUnitario,
  disponible,
  aromas,
}: {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  disponible: boolean;
  // Si se pasa (ver AROMAS_DISPONIBLES en personalizacion.ts), se
  // muestra un selector de aroma antes de agregar al carrito — aplica
  // a TODAS las velas, no solo a las que además admiten
  // personalización completa (color/nombre secreto, ver
  // PersonalizarVela.tsx). Se omite para productos que no son velas.
  aromas?: readonly string[];
}) {
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [aromaElegido, setAromaElegido] = useState<string>(aromas?.[0] ?? '');
  const [agregado, setAgregado] = useState(false);

  if (!disponible) return null;

  function manejarAgregar() {
    agregar({
      productoId,
      nombre,
      precioUnitario,
      cantidad,
      aroma: aromaElegido || undefined,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      {aromas && aromas.length > 0 && (
        <label className="flex max-w-xs flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Aroma</span>
          <SelectorConBusqueda
            opciones={aromas}
            valor={aromaElegido}
            onCambiar={setAromaElegido}
            placeholder="Buscar aroma..."
          />
        </label>
      )}

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
    </div>
  );
}
