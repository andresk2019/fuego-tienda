'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import {
  subirFotoProducto,
  guardarDescripcion,
  guardarDestacado,
} from '@/app/admin/actions';
import type { CategoriaSlug } from '@/lib/categorias';
import TarjetaProducto from '@/components/TarjetaProducto';
import FichaProducto from '@/components/FichaProducto';

export default function SubirFotoForm({
  productoId,
  nombre,
  precioVenta,
  categoria,
  disponible,
  pocasUnidades,
  personalizable,
  fotoUrl,
  descripcion,
  destacado,
}: {
  productoId: number;
  nombre: string;
  precioVenta: number;
  categoria: CategoriaSlug;
  disponible: boolean;
  pocasUnidades: boolean;
  personalizable: boolean;
  fotoUrl: string | null;
  descripcion: string;
  destacado: boolean;
}) {
  const [estadoFoto, accionFoto, subiendoFoto] = useActionState(
    subirFotoProducto,
    undefined
  );
  const [estadoDescripcion, accionDescripcion, guardandoDescripcion] =
    useActionState(guardarDescripcion, undefined);
  const [estadoDestacado, accionDestacado] = useActionState(
    guardarDestacado,
    undefined
  );

  // Vista previa del archivo elegido, ANTES de subirlo de verdad — así
  // se puede ver cómo quedaría la tarjeta del catálogo sin que el
  // cambio ya esté en producción. Se genera localmente en el
  // navegador (URL.createObjectURL), no toca el servidor todavía.
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  function manejarSeleccionArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    setVistaPrevia((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return archivo ? URL.createObjectURL(archivo) : null;
    });
  }

  useEffect(() => {
    if (estadoFoto?.ok) {
      setVistaPrevia((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return null;
      });
      if (inputArchivoRef.current) inputArchivoRef.current.value = '';
    }
  }, [estadoFoto]);

  // Igual que la foto: se compara en vivo lo que hay escrito en el
  // textarea contra la descripción ya guardada, usando la misma
  // ficha que se ve en la página real del producto.
  const [descripcionEnVivo, setDescripcionEnVivo] = useState(descripcion);
  const hayCambioDescripcion = descripcionEnVivo !== descripcion;

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <span className="text-sm font-semibold text-foreground">{nombre}</span>

      {/* Espejo de la tarjeta del catálogo */}
      <div
        className={`grid grid-cols-1 gap-4 ${vistaPrevia ? 'sm:grid-cols-2' : 'sm:max-w-[200px]'}`}
      >
        <div>
          <p className="mb-2 text-[10px] font-medium tracking-wide text-muted uppercase">
            Ahora en producción
          </p>
          <TarjetaProducto
            nombre={nombre}
            precioVenta={precioVenta}
            fotoUrl={fotoUrl}
            disponible={disponible}
            pocasUnidades={pocasUnidades}
            personalizable={personalizable}
          />
        </div>
        {vistaPrevia && (
          <div>
            <p className="mb-2 text-[10px] font-medium tracking-wide text-ember uppercase">
              Con el cambio (sin guardar)
            </p>
            <TarjetaProducto
              nombre={nombre}
              precioVenta={precioVenta}
              fotoUrl={vistaPrevia}
              disponible={disponible}
              pocasUnidades={pocasUnidades}
              personalizable={personalizable}
            />
          </div>
        )}
      </div>

      <form
        action={accionFoto}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
      >
        <input type="hidden" name="productoId" value={productoId} />
        <input
          ref={inputArchivoRef}
          type="file"
          name="foto"
          accept="image/*"
          required
          onChange={manejarSeleccionArchivo}
          className="text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-ember file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-ember"
        />
        <button
          type="submit"
          disabled={subiendoFoto || !vistaPrevia}
          className="w-fit rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
        >
          {subiendoFoto ? 'Subiendo...' : 'Confirmar y subir'}
        </button>
      </form>
      {estadoFoto?.error && <p className="text-xs text-danger">{estadoFoto.error}</p>}
      {estadoFoto?.ok && <p className="text-xs text-ember">¡Foto actualizada!</p>}

      {/* Espejo de la ficha de detalle, para la descripción */}
      <div className="border-t border-border pt-4">
        <div
          className={`grid grid-cols-1 gap-4 ${hayCambioDescripcion ? 'sm:grid-cols-2' : ''}`}
        >
          <div>
            <p className="mb-2 text-[10px] font-medium tracking-wide text-muted uppercase">
              Ahora en producción
            </p>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <FichaProducto
                categoria={categoria}
                nombre={nombre}
                precioVenta={precioVenta}
                disponible={disponible}
                pocasUnidades={pocasUnidades}
                descripcion={descripcion}
              />
            </div>
          </div>
          {hayCambioDescripcion && (
            <div>
              <p className="mb-2 text-[10px] font-medium tracking-wide text-ember uppercase">
                Con el cambio (sin guardar)
              </p>
              <div className="rounded-xl border border-ember/40 bg-background/40 p-4">
                <FichaProducto
                  categoria={categoria}
                  nombre={nombre}
                  precioVenta={precioVenta}
                  disponible={disponible}
                  pocasUnidades={pocasUnidades}
                  descripcion={descripcionEnVivo}
                />
              </div>
            </div>
          )}
        </div>

        <form action={accionDescripcion} className="mt-3 flex flex-col gap-2">
          <input type="hidden" name="productoId" value={productoId} />
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-foreground">
              Descripción
            </span>
            <textarea
              name="descripcion"
              value={descripcionEnVivo}
              onChange={(e) => setDescripcionEnVivo(e.target.value)}
              rows={3}
              placeholder="Descripción para mostrar en la página del producto..."
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
            />
          </label>
          <button
            type="submit"
            disabled={guardandoDescripcion || !hayCambioDescripcion}
            className="w-fit rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
          >
            {guardandoDescripcion ? 'Guardando...' : 'Guardar descripción'}
          </button>
          {estadoDescripcion?.error && (
            <p className="text-xs text-danger">{estadoDescripcion.error}</p>
          )}
          {estadoDescripcion?.ok && (
            <p className="text-xs text-ember">¡Descripción guardada!</p>
          )}
        </form>
      </div>

      <form
        action={accionDestacado}
        className="flex items-center gap-2 border-t border-border pt-3"
      >
        <input type="hidden" name="productoId" value={productoId} />
        <input
          type="checkbox"
          id={`destacado-${productoId}`}
          name="destacado"
          defaultChecked={destacado}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="h-4 w-4 rounded border-border accent-ember"
        />
        <label
          htmlFor={`destacado-${productoId}`}
          className="text-xs font-medium text-foreground"
        >
          Destacar (carrusel de &ldquo;Las más vendidas&rdquo; en la portada)
        </label>
        {estadoDestacado?.error && (
          <p className="text-xs text-danger">{estadoDestacado.error}</p>
        )}
      </form>
    </li>
  );
}
