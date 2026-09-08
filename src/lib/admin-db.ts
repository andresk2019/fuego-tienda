// Datos propios de la tienda (NO de Contabilidad Lady) — hoy, la foto
// y la descripción de cada producto, y configuración del sitio (el
// logo). Vive en el MISMO Postgres que `inventario`, pero en tablas
// nuevas y separadas (`tienda_producto_meta`, `tienda_config`), nunca
// en las tablas de Contabilidad Lady. Esta es la ÚNICA parte de
// fuego-tienda que escribe en la base de datos — solo se usa desde el
// panel de administración (/admin), protegido por sesión.
import 'server-only';
import { getPool } from './pool';

let esquemaListo: Promise<void> | undefined;

// Un solo viaje de ida y vuelta para las 4 sentencias (antes eran 4
// consultas encadenadas por separado) — la base de datos está en
// sa-east-1 y las funciones de Vercel en iad1, así que cada viaje de
// más pesa, sobre todo la primera vez que arranca un contenedor
// nuevo (cuando `esquemaListo` todavía no está en caché).
function asegurarEsquema(): Promise<void> {
  if (!esquemaListo) {
    esquemaListo = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS tienda_producto_meta (
           producto_id INTEGER PRIMARY KEY,
           foto_url TEXT,
           descripcion TEXT,
           destacado BOOLEAN NOT NULL DEFAULT false,
           actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         ALTER TABLE tienda_producto_meta ADD COLUMN IF NOT EXISTS descripcion TEXT;
         ALTER TABLE tienda_producto_meta ADD COLUMN IF NOT EXISTS destacado BOOLEAN NOT NULL DEFAULT false;
         CREATE TABLE IF NOT EXISTS tienda_config (
           clave TEXT PRIMARY KEY,
           valor TEXT
         );`
      )
      .then(() => undefined);
  }
  return esquemaListo;
}

export async function obtenerLogoUrl(): Promise<string | null> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    "SELECT valor FROM tienda_config WHERE clave = 'logo_url'"
  );
  return rows[0]?.valor ?? null;
}

export async function guardarLogoUrl(url: string): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_config (clave, valor) VALUES ('logo_url', $1)
     ON CONFLICT (clave) DO UPDATE SET valor = $1`,
    [url]
  );
}

export type MetaProductos = {
  fotos: Record<number, string>;
  descripciones: Record<number, string>;
  destacados: Set<number>;
};

// Trae foto/descripción/destacado de TODOS los productos en una sola
// consulta (antes eran 3 consultas separadas a la misma tabla) — son
// pocos productos hoy, no vale la pena una consulta por producto ni
// una por columna.
export async function obtenerMetaDeProductos(): Promise<MetaProductos> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    'SELECT producto_id, foto_url, descripcion, destacado FROM tienda_producto_meta'
  );

  const fotos: Record<number, string> = {};
  const descripciones: Record<number, string> = {};
  const destacados = new Set<number>();

  for (const fila of rows) {
    if (fila.foto_url) fotos[fila.producto_id] = fila.foto_url;
    if (fila.descripcion) descripciones[fila.producto_id] = fila.descripcion;
    if (fila.destacado) destacados.add(fila.producto_id);
  }

  return { fotos, descripciones, destacados };
}

export async function guardarFotoProducto(productoId: number, fotoUrl: string): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_producto_meta (producto_id, foto_url, actualizado_en)
     VALUES ($1, $2, now())
     ON CONFLICT (producto_id) DO UPDATE SET foto_url = $2, actualizado_en = now()`,
    [productoId, fotoUrl]
  );
}

// Si `descripcion` llega vacía, se guarda como NULL (NULLIF) — así el
// producto vuelve a mostrar el texto genérico en vez de quedar con un
// texto vacío.
export async function guardarDescripcionProducto(
  productoId: number,
  descripcion: string
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_producto_meta (producto_id, descripcion, actualizado_en)
     VALUES ($1, NULLIF($2, ''), now())
     ON CONFLICT (producto_id) DO UPDATE SET descripcion = NULLIF($2, ''), actualizado_en = now()`,
    [productoId, descripcion]
  );
}

export async function guardarDestacadoProducto(
  productoId: number,
  destacado: boolean
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_producto_meta (producto_id, destacado, actualizado_en)
     VALUES ($1, $2, now())
     ON CONFLICT (producto_id) DO UPDATE SET destacado = $2, actualizado_en = now()`,
    [productoId, destacado]
  );
}
