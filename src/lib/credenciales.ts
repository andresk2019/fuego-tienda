// Separado de auth.ts a propósito: esto SÍ toca la base de datos
// (obtenerContrasenaAdminHash, admin-db.ts), así que solo lo importan
// los Server Actions que necesitan revisar la contraseña (login,
// cambiarContrasena) — nunca proxy.ts, que solo necesita verificarToken
// de auth.ts (puro, sin base de datos) en cada visita a /admin/*.
import 'server-only';
import { compararSeguro, verificarContrasena } from './auth';
import { obtenerContrasenaAdminHash } from './admin-db';

function requerido(valor: string | undefined, nombre: string): string {
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}`);
  }
  return valor;
}

// Antes la contraseña SOLO podía ser la de la variable de entorno
// ADMIN_PASSWORD — cambiarla exigía editarla en Vercel y esperar un
// redeploy. Ahora se puede cambiar desde /admin (ver
// cambiarContrasena en admin/actions.ts): si hay una guardada en la
// base de datos se compara contra esa; si todavía no se ha cambiado
// ninguna, se sigue comparando contra la variable de entorno, como
// siempre. El usuario (ADMIN_USER) no cambia — solo se pidió poder
// cambiar la contraseña.
export async function credencialesValidas(
  usuario: string,
  contrasena: string
): Promise<boolean> {
  const usuarioValido = requerido(process.env.ADMIN_USER, 'ADMIN_USER');
  if (!compararSeguro(usuario, usuarioValido)) return false;

  const hashGuardado = await obtenerContrasenaAdminHash();
  if (hashGuardado) {
    return verificarContrasena(contrasena, hashGuardado);
  }

  const contrasenaValida = requerido(process.env.ADMIN_PASSWORD, 'ADMIN_PASSWORD');
  return compararSeguro(contrasena, contrasenaValida);
}
