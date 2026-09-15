'use server';

import { redirect } from 'next/navigation';
import { credencialesValidas } from '@/lib/auth';
import { crearSesion } from '@/lib/session';
import {
  obtenerIpCliente,
  verificarBloqueo,
  registrarIntentoFallido,
  registrarLoginExitoso,
} from '@/lib/login-intentos';

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

  // Se revisa ANTES de comparar credenciales — así alguien bloqueado
  // no puede seguir probando aunque acierte de casualidad.
  const ip = await obtenerIpCliente();
  const bloqueo = await verificarBloqueo(ip);
  if (bloqueo.bloqueado) {
    return {
      error: `Demasiados intentos fallidos. Intenta de nuevo en ${bloqueo.minutosRestantes} minuto${bloqueo.minutosRestantes === 1 ? '' : 's'}.`,
    };
  }

  if (!credencialesValidas(usuario, contrasena)) {
    await registrarIntentoFallido(ip);
    return { error: 'Usuario o contraseña incorrectos.' };
  }

  await registrarLoginExitoso(ip);
  await crearSesion(usuario);
  redirect('/admin');
}
