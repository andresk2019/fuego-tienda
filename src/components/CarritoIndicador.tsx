'use client';

import Link from 'next/link';
import { useCarrito } from '@/components/CarritoContext';
import { cantidadTotalCarrito } from '@/lib/carrito';

export default function CarritoIndicador() {
  const { items } = useCarrito();
  const cantidad = cantidadTotalCarrito(items);

  return (
    <Link
      href="/carrito"
      className="transition-colors hover:text-foreground"
    >
      Carrito
      {cantidad > 0 && (
        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-xs font-semibold text-on-ember">
          {cantidad}
        </span>
      )}
    </Link>
  );
}
