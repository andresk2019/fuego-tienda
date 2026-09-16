"use client";

import { useActionState, useState } from "react";
import { enviarResenaCliente } from "@/app/(tienda)/productos/[id]/actions";
import SelectorCalificacion from "@/components/SelectorCalificacion";

// Formulario público para que cualquier cliente deje su propia reseña
// de esta vela puntual — a diferencia del formulario de /admin (que
// el dueño usa para cargar algo que un cliente ya le dijo por
// WhatsApp), esto lo llena el visitante mismo, sin sesión. Queda
// oculta hasta que el dueño la apruebe (ver enviarResenaCliente), así
// que después de enviarla se le explica eso — nunca aparece de
// inmediato como si ya estuviera publicada.
export default function FormularioResenaCliente({
  productoId,
}: {
  productoId: number;
}) {
  const [estado, accion] = useActionState(enviarResenaCliente, undefined);
  const [calificacion, setCalificacion] = useState(5);

  if (estado?.ok) {
    return (
      <div className="rounded-xl border border-ember/30 bg-ember/5 p-4 text-sm text-foreground">
        ¡Gracias por tu reseña! La vamos a revisar antes de publicarla en
        la tienda.
      </div>
    );
  }

  return (
    <form
      action={accion}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <input type="hidden" name="productoId" value={productoId} />
      <input type="hidden" name="calificacion" value={calificacion} />

      <p className="text-sm font-medium text-foreground">
        ¿Ya la compraste? Cuéntanos qué te pareció
      </p>

      <SelectorCalificacion valor={calificacion} onCambiar={setCalificacion} />

      <input
        type="text"
        name="clienteNombre"
        required
        maxLength={60}
        placeholder="Tu nombre"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
      />
      <textarea
        name="texto"
        required
        rows={3}
        maxLength={500}
        placeholder="¿Qué te pareció esta vela?"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
      />

      <button
        type="submit"
        className="w-fit rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
      >
        Enviar reseña
      </button>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
    </form>
  );
}
