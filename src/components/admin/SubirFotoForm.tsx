'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  subirFotoProducto,
  guardarDescripcion,
  guardarDestacado,
} from '@/app/admin/actions';
import FlameIcon from '@/components/FlameIcon';

export default function SubirFotoForm({
  productoId,
  nombre,
  fotoUrl,
  descripcion,
  destacado,
}: {
  productoId: number;
  nombre: string;
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
  // se puede ver cómo quedaría la imagen sin que el cambio ya esté en
  // producción. Se genera localmente en el navegador (URL.createObjectURL),
  // no toca el servidor ni el storage todavía.
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  function manejarSeleccionArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    setVistaPrevia((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return archivo ? URL.createObjectURL(archivo) : null;
    });
  }

  // Al terminar de subir con éxito, la vista previa deja de hacer
  // falta (la foto "actual" de arriba ya es la nueva).
  useEffect(() => {
    if (estadoFoto?.ok) {
      setVistaPrevia((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return null;
      });
      if (inputArchivoRef.current) inputArchivoRef.current.value = '';
    }
  }, [estadoFoto]);

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
              {fotoUrl ? (
                <Image
                  src={fotoUrl}
                  alt={nombre}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FlameIcon className="h-6 w-6 text-ember/30" />
              )}
            </div>
            <span className="text-[10px] text-muted">Actual</span>
          </div>

          {vistaPrevia && (
            <div className="flex flex-col items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vistaPrevia}
                alt={`Vista previa de ${nombre}`}
                className="h-16 w-16 shrink-0 rounded-lg border-2 border-ember object-cover"
              />
              <span className="text-[10px] font-medium text-ember">
                Nueva (sin guardar)
              </span>
            </div>
          )}
        </div>

        <form
          action={accionFoto}
          className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
        >
          <input type="hidden" name="productoId" value={productoId} />
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            {nombre}
          </span>
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
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
          >
            {subiendoFoto ? 'Subiendo...' : 'Confirmar y subir'}
          </button>
        </form>
      </div>
      {estadoFoto?.error && <p className="text-xs text-danger">{estadoFoto.error}</p>}
      {estadoFoto?.ok && <p className="text-xs text-ember">¡Foto actualizada!</p>}

      <form action={accionDescripcion} className="flex flex-col gap-2">
        <input type="hidden" name="productoId" value={productoId} />
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-foreground">
            Descripción
          </span>
          <textarea
            name="descripcion"
            defaultValue={descripcion}
            rows={3}
            placeholder="Descripción para mostrar en la página del producto..."
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
          />
        </label>
        <button
          type="submit"
          disabled={guardandoDescripcion}
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

      <form action={accionDestacado} className="flex items-center gap-2 border-t border-border pt-3">
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
