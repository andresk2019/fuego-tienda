// Límite de intentos fallidos en el login de /admin — sin esto,
// nada frena a alguien que quiera probar contraseñas una y otra vez
// contra iniciarSesion() (ver login/actions.ts). Se guarda en la
// misma base de datos compartida (tabla propia) en vez de en
// memoria: en Vercel cada invocación puede caer en una instancia de
// función distinta, así que un contador en memoria del proceso no
// serviría de nada.
import 'server-only';
import { headers } from 'next/headers';
import { getPool } from './pool';

const LIMITE_INTENTOS = 5;
const DURACION_BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos

let esquemaListo: Promise<void> | undefined;

function asegurarEsquema(): Promise<void> {
  if (!esquemaListo) {
    esquemaListo = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS tienda_login_intentos (
           ip TEXT PRIMARY KEY,
           intentos INTEGER NOT NULL DEFAULT 0,
           bloqueado_hasta TIMESTAMPTZ,
           ultimo_intento TIMESTAMPTZ NOT NULL DEFAULT now()
         );`
      )
      .then(() => undefined);
  }
  return esquemaListo;
}

// Heurística razonable, no infalible: toma el primer valor de
// x-forwarded-for (el que agrega Vercel en su borde con la IP real
// del cliente). No frena a alguien dispuesto a rotar de IP, pero sí
// vuelve inviable probar contraseñas en un bucle simple desde una
// sola conexión.
export async function obtenerIpCliente(): Promise<string> {
  const encabezados = await headers();
  const forwardedFor = encabezados.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return encabezados.get('x-real-ip') ?? 'desconocida';
}

export type EstadoBloqueo = { bloqueado: boolean; minutosRestantes?: number };

export async function verificarBloqueo(ip: string): Promise<EstadoBloqueo> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    'SELECT bloqueado_hasta FROM tienda_login_intentos WHERE ip = $1',
    [ip]
  );
  const bloqueadoHasta = rows[0]?.bloqueado_hasta as Date | null | undefined;
  if (bloqueadoHasta && bloqueadoHasta.getTime() > Date.now()) {
    const minutosRestantes = Math.ceil(
      (bloqueadoHasta.getTime() - Date.now()) / 60000
    );
    return { bloqueado: true, minutosRestantes };
  }
  return { bloqueado: false };
}

// Se llama tras un intento fallido — al llegar a LIMITE_INTENTOS
// seguidos, bloquea esa IP por DURACION_BLOQUEO_MS.
export async function registrarIntentoFallido(ip: string): Promise<void> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `INSERT INTO tienda_login_intentos (ip, intentos, ultimo_intento)
     VALUES ($1, 1, now())
     ON CONFLICT (ip) DO UPDATE
       SET intentos = tienda_login_intentos.intentos + 1, ultimo_intento = now()
     RETURNING intentos`,
    [ip]
  );
  const intentos = rows[0]?.intentos as number;
  if (intentos >= LIMITE_INTENTOS) {
    const bloqueadoHasta = new Date(Date.now() + DURACION_BLOQUEO_MS);
    await getPool().query(
      'UPDATE tienda_login_intentos SET bloqueado_hasta = $2 WHERE ip = $1',
      [ip, bloqueadoHasta]
    );
  }
}

// Un login exitoso limpia el contador — no tiene sentido seguir
// contando intentos viejos contra alguien que ya entró bien.
export async function registrarLoginExitoso(ip: string): Promise<void> {
  await asegurarEsquema();
  await getPool().query('DELETE FROM tienda_login_intentos WHERE ip = $1', [ip]);
}
