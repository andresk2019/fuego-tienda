'use client';

import { useActionState, useEffect, useRef } from 'react';
import { cambiarContrasena } from '@/app/admin/actions';

// Antes la contraseña del panel SOLO se podía cambiar editando
// ADMIN_PASSWORD en Vercel y esperando un redeploy. Pide la
// contraseña actual aunque ya haya sesión abierta — es sensible,
// alguien con la sesión abierta en un computador compartido no
// debería poder cambiarla sin saber la actual.
export default function CambiarContrasenaForm() {
  const [estado, accion] = useActionState(cambiarContrasena, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Limpia los 3 campos después de guardar — dejarlos con la
  // contraseña vieja/nueva escrita en pantalla no tiene sentido una
  // vez que ya se guardó.
  useEffect(() => {
    if (estado?.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
      <div className="min-w-[100px] flex-1">
        <p className="text-sm font-medium text-foreground">
          Contraseña de administrador
        </p>
        <p className="text-xs text-muted">
          Para entrar a este panel. Al menos 8 caracteres.
        </p>
      </div>

      <form
        ref={formRef}
        action={accion}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Contraseña actual</span>
          <input
            type="password"
            name="actual"
            autoComplete="current-password"
            required
            className="w-40 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Nueva contraseña</span>
          <input
            type="password"
            name="nueva"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-40 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Confirmar nueva</span>
          <input
            type="password"
            name="confirmar"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-40 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60"
        >
          Cambiar contraseña
        </button>
      </form>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && (
        <p className="text-xs text-ember">
          ¡Contraseña cambiada! Úsala la próxima vez que entres.
        </p>
      )}
    </div>
  );
}
