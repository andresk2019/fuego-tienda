'use client';

import { useActionState } from 'react';
import { guardarDescripcion } from '@/app/admin/aromas/actions';
import { AROMAS_DISPONIBLES } from '@/lib/personalizacion';

function FilaAroma({
  aroma,
  descripcionInicial,
}: {
  aroma: string;
  descripcionInicial: string;
}) {
  const [estado, accion] = useActionState(guardarDescripcion, undefined);

  return (
    <form
      action={accion}
      className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4"
    >
      <input type="hidden" name="aroma" value={aroma} />
      <span className="font-medium text-foreground">{aroma}</span>
      <textarea
        name="descripcion"
        defaultValue={descripcionInicial}
        rows={2}
        placeholder="¿Qué experiencia le da este aroma al cliente?"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
      />
      <button
        type="submit"
        className="w-fit rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60"
      >
        Guardar
      </button>
      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && <p className="text-xs text-ember">¡Guardado!</p>}
    </form>
  );
}

// Uno por cada aroma de la lista fija (AROMAS_DISPONIBLES) — no hay
// que "agregar" ni "borrar" aromas aquí, solo escribirles su
// descripción. Si un aroma todavía no tiene descripción guardada, el
// campo empieza vacío.
export default function ListaAromas({
  descripciones,
}: {
  descripciones: Record<string, string>;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {AROMAS_DISPONIBLES.map((aroma) => (
        <li key={aroma}>
          <FilaAroma
            aroma={aroma}
            descripcionInicial={descripciones[aroma] ?? ''}
          />
        </li>
      ))}
    </ul>
  );
}
