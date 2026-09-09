'use client';

import { useActionState } from 'react';
import { guardarQuienesSomos } from '@/app/admin/quienes-somos/actions';
import type { ContenidoQuienesSomos } from '@/lib/admin-db';

export default function FormularioQuienesSomos({
  contenidoInicial,
}: {
  contenidoInicial: ContenidoQuienesSomos;
}) {
  const [estado, accion] = useActionState(guardarQuienesSomos, undefined);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">
          Nuestra historia
        </span>
        <textarea
          name="historia"
          defaultValue={contenidoInicial.historia}
          rows={4}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">
          Nuestra misión
        </span>
        <textarea
          name="mision"
          defaultValue={contenidoInicial.mision}
          rows={4}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">Contacto</span>
        <textarea
          name="contacto"
          defaultValue={contenidoInicial.contacto}
          rows={4}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
        />
      </label>

      <button
        type="submit"
        className="w-fit rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-ember/60"
      >
        Guardar
      </button>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && <p className="text-xs text-ember">¡Guardado!</p>}
    </form>
  );
}
