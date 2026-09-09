// Descripciones de aroma — otra tabla propia de la tienda (igual que
// tienda_pedidos/tienda_resenas/tienda_producto_meta), vive en el
// mismo Postgres pero nunca toca las tablas de Contabilidad Lady.
//
// A diferencia de tienda_producto_meta (una fila por producto), aquí
// la llave es el nombre del aroma (de AROMAS_DISPONIBLES en
// personalizacion.ts) — no un id de `inventario`, porque el aroma no
// es un producto, es una opción que aplica igual a cualquier vela.
import 'server-only';
import { getPool } from './pool';

let esquemaListo: Promise<void> | undefined;

function asegurarEsquema(): Promise<void> {
  if (!esquemaListo) {
    esquemaListo = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS tienda_aromas (
           aroma TEXT PRIMARY KEY,
           descripcion TEXT,
           actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
         );`
      )
      .then(() => undefined);
  }
  return esquemaListo;
}

// Para la tienda pública y para precargar el formulario del admin —
// solo trae los aromas que SÍ tienen descripción guardada (los que
// todavía no se han escrito no aparecen, así el cliente en la tienda
// no ve un espacio vacío para un aroma sin descripción, ver
// DescripcionAroma en los componentes de producto).
export async function obtenerDescripcionesAromas(): Promise<
  Record<string, string>
> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    'SELECT aroma, descripcion FROM tienda_aromas WHERE descripcion IS NOT NULL'
  );

  const mapa: Record<string, string> = {};
  for (const fila of rows) {
    mapa[fila.aroma as string] = fila.descripcion as string;
  }
  return mapa;
}

// Si `descripcion` llega vacía, se guarda como NULL (NULLIF) — así el
// aroma vuelve a no tener descripción en vez de quedar con un texto
// vacío (mismo criterio que guardarDescripcionProducto en
// admin-db.ts).
export async function guardarDescripcionAroma(
  aroma: string,
  descripcion: string
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_aromas (aroma, descripcion, actualizado_en)
     VALUES ($1, NULLIF($2, ''), now())
     ON CONFLICT (aroma) DO UPDATE SET descripcion = NULLIF($2, ''), actualizado_en = now()`,
    [aroma, descripcion]
  );
}
