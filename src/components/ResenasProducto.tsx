import EstrellaIcon from "@/components/EstrellaIcon";
import FormularioResenaCliente from "@/components/FormularioResenaCliente";
import type { Resena } from "@/lib/resenas";

// Reseñas asociadas a ESTA vela puntual (ver obtenerResenasDeProducto
// en resenas-db.ts) — distinto del espacio de reseñas de la portada
// (Resenas.tsx), que mezcla las generales de la tienda con las de
// cualquier producto. El formulario para dejar una reseña nueva
// siempre se muestra (incluso sin ninguna reseña aprobada todavía) —
// solo la LISTA de reseñas ya aprobadas se omite si está vacía.
export default function ResenasProducto({
  resenas,
  productoId,
}: {
  resenas: Resena[];
  productoId: number;
}) {
  return (
    <section className="mt-4 flex flex-col gap-6 border-t border-border pt-6">
      {resenas.length > 0 && (
        <div>
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
        </div>
      )}

      <FormularioResenaCliente productoId={productoId} />
    </section>
  );
}
