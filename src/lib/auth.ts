// Autenticación del panel de administración — mismo esquema que usa
// Contabilidad Lady (ver `C:\Contabilidad Lady\lib\auth.js`): un solo
// usuario/contraseña fijos por variable de entorno, sesión como cookie
// firmada con HMAC (sin guardar nada en base de datos).
//
// A diferencia de Contabilidad Lady, aquí NO hay valores por defecto
// para ADMIN_USER/ADMIN_PASSWORD/SESSION_SECRET — si faltan, se lanza
// un error explícito en vez de dejar una contraseña adivinable.
//
// Se puede usar tanto desde Server Components/Actions como desde
// `proxy.ts` (el proxy de Next.js 16 corre en runtime de Node.js por
// defecto, así que el módulo nativo `crypto` funciona ahí también).
import 'server-only';
import crypto from 'node:crypto';

function requerido(valor: string | undefined, nombre: string): string {
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}`);
  }
  return valor;
}

export const NOMBRE_COOKIE_SESION = 'fuego_admin_sesion';
export const DURACION_SESION_MS = 24 * 60 * 60 * 1000; // 24 horas

function firmar(payloadB64: string): string {
  const secreto = requerido(process.env.SESSION_SECRET, 'SESSION_SECRET');
  return crypto.createHmac('sha256', secreto).update(payloadB64).digest('hex');
}

export function crearToken(usuario: string): string {
  const payload = { u: usuario, exp: Date.now() + DURACION_SESION_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${firmar(payloadB64)}`;
}

export function verificarToken(token: string | undefined | null): boolean {
  if (!token || !token.includes('.')) return false;
  const [payloadB64, firma] = token.split('.');
  if (!payloadB64 || !firma) return false;

  const firmaEsperada = firmar(payloadB64);
  const a = Buffer.from(firma, 'hex');
  const b = Buffer.from(firmaEsperada, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' && Date.now() <= payload.exp;
  } catch {
    return false;
  }
}

// Comparación en tiempo constante para no filtrar por timing cuánto
// coincide el usuario/contraseña escrito con el real.
function compararSeguro(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA); // mismo costo que una comparación real
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function credencialesValidas(usuario: string, contrasena: string): boolean {
  const usuarioValido = requerido(process.env.ADMIN_USER, 'ADMIN_USER');
  const contrasenaValida = requerido(process.env.ADMIN_PASSWORD, 'ADMIN_PASSWORD');
  return compararSeguro(usuario, usuarioValido) && compararSeguro(contrasena, contrasenaValida);
}
