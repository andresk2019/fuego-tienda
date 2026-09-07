// Manejo de la cookie de sesión del panel de administración, usando la
// API `cookies()` de Next.js (solo Server Components/Actions — para el
// proxy se usa `verificarToken` de auth.ts directo sobre las cookies
// del request).
import 'server-only';
import { cookies } from 'next/headers';
import { crearToken, verificarToken, NOMBRE_COOKIE_SESION, DURACION_SESION_MS } from './auth';

export async function crearSesion(usuario: string): Promise<void> {
  const token = crearToken(usuario);
  (await cookies()).set(NOMBRE_COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(DURACION_SESION_MS / 1000),
  });
}

export async function eliminarSesion(): Promise<void> {
  (await cookies()).delete(NOMBRE_COOKIE_SESION);
}

export async function haySesion(): Promise<boolean> {
  const token = (await cookies()).get(NOMBRE_COOKIE_SESION)?.value;
  return verificarToken(token);
}
