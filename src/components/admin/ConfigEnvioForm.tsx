'use client';

import { useActionState } from 'react';
import { guardarEnvio } from '@/app/admin/actions';
import type { ConfigEnvio } from '@/lib/admin-db';

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

// Envío a domicilio con 2 tarifas — dentro de Medellín y al resto del
// país (decisión del dueño, 2026-09-14). Se muestran en el carrito
// como 2 opciones para que el cliente elija, y gratis si el pedido
// llega al monto configurado aquí (en cualquiera de las 2 zonas).
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
          Domicilio con tarifa distinta dentro de Medellín y al resto
          del país — se suma al total en el carrito.
        </p>
      </div>

      <form action={accion} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Dentro de Medellín</span>
          <input
            type="number"
            name="costoLocal"
            min={0}
            step={500}
            defaultValue={configActual.costoLocal}
            required
            className="w-32 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Resto del país</span>
          <input
            type="number"
            name="costoNacional"
            min={0}
            step={500}
            defaultValue={configActual.costoNacional}
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
        Hoy: {formatoCOP.format(configActual.costoLocal)} dentro de
        Medellín, {formatoCOP.format(configActual.costoNacional)} al
        resto del país, gratis en compras desde{' '}
        {formatoCOP.format(configActual.gratisDesde)}.
      </p>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && <p className="text-xs text-ember">¡Guardado!</p>}
    </div>
  );
}
