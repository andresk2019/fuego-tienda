// Una sola conexión (Pool) a Postgres, compartida por db.ts (lectura
// de Contabilidad Lady) y admin-db.ts (lectura/escritura propia de la
// tienda) — antes cada archivo mantenía su propio Pool por separado,
// contra la MISMA base de datos, duplicando el costo de conexión en
// cada carga de página (la base de datos está en sa-east-1 y las
// funciones de Vercel corren en iad1 — la distancia ya pesa; no hacía
// falta pagarla dos veces por request).
import 'server-only';
import { Pool } from 'pg';

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('Falta la variable de entorno DATABASE_URL con la cadena de conexión de Postgres');
    }
    pool = new Pool({
      connectionString,
      ssl: /localhost|127\.0\.0\.1/.test(connectionString) ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}
