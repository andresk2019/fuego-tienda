'use client';

import { useActionState, useState } from 'react';
import {
  agregarResena,
  actualizarVisibilidad,
  borrarResena,
} from '@/app/admin/resenas/actions';
import { CALIFICACION_MAXIMA, type Resena } from '@/lib/resenas';
import EstrellaIcon from '@/components/EstrellaIcon';

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
});

// Selector de calificación con estrellas clickeables — más rápido que
// escribir un número, y de una vez muestra cómo se va a ver en la
// portada.
function SelectorCalificacion({
  valor,
  onCambiar,
}: {
  valor: number;
  onCambiar: (valor: number) => void;
}) {
  return (
    <div className="flex gap-1 text-ember">
      {Array.from({ length: CALIFICACION_MAXIMA }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onCambiar(i + 1)}
          aria-label={`${i + 1} estrellas`}
          className="cursor-pointer"
        >
          <EstrellaIcon llena={i < valor} className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}

function FormularioNuevaResena() {
  const [estado, accion] = useActionState(agregarResena, undefined);
  const [calificacion, setCalificacion] = useState(5);

  return (
    <form
      action={accion}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <input type="hidden" name="calificacion" value={calificacion} />
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="clienteNombre"
          required
          placeholder="Nombre del cliente"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
        />
        <SelectorCalificacion valor={calificacion} onCambiar={setCalificacion} />
      </div>
      <textarea
        name="texto"
        required
        rows={2}
        placeholder="¿Qué dijo el cliente?"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
      />
      <button
        type="submit"
        className="w-fit rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
      >
        Agregar reseña
      </button>
      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
    </form>
  );
}

function FilaResena({ resena }: { resena: Resena }) {
  const [estado, accionVisibilidad] = useActionState(
    actualizarVisibilidad,
    undefined
  );
  // Borrar es irreversible (no hay una tabla de "papelera"), así que
  // no se dispara con un solo clic — primero hay que confirmar. Se
  // hace con un segundo paso propio (no window.confirm del navegador)
  // para que se vea igual de cuidado que el resto del panel.
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false);

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex gap-0.5 text-ember">
            {Array.from({ length: CALIFICACION_MAXIMA }).map((_, i) => (
              <EstrellaIcon
                key={i}
                llena={i < resena.calificacion}
                className="h-4 w-4"
              />
            ))}
          </div>
          <p className="mt-1 text-sm text-foreground">{resena.texto}</p>
          <p className="mt-1 text-xs text-muted">
            — {resena.clienteNombre} · {formatoFecha.format(new Date(resena.creadoEn))}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <form action={accionVisibilidad} className="contents">
            <input type="hidden" name="resenaId" value={resena.id} />
            <label className="flex items-center gap-1.5 text-xs whitespace-nowrap text-foreground">
              <input
                type="checkbox"
                name="visible"
                defaultChecked={resena.visible}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                className="h-4 w-4 rounded border-border accent-ember"
              />
              Visible en portada
            </label>
          </form>
          {confirmandoBorrar ? (
            <div className="flex items-center gap-2 text-xs whitespace-nowrap">
              <span className="text-danger">¿Borrar?</span>
              <form action={borrarResena}>
                <input type="hidden" name="resenaId" value={resena.id} />
                <button
                  type="submit"
                  className="font-semibold text-danger hover:underline"
                >
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

export default function ListaResenas({ resenas }: { resenas: Resena[] }) {
  return (
    <div className="flex flex-col gap-6">
      <FormularioNuevaResena />

      {resenas.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay reseñas cargadas.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {resenas.map((resena) => (
            <FilaResena key={resena.id} resena={resena} />
          ))}
        </ul>
      )}
    </div>
  );
}
