'use client';

import { useMemo, useState } from 'react';
import SubirFotoForm from '@/components/admin/SubirFotoForm';
import Chip from '@/components/Chip';
import { SECCIONES, type SubcategoriaSlug } from '@/lib/secciones';
import type { CategoriaSlug } from '@/lib/categorias';
import type { FotoGaleria } from '@/lib/admin-db';

type ProductoParaAdmin = {
  id: number;
  nombre: string;
  precioVenta: number;
  categoria: CategoriaSlug;
  subcategoria: SubcategoriaSlug;
  disponible: boolean;
  pocasUnidades: boolean;
  personalizable: boolean;
  fotoUrl: string | null;
  descripcion: string;
  destacado: boolean;
  fotosGaleria: FotoGaleria[];
};

// Mismo agrupamiento en dos niveles que ya usa la tienda pública
// (Sección -> Subcategoría, ver CatalogoPorSeccion) — así el panel
// deja de ser una sola lista de 23+ productos con muchísimo scroll:
// solo se ve una subcategoría a la vez, igual que le aparece al
// cliente en /catalogo.
//
// Al buscar por nombre la agrupación se ignora a propósito y se
// muestra el resultado sobre TODOS los productos sin importar en qué
// sección/subcategoría estén — si no, habría que adivinar primero
// dónde buscar.
export default function ListaProductosAdmin({
  productos,
}: {
  productos: ProductoParaAdmin[];
}) {
  const [busqueda, setBusqueda] = useState('');
  const [seccionActiva, setSeccionActiva] = useState(SECCIONES[0]);
  const [subcategoriaActiva, setSubcategoriaActiva] = useState(
    SECCIONES[0].subcategorias[0].slug
  );

  function elegirSeccion(seccion: (typeof SECCIONES)[number]) {
    setSeccionActiva(seccion);
    setSubcategoriaActiva(seccion.subcategorias[0].slug);
  }

  const buscando = busqueda.trim().length > 0;

  const filtrados = useMemo(() => {
    if (buscando) {
      const termino = busqueda.trim().toLowerCase();
      return productos.filter((p) => p.nombre.toLowerCase().includes(termino));
    }
    return productos.filter((p) => p.subcategoria === subcategoriaActiva);
  }, [productos, buscando, busqueda, subcategoriaActiva]);

  return (
    <div>
      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar producto por nombre..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
      />

      {/* La navegación por sección/subcategoría solo tiene sentido
          cuando no se está buscando — buscar ya cruza todos los
          grupos. */}
      {!buscando && (
        <div className="mt-4">
          <nav
            aria-label="Secciones"
            className="flex gap-6 border-b border-border"
          >
            {SECCIONES.map((seccion) => (
              <button
                key={seccion.slug}
                type="button"
                onClick={() => elegirSeccion(seccion)}
                aria-pressed={seccionActiva.slug === seccion.slug}
                className={`-mb-px border-b-2 pb-2 text-sm transition-colors ${
                  seccionActiva.slug === seccion.slug
                    ? 'border-ember text-foreground'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                {seccion.nombre}
              </button>
            ))}
          </nav>

          <div className="mt-3 flex flex-wrap gap-2">
            {seccionActiva.subcategorias.map((sub) => (
              <Chip
                key={sub.slug}
                size="sm"
                activo={subcategoriaActiva === sub.slug}
                onClick={() => setSubcategoriaActiva(sub.slug)}
              >
                {sub.nombre}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {filtrados.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          {buscando
            ? `No hay productos que coincidan con "${busqueda}".`
            : 'Todavía no hay productos en esta subcategoría.'}
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
              fotosGaleria={producto.fotosGaleria}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
