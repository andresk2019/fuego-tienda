'use client';

import Link from 'next/link';
import { useCarrito } from '@/components/CarritoContext';
import { cantidadTotalCarrito } from '@/lib/carrito';
import CarritoIcon from '@/components/CarritoIcon';

// El contador va superpuesto en la esquina del ícono (no al lado del
// texto como antes) — es el patrón que cualquiera reconoce de una
// tienda online, y hace que el carrito "salte a la vista" apenas
// tiene algo adentro.
export default function CarritoIndicador() {
  const { items } = useCarrito();
  const cantidad = cantidadTotalCarrito(items);

  return (
    <Link
      href="/carrito"
      className="flex items-center gap-1.5 transition-colors hover:text-foreground"
    >
      <span className="relative">
        <CarritoIcon className="h-5 w-5" />
        {cantidad > 0 && (
          <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-semibold text-on-ember">
            {cantidad}
          </span>
        )}
      </span>
      Carrito
    </Link>
  );
}
