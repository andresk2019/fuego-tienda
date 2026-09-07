'use server';

import { redirect } from 'next/navigation';
import { credencialesValidas } from '@/lib/auth';
import { crearSesion } from '@/lib/session';

export type EstadoLogin = { error?: string } | undefined;

export async function iniciarSesion(
  _estado: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const usuario = String(formData.get('usuario') ?? '').trim();
  const contrasena = String(formData.get('contrasena') ?? '');

  if (!usuario || !contrasena) {
    return { error: 'Completa usuario y contraseña.' };
  }

  if (!credencialesValidas(usuario, contrasena)) {
    return { error: 'Usuario o contraseña incorrectos.' };
  }

  await crearSesion(usuario);
  redirect('/admin');
}
