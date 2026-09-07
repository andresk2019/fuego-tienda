// Datos propios de la tienda (NO de Contabilidad Lady) — hoy, solo la
// foto de cada producto. Vive en el MISMO Postgres que `inventario`,
// pero en una tabla nueva y separada (`tienda_producto_meta`), nunca
// en las tablas de Contabilidad Lady. Esta es la ÚNICA parte de
// fuego-tienda que escribe en la base de datos — solo se usa desde el
// panel de administración (/admin), protegido por sesión.
import 'server-only';
import { Pool } from 'pg';

let pool: Pool | undefined;

function obtenerPool(): Pool {
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

let esquemaListo: Promise<void> | undefined;

function asegurarEsquema(): Promise<void> {
  if (!esquemaListo) {
    esquemaListo = obtenerPool()
      .query(
        `CREATE TABLE IF NOT EXISTS tienda_producto_meta (
           producto_id INTEGER PRIMARY KEY,
           foto_url TEXT,
           actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
         )`
      )
      .then(() => undefined);
  }
  return esquemaListo;
}

// id de producto -> URL de la foto. Trae todas de una vez (son pocos
// productos hoy) en vez de una consulta por producto.
export async function obtenerFotosDeProductos(): Promise<Record<number, string>> {
  await asegurarEsquema();
  const { rows } = await obtenerPool().query(
    'SELECT producto_id, foto_url FROM tienda_producto_meta WHERE foto_url IS NOT NULL'
  );
  const mapa: Record<number, string> = {};
  for (const fila of rows) mapa[fila.producto_id] = fila.foto_url;
  return mapa;
}

export async function guardarFotoProducto(productoId: number, fotoUrl: string): Promise<void> {
  await asegurarEsquema();
  await obtenerPool().query(
    `INSERT INTO tienda_producto_meta (producto_id, foto_url, actualizado_en)
     VALUES ($1, $2, now())
     ON CONFLICT (producto_id) DO UPDATE SET foto_url = $2, actualizado_en = now()`,
    [productoId, fotoUrl]
  );
}
