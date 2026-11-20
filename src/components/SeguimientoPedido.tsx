"use client";

import { useActionState } from "react";
import {
  consultarPedido,
  type EstadoSeguimiento,
} from "@/app/(tienda)/seguimiento/actions";
import { PASOS_SEGUIMIENTO } from "@/lib/pedidos";
import type { PedidoSeguimiento } from "@/lib/pedidos-db";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

const formatoFechaCorta = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

function Recorrido({ pedido }: { pedido: PedidoSeguimiento }) {
  if (pedido.estado === "cancelado") {
    return (
      <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
        Este pedido fue cancelado. Si tienes dudas, escríbenos por WhatsApp.
      </p>
    );
  }

  const actual = PASOS_SEGUIMIENTO.findIndex((p) => p.valor === pedido.estado);

  return (
    <ol className="flex flex-col">
      {PASOS_SEGUIMIENTO.map((paso, i) => {
        const hecho = i < actual;
        const esActual = i === actual;
        const fecha = pedido.historial[paso.valor];
        return (
          <li
            key={paso.valor}
            aria-current={esActual ? "step" : undefined}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {i < PASOS_SEGUIMIENTO.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 ${
                  hecho ? "bg-ember" : "bg-border"
                }`}
              />
            )}
            <span
              aria-hidden="true"
              className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                hecho
                  ? "border-ember bg-ember text-on-ember"
                  : esActual
                    ? "border-ember bg-background text-ember ring-4 ring-ember/20"
                    : "border-border bg-background text-muted"
              }`}
            >
              {hecho ? "✓" : i + 1}
            </span>
            <div className="pt-0.5">
              <p
                className={`text-sm font-semibold ${
                  hecho || esActual ? "text-foreground" : "text-muted"
                }`}
              >
                {paso.etiqueta}
                <span className="sr-only">
                  {hecho ? " (completado)" : esActual ? " (paso actual)" : ""}
                </span>
              </p>
              {fecha && (hecho || esActual) && (
                <p className="text-xs text-muted">
                  {formatoFechaCorta.format(new Date(fecha))}
                </p>
              )}
              {esActual && (
                <p className="text-sm text-muted">{paso.descripcion}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Resultado({ pedido }: { pedido: PedidoSeguimiento }) {
  return (
    <section
      aria-live="polite"
      className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5"
    >
      <div>
        <p className="text-xs text-muted">Pedido</p>
        <p className="font-serif text-2xl text-foreground">{pedido.numero}</p>
        <p className="text-sm text-muted">
          {pedido.primerNombre && `Hola, ${pedido.primerNombre}. `}
          Hecho el {formatoFecha.format(new Date(pedido.creadoEn))}
          {pedido.municipio && ` · Envío a ${pedido.municipio}`}
        </p>
      </div>

      <Recorrido pedido={pedido} />

      <p className="text-xs text-muted">
        Última actualización: {formatoFecha.format(new Date(pedido.actualizadoEn))}
      </p>

      <div className="border-t border-border pt-4">
        <p className="mb-2 text-xs font-medium text-foreground">Tu pedido</p>
        <ul className="flex flex-col gap-1 text-sm text-muted">
          {pedido.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>
                {item.cantidad} × {item.nombre}
                {item.aroma && ` · ${item.aroma}`}
                {item.color && ` · ${item.color}`}
              </span>
              <span className="shrink-0">
                {formatoCOP.format(item.precioUnitario * item.cantidad)}
              </span>
            </li>
          ))}
          {pedido.costoEnvio !== null && (
            <li className="flex justify-between gap-3">
              <span>Envío</span>
              <span>
                {pedido.costoEnvio === 0
                  ? "Gratis"
                  : formatoCOP.format(pedido.costoEnvio)}
              </span>
            </li>
          )}
        </ul>
        <p className="mt-2 flex justify-between text-sm font-semibold text-foreground">
          <span>Total</span>
          <span>{formatoCOP.format(pedido.total)}</span>
        </p>
      </div>
    </section>
  );
}

export default function SeguimientoPedido({
  numeroInicial,
}: {
  numeroInicial: string;
}) {
  const [estado, accion, pendiente] = useActionState<EstadoSeguimiento, FormData>(
    consultarPedido,
    undefined
  );

  return (
    <div className="flex flex-col gap-6">
      <form action={accion} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-foreground">
            Número de pedido
          </span>
          <input
            name="numero"
            required
            maxLength={40}
            defaultValue={estado?.numero ?? numeroInicial}
            placeholder="Ej. FUEGO-000032"
            autoComplete="off"
            className="rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted/60 sm:text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-foreground">
            Tu número de WhatsApp
          </span>
          <input
            name="telefono"
            type="tel"
            required
            maxLength={40}
            defaultValue={estado?.telefono ?? ""}
            placeholder="El que usaste al pedir, ej. 3001234567"
            autoComplete="tel"
            inputMode="tel"
            className="rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted/60 sm:text-sm"
          />
        </label>
        {estado?.error && (
          <p role="alert" className="text-sm text-danger">
            {estado.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-ember px-4 py-3 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover disabled:opacity-60"
        >
          {pendiente ? "Buscando..." : "Ver cómo va mi pedido"}
        </button>
      </form>

      {estado?.pedido && <Resultado pedido={estado.pedido} />}
    </div>
  );
}
