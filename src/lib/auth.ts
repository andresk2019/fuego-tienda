// Autenticación del panel de administración — mismo esquema que usa
// Contabilidad Lady (ver `C:\Contabilidad Lady\lib\auth.js`): un solo
// usuario/contraseña fijos por variable de entorno, sesión como cookie
// firmada con HMAC.
//
// A diferencia de Contabilidad Lady, aquí NO hay valores por defecto
// para ADMIN_USER/ADMIN_PASSWORD/SESSION_SECRET — si faltan, se lanza
// un error explícito en vez de dejar una contraseña adivinable.
//
// A propósito este archivo NO toca la base de datos (ver
// credenciales.ts para eso): `proxy.ts` importa `verificarToken` de
// acá en CADA visita a /admin/*, así que si este archivo arrastrara
// admin-db.ts (y por lo tanto `pg`), ese peso extra viajaría con el
// proxy en cada request, aunque el proxy nunca necesite consultar la
// contraseña — solo verificar el token de la cookie de sesión.
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
// coincide el usuario/contraseña escrito con el real. Exportada:
// credenciales.ts la reusa para comparar el usuario (ADMIN_USER, que
// sigue siendo de la variable de entorno, nunca se pidió poder
// cambiarlo).
export function compararSeguro(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA); // mismo costo que una comparación real
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// scrypt (nativo de Node, sin librería aparte) + una sal aleatoria
// distinta por contraseña — así la misma contraseña guardada 2 veces
// nunca produce el mismo hash. Se guarda como "sal:hash" (ambos en
// hexadecimal) en un solo campo de texto.
const LARGO_LLAVE = 64;

export function hashearContrasena(contrasena: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const sal = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(contrasena, sal, LARGO_LLAVE, (error, llaveDerivada) => {
      if (error) return reject(error);
      resolve(`${sal}:${llaveDerivada.toString('hex')}`);
    });
  });
}

export function verificarContrasena(
  contrasena: string,
  hashGuardado: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [sal, hashHex] = hashGuardado.split(':');
    if (!sal || !hashHex) return resolve(false);
    crypto.scrypt(contrasena, sal, LARGO_LLAVE, (error, llaveDerivada) => {
      if (error) return reject(error);
      const b = Buffer.from(hashHex, 'hex');
      resolve(
        llaveDerivada.length === b.length &&
          crypto.timingSafeEqual(llaveDerivada, b)
      );
    });
  });
}
