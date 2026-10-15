'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  agregarPromocion,
  actualizarActiva,
  borrarPromocion,
} from '@/app/admin/promociones/actions';
import {
  ETIQUETA_ESTADO,
  LONGITUD_MAXIMA_TEXTO,
  LONGITUD_MAXIMA_TITULO,
  type EstadoPromocion,
  type Promocion,
} from '@/lib/promociones';

const CLASES_ESTADO: Record<EstadoPromocion, string> = {
  vigente: 'bg-ember/15 text-ember',
  programada: 'bg-gold/15 text-gold',
  vencida: 'bg-surface-hover text-muted',
  desactivada: 'bg-surface-hover text-muted',
};

const CLASE_CAMPO =
  'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60';

// "2026-11-27" -> "27 nov 2026", sin pasar por Date (que lo leería
// como UTC y podría mostrar el día anterior según la zona horaria).
function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${dia} ${meses[mes - 1]} ${anio}`;
}

function describirFechas(p: Promocion): string {
  if (p.inicio && p.fin) return `Del ${formatearFecha(p.inicio)} al ${formatearFecha(p.fin)}`;
  if (p.inicio) return `Desde el ${formatearFecha(p.inicio)}, sin fecha de fin`;
  if (p.fin) return `Hasta el ${formatearFecha(p.fin)}`;
  return 'Sin fechas (se muestra mientras esté activa)';
}

function FormularioNuevaPromocion() {
  const [estado, accion, guardando] = useActionState(agregarPromocion, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <form
      ref={formRef}
      action={accion}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <input
        type="text"
        name="titulo"
        required
        maxLength={LONGITUD_MAXIMA_TITULO}
        placeholder="Título (ej. Black Friday: 20% en toda la tienda)"
        className={CLASE_CAMPO}
      />
      <textarea
        name="texto"
        rows={2}
        maxLength={LONGITUD_MAXIMA_TEXTO}
        placeholder="Texto corto (opcional, ej. Solo este fin de semana)"
        className={CLASE_CAMPO}
      />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-foreground">Imagen del banner (opcional)</span>
        <input
          type="file"
          name="imagen"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-ember file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-ember"
        />
        <span className="text-xs text-muted">
          Mejor si es ancha (ej. 1200 × 400). Sin imagen, el banner usa el
          color de la marca.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-foreground">Enlace (opcional)</span>
        <input
          type="text"
          name="enlace"
          placeholder="/catalogo"
          className={CLASE_CAMPO}
        />
        <span className="text-xs text-muted">
          A dónde lleva al hacer clic. Una ruta de la tienda (ej. /catalogo)
          o una dirección que empiece por https://
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Empieza (opcional)</span>
          <input type="date" name="inicio" className={CLASE_CAMPO} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Termina (opcional)</span>
          <input type="date" name="fin" className={CLASE_CAMPO} />
        </label>
      </div>

      <fieldset className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground">
        <legend className="mb-1 font-medium">Dónde se muestra</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enFranja"
            defaultChecked
            className="h-4 w-4 rounded border-border accent-ember"
          />
          Franja superior (en todas las páginas)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enPortada"
            defaultChecked
            className="h-4 w-4 rounded border-border accent-ember"
          />
          Banner en la portada
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={guardando}
        className="w-fit rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover disabled:opacity-60"
      >
        {guardando ? 'Guardando...' : 'Crear promoción'}
      </button>
      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
    </form>
  );
}

function FilaPromocion({ promocion }: { promocion: Promocion }) {
  const [estado, accionActiva] = useActionState(actualizarActiva, undefined);
  // Borrar es irreversible — se confirma con un segundo paso propio,
  // igual que en las reseñas (ver ListaResenas.tsx).
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false);

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          {promocion.imagenUrl && (
            <Image
              src={promocion.imagenUrl}
              alt=""
              width={96}
              height={64}
              className="h-16 w-24 shrink-0 rounded-lg border border-border object-cover"
            />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{promocion.titulo}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${CLASES_ESTADO[promocion.estado]}`}
              >
                {ETIQUETA_ESTADO[promocion.estado]}
              </span>
            </div>
            {promocion.texto && (
              <p className="mt-0.5 text-sm text-muted">{promocion.texto}</p>
            )}
            <p className="mt-1 text-xs text-muted">{describirFechas(promocion)}</p>
            <p className="mt-0.5 text-xs text-muted">
              {[
                promocion.enFranja && 'Franja superior',
                promocion.enPortada && 'Portada',
              ]
                .filter(Boolean)
                .join(' · ')}
              {promocion.enlace && ` · Enlace: ${promocion.enlace}`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <form action={accionActiva} className="contents">
            <input type="hidden" name="promocionId" value={promocion.id} />
            <label className="flex items-center gap-1.5 text-xs whitespace-nowrap text-foreground">
              <input
                type="checkbox"
                name="activa"
                defaultChecked={promocion.activa}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                className="h-4 w-4 rounded border-border accent-ember"
              />
              Activa
            </label>
          </form>
          {confirmandoBorrar ? (
            <div className="flex items-center gap-2 text-xs whitespace-nowrap">
              <span className="text-danger">¿Borrar?</span>
              <form action={borrarPromocion}>
                <input type="hidden" name="promocionId" value={promocion.id} />
                <button type="submit" className="font-semibold text-danger hover:underline">
                  Sí, borrar
                </button>
              </form>
              <button
                type="button"
                onClick={() => setConfirmandoBorrar(false)}
                className="text-muted hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmandoBorrar(true)}
              className="text-xs text-muted transition-colors hover:text-danger"
            >
              Borrar
            </button>
          )}
        </div>
      </div>
      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
    </li>
  );
}

export default function ListaPromociones({
  promociones,
}: {
  promociones: Promocion[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <FormularioNuevaPromocion />

      {promociones.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay promociones creadas.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {promociones.map((promocion) => (
            <FilaPromocion key={promocion.id} promocion={promocion} />
          ))}
        </ul>
      )}
    </div>
  );
}
