'use client';

import { useActionState } from 'react';
import { guardarEnvio } from '@/app/admin/actions';
import type { ConfigEnvio } from '@/lib/admin-db';

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

// Envío a domicilio a nivel nacional, tarifa única (decisión del
// dueño, 2026-09-14) — no hay tarifas por ciudad/zona todavía. Se
// muestra en el carrito sumado al total, y gratis si el pedido llega
// al monto configurado aquí.
export default function ConfigEnvioForm({
  configActual,
}: {
  configActual: ConfigEnvio;
}) {
  const [estado, accion] = useActionState(guardarEnvio, undefined);

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
      <div className="min-w-[100px] flex-1">
        <p className="text-sm font-medium text-foreground">
          Costo de envío
        </p>
        <p className="text-xs text-muted">
          Domicilio a nivel nacional, tarifa única — se suma al total
          en el carrito.
        </p>
      </div>

      <form action={accion} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Valor del envío</span>
          <input
            type="number"
            name="costo"
            min={0}
            step={500}
            defaultValue={configActual.costo}
            required
            className="w-32 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Envío gratis desde</span>
          <input
            type="number"
            name="gratisDesde"
            min={0}
            step={500}
            defaultValue={configActual.gratisDesde}
            required
            className="w-32 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60"
        >
          Guardar
        </button>
      </form>

      <p className="text-xs text-muted">
        Hoy: envío de {formatoCOP.format(configActual.costo)}, gratis en
        compras desde {formatoCOP.format(configActual.gratisDesde)}.
      </p>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && <p className="text-xs text-ember">¡Guardado!</p>}
    </div>
  );
}
