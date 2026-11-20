'use client';

import { useActionState, useEffect, useRef } from 'react';
import {
  agregarCupon,
  cambiarActivoCupon,
  borrarCupon,
} from '@/app/admin/cupones/actions';
import {
  CUPON_PORCENTAJE_MAXIMO,
  CUPON_PORCENTAJE_MINIMO,
  ETIQUETA_ESTADO_CUPON,
  LONGITUD_MAXIMA_CODIGO,
  TOPE_POR_DEFECTO,
  type Cupon,
} from '@/lib/cupones';

const CLASE_CAMPO =
  'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60';

const ESTILO_ESTADO: Record<Cupon['estado'], string> = {
  vigente: 'border-ember/40 bg-ember/10 text-ember',
  programado: 'border-gold/40 bg-gold/10 text-gold',
  vencido: 'border-border bg-surface-hover text-muted',
  desactivado: 'border-border bg-surface-hover text-muted',
};

// "2026-11-27" -> "27 nov 2026", sin pasar por Date (que lo leería como
// UTC y en Colombia mostraría el día anterior).
function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${dia} ${meses[mes - 1]} ${anio}`;
}

function textoVigencia(c: Cupon): string {
  if (c.inicio && c.fin) return `${formatearFecha(c.inicio)} → ${formatearFecha(c.fin)}`;
  if (c.inicio) return `Desde el ${formatearFecha(c.inicio)}`;
  if (c.fin) return `Hasta el ${formatearFecha(c.fin)}`;
  return 'Sin fechas: siempre vigente mientras esté activo';
}

function FormularioCupon() {
  const [estado, accion, pendiente] = useActionState(agregarCupon, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Tras crear el cupón, el formulario se limpia.
  useEffect(() => {
    if (estado?.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <form
      ref={formRef}
      action={accion}
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4"
    >
      <h2 className="font-medium text-foreground">Nuevo cupón</h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Código</span>
          <input
            name="codigo"
            required
            maxLength={LONGITUD_MAXIMA_CODIGO}
            placeholder="FUEGO"
            autoComplete="off"
            className={`${CLASE_CAMPO} w-40 uppercase`}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Descuento del cupón (%)</span>
          <input
            name="porcentaje"
            type="number"
            required
            min={CUPON_PORCENTAJE_MINIMO}
            max={CUPON_PORCENTAJE_MAXIMO}
            defaultValue={10}
            className={`${CLASE_CAMPO} w-28`}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Tope total (%)</span>
          <input
            name="tope"
            type="number"
            required
            min={CUPON_PORCENTAJE_MINIMO}
            max={CUPON_PORCENTAJE_MAXIMO}
            defaultValue={TOPE_POR_DEFECTO}
            className={`${CLASE_CAMPO} w-28`}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Desde (opcional)</span>
          <input name="inicio" type="date" className={CLASE_CAMPO} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Hasta (opcional)</span>
          <input name="fin" type="date" className={CLASE_CAMPO} />
        </label>
      </div>
      <p className="text-xs text-muted">
        El tope es el descuento TOTAL máximo de un producto (el suyo + el del
        cupón). La fecha &laquo;hasta&raquo; es inclusiva: el cupón sirve todo
        ese día.
      </p>
      {estado?.error && (
        <p role="alert" className="text-sm text-danger">
          {estado.error}
        </p>
      )}
      {estado?.ok && <p className="text-sm text-ember">Cupón creado.</p>}
      <button
        type="submit"
        disabled={pendiente}
        className="w-fit rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover disabled:opacity-60"
      >
        {pendiente ? 'Creando...' : 'Crear cupón'}
      </button>
    </form>
  );
}

function FilaCupon({ cupon }: { cupon: Cupon }) {
  const [estadoActivo, accionActivo] = useActionState(cambiarActivoCupon, undefined);
  const [estadoBorrar, accionBorrar] = useActionState(borrarCupon, undefined);
  const error = estadoActivo?.error ?? estadoBorrar?.error;

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-lg font-semibold tracking-wide text-foreground">
            {cupon.codigo}
          </p>
          <p className="text-sm text-muted">
            +{cupon.porcentaje}% sobre el descuento del producto, hasta{' '}
            {cupon.topeTotal}% en total
          </p>
          <p className="text-xs text-muted">{textoVigencia(cupon)}</p>
          <p className="text-xs text-muted">
            Usado en {cupon.usos} pedido{cupon.usos === 1 ? '' : 's'}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${ESTILO_ESTADO[cupon.estado]}`}
        >
          {ETIQUETA_ESTADO_CUPON[cupon.estado]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3">
        <form action={accionActivo}>
          <input type="hidden" name="cuponId" value={cupon.id} />
          <input type="hidden" name="activo" value={String(!cupon.activo)} />
          <button
            type="submit"
            className="text-sm font-medium text-ember transition-colors hover:text-ember-hover"
          >
            {cupon.activo ? 'Desactivar' : 'Activar'}
          </button>
        </form>
        <form
          action={accionBorrar}
          onSubmit={(e) => {
            if (!window.confirm(`¿Borrar el cupón ${cupon.codigo}? Los pedidos que ya lo usaron no cambian.`)) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="cuponId" value={cupon.id} />
          <button
            type="submit"
            className="text-sm text-muted transition-colors hover:text-danger"
          >
            Borrar
          </button>
        </form>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </li>
  );
}

export default function ListaCupones({ cupones }: { cupones: Cupon[] }) {
  return (
    <div className="flex flex-col gap-6">
      <FormularioCupon />
      {cupones.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay cupones creados.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {cupones.map((c) => (
            <FilaCupon key={c.id} cupon={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
