import EstrellaIcon from "@/components/EstrellaIcon";
import type { Resena } from "@/lib/resenas";

// Espacio de reseñas de clientes en la portada. Igual que
// CarruselDestacados, si todavía no hay ninguna reseña visible no
// tiene sentido mostrar una sección vacía o con un aviso — se
// devuelve null y listo, aparece sola en cuanto el dueño cargue la
// primera desde el panel de administración.
export default function Resenas({ resenas }: { resenas: Resena[] }) {
  if (resenas.length === 0) return null;

  return (
    <section className="border-b border-border px-6 py-14">
      <h2 className="mb-8 text-center font-serif text-2xl text-foreground">
        Lo que dicen nuestros clientes
      </h2>

      <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resenas.map((resena) => (
          <li
            key={resena.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex gap-0.5 text-ember">
              {Array.from({ length: 5 }).map((_, i) => (
                <EstrellaIcon
                  key={i}
                  llena={i < resena.calificacion}
                  className="h-4 w-4"
                />
              ))}
            </div>
            <p className="text-sm text-foreground italic">
              &ldquo;{resena.texto}&rdquo;
            </p>
            <p className="mt-auto text-xs font-medium text-muted">
              — {resena.clienteNombre}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
