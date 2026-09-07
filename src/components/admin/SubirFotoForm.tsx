'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { subirFotoProducto } from '@/app/admin/actions';
import FlameIcon from '@/components/FlameIcon';

export default function SubirFotoForm({
  productoId,
  nombre,
  fotoUrl,
}: {
  productoId: number;
  nombre: string;
  fotoUrl: string | null;
}) {
  const [estado, accion, pendiente] = useActionState(subirFotoProducto, undefined);

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
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
        action={accion}
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
          disabled={pendiente}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
        >
          {pendiente ? 'Subiendo...' : 'Subir'}
        </button>
      </form>

      {estado?.error && (
        <p className="text-xs text-danger sm:basis-full">{estado.error}</p>
      )}
      {estado?.ok && (
        <p className="text-xs text-ember sm:basis-full">¡Foto actualizada!</p>
      )}
    </li>
  );
}
