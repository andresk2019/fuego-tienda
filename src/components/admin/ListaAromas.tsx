import { guardarDescripcion } from '@/app/admin/aromas/actions';
import { AROMAS_DISPONIBLES } from '@/lib/personalizacion';
import CampoTextoBloqueable from './CampoTextoBloqueable';

function FilaAroma({
  aroma,
  descripcionInicial,
}: {
  aroma: string;
  descripcionInicial: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <span className="font-medium text-foreground">{aroma}</span>
      <CampoTextoBloqueable
        valorInicial={descripcionInicial}
        accion={guardarDescripcion}
        nombreCampoTexto="descripcion"
        camposOcultos={{ aroma }}
        placeholder="¿Qué experiencia le da este aroma al cliente?"
        rows={2}
      />
    </div>
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
