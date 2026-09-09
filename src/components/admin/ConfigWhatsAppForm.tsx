'use client';

import { useActionState } from 'react';
import { guardarWhatsApp } from '@/app/admin/actions';

export default function ConfigWhatsAppForm({
  numeroActual,
}: {
  numeroActual: string | null;
}) {
  const [estado, accion] = useActionState(guardarWhatsApp, undefined);

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[100px] flex-1">
          <p className="text-sm font-medium text-foreground">
            Número de WhatsApp
          </p>
          <p className="text-xs text-muted">
            A dónde llegan los pedidos del carrito de la tienda.
          </p>
        </div>

        <form action={accion} className="flex items-center gap-2">
          <input
            type="tel"
            name="numero"
            defaultValue={numeroActual ?? ''}
            placeholder="Ej. 573001234567"
            required
            className="w-40 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted/60"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-ember/60"
          >
            Guardar
          </button>
        </form>
      </div>

      <p className="text-xs text-muted">
        Con el código de país, solo números (Colombia: 57 + el celular).
      </p>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && (
        <p className="text-xs text-ember">¡Número actualizado!</p>
      )}
    </div>
  );
}
