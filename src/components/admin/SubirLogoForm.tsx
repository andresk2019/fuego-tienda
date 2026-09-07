'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { subirLogo } from '@/app/admin/actions';
import FlameIcon from '@/components/FlameIcon';

export default function SubirLogoForm({ logoUrl }: { logoUrl: string | null }) {
  const [estado, accion, subiendo] = useActionState(subirLogo, undefined);

  return (
    <div className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-foreground">
        Logo de la tienda
      </h2>
      <p className="text-xs text-muted">
        Aparece en la portada, en el mensaje de "Bienvenido a Fuego".
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo de Fuego"
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
          <input
            type="file"
            name="logo"
            accept="image/*"
            required
            className="text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-ember file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-ember"
          />
          <button
            type="submit"
            disabled={subiendo}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
          >
            {subiendo ? 'Subiendo...' : 'Subir logo'}
          </button>
        </form>
      </div>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && <p className="text-xs text-ember">¡Logo actualizado!</p>}
    </div>
  );
}
