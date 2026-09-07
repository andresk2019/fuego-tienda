// Datos propios de la tienda (NO de Contabilidad Lady) — hoy, la foto
// y la descripción de cada producto. Vive en el MISMO Postgres que
// `inventario`, pero en una tabla nueva y separada
// (`tienda_producto_meta`), nunca en las tablas de Contabilidad Lady.
// Esta es la ÚNICA parte de fuego-tienda que escribe en la base de
// datos — solo se usa desde el panel de administración (/admin),
// protegido por sesión.
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
      // La tabla ya existía sin `descripcion` en despliegues previos —
      // ADD COLUMN IF NOT EXISTS la agrega sin tocar los datos que ya
      // había (fotos ya subidas). TEXT y no algo como VARCHAR(n):
      // la descripción de un producto puede ser tan larga como haga
      // falta, sin límite de tamaño impuesto por la base de datos.
      .then(() =>
        obtenerPool().query(
          `ALTER TABLE tienda_producto_meta ADD COLUMN IF NOT EXISTS descripcion TEXT`
        )
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

// id de producto -> descripción guardada desde el panel. Solo incluye
// productos con una descripción real (no vacía) — los demás siguen
// mostrando el texto genérico por categoría (ver descripciones.ts).
export async function obtenerDescripcionesDeProductos(): Promise<Record<number, string>> {
  await asegurarEsquema();
  const { rows } = await obtenerPool().query(
    "SELECT producto_id, descripcion FROM tienda_producto_meta WHERE descripcion IS NOT NULL AND descripcion <> ''"
  );
  const mapa: Record<number, string> = {};
  for (const fila of rows) mapa[fila.producto_id] = fila.descripcion;
  return mapa;
}

// Si `descripcion` llega vacía, se guarda como NULL (NULLIF) — así el
// producto vuelve a mostrar el texto genérico en vez de quedar con un
// texto vacío.
export async function guardarDescripcionProducto(
  productoId: number,
  descripcion: string
): Promise<void> {
  await asegurarEsquema();
  await obtenerPool().query(
    `INSERT INTO tienda_producto_meta (producto_id, descripcion, actualizado_en)
     VALUES ($1, NULLIF($2, ''), now())
     ON CONFLICT (producto_id) DO UPDATE SET descripcion = NULLIF($2, ''), actualizado_en = now()`,
    [productoId, descripcion]
  );
}
