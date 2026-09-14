import EstrellaIcon from "@/components/EstrellaIcon";
import type { Resena } from "@/lib/resenas";

// Reseñas asociadas a ESTA vela puntual (ver obtenerResenasDeProducto
// en resenas-db.ts) — distinto del espacio de reseñas de la portada
// (Resenas.tsx), que mezcla las generales de la tienda con las de
// cualquier producto. Si la vela todavía no tiene ninguna reseña
// propia, no se muestra nada (ver productos/[id]/page.tsx).
export default function ResenasProducto({ resenas }: { resenas: Resena[] }) {
  if (resenas.length === 0) return null;

  return (
    <section className="mt-4 border-t border-border pt-6">
      <h2 className="mb-4 font-serif text-xl text-foreground">
        Lo que dicen de esta vela
      </h2>

      <ul className="flex flex-col gap-3">
        {resenas.map((resena) => (
          <li
            key={resena.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4"
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
            <p className="text-xs font-medium text-muted">
              — {resena.clienteNombre}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
