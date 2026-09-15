'use client';

import { useActionState } from 'react';
import { guardarCompra } from '@/app/admin/actions';
import type { ConfigCompra } from '@/lib/admin-db';

// Antes el carrito no decía nada sobre cómo se paga ni cuánto tarda
// la entrega — el cliente lo averiguaba recién por WhatsApp, después
// de llenar todo el formulario (fricción justo antes de pedir). Texto
// libre editable acá para que el dueño lo ajuste sin pedir un
// redeploy (ej. en temporada alta cambian los tiempos de entrega).
export default function ConfigCompraForm({
  configActual,
}: {
  configActual: ConfigCompra;
}) {
  const [estado, accion] = useActionState(guardarCompra, undefined);

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
      <div className="min-w-[100px] flex-1">
        <p className="text-sm font-medium text-foreground">
          Pago y tiempo de entrega
        </p>
        <p className="text-xs text-muted">
          Se muestra en el carrito antes de que el cliente llene sus
          datos, para que sepa cómo paga y cuánto tarda antes de
          escribir por WhatsApp.
        </p>
      </div>

      <form action={accion} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Formas de pago</span>
          <input
            type="text"
            name="formasPago"
            defaultValue={configActual.formasPago}
            required
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Tiempo de entrega</span>
          <input
            type="text"
            name="tiempoEntrega"
            defaultValue={configActual.tiempoEntrega}
            required
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <button
          type="submit"
          className="w-fit shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60"
        >
          Guardar
        </button>
      </form>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && <p className="text-xs text-ember">¡Guardado!</p>}
    </div>
  );
}
