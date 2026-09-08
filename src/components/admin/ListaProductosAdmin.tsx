'use client';

import { useState } from 'react';
import SubirFotoForm from '@/components/admin/SubirFotoForm';
import type { CategoriaSlug } from '@/lib/categorias';

type ProductoParaAdmin = {
  id: number;
  nombre: string;
  precioVenta: number;
  categoria: CategoriaSlug;
  disponible: boolean;
  pocasUnidades: boolean;
  personalizable: boolean;
  fotoUrl: string | null;
  descripcion: string;
  destacado: boolean;
};

// Buscador para no tener que desplazarse por los 23+ productos cada
// vez — filtra por nombre en el navegador (son pocos productos, no
// hace falta ir al servidor por esto).
export default function ListaProductosAdmin({
  productos,
}: {
  productos: ProductoParaAdmin[];
}) {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <div>
      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar producto por nombre..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
      />

      {filtrados.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No hay productos que coincidan con &ldquo;{busqueda}&rdquo;.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {filtrados.map((producto) => (
            <SubirFotoForm
              key={producto.id}
              productoId={producto.id}
              nombre={producto.nombre}
              precioVenta={producto.precioVenta}
              categoria={producto.categoria}
              disponible={producto.disponible}
              pocasUnidades={producto.pocasUnidades}
              personalizable={producto.personalizable}
              fotoUrl={producto.fotoUrl}
              descripcion={producto.descripcion}
              destacado={producto.destacado}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
