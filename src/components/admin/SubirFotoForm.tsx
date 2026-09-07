'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { subirFotoProducto, guardarDescripcion } from '@/app/admin/actions';
import FlameIcon from '@/components/FlameIcon';

export default function SubirFotoForm({
  productoId,
  nombre,
  fotoUrl,
  descripcion,
}: {
  productoId: number;
  nombre: string;
  fotoUrl: string | null;
  descripcion: string;
}) {
  const [estadoFoto, accionFoto, subiendoFoto] = useActionState(
    subirFotoProducto,
    undefined
  );
  const [estadoDescripcion, accionDescripcion, guardandoDescripcion] =
    useActionState(guardarDescripcion, undefined);

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

        <form
          action={accionFoto}
          className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
        >
          <input type="hidden" name="productoId" value={productoId} />
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            {nombre}
          </span>
          <input
            type="file"
            name="foto"
            accept="image/*"
            required
            className="text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-ember file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-ember"
          />
          <button
            type="submit"
            disabled={subiendoFoto}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
          >
            {subiendoFoto ? 'Subiendo...' : 'Subir'}
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
    </li>
  );
}
