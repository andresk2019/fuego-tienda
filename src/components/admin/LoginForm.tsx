'use client';

import { useActionState } from 'react';
import { iniciarSesion } from '@/app/admin/login/actions';

export default function LoginForm() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, undefined);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Usuario</span>
        <input
          name="usuario"
          type="text"
          required
          autoComplete="username"
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Contraseña</span>
        <input
          name="contrasena"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
        />
      </label>

      {estado?.error && <p className="text-sm text-danger">{estado.error}</p>}

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover disabled:opacity-60"
      >
        {pendiente ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
