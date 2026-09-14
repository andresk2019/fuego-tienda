// Reseñas de clientes — otra tabla propia de la tienda (igual que
// tienda_pedidos/tienda_producto_meta), vive en el mismo Postgres
// pero nunca toca las tablas de Contabilidad Lady.
//
// La tienda todavía no tiene un flujo automático para pedirle una
// reseña al cliente después de una compra (no hay cuentas de
// usuario, y los pedidos se coordinan por WhatsApp) — así que, por
// ahora, el dueño las carga a mano desde el panel de administración
// (ej. cuando un cliente le escribe algo bueno por WhatsApp) y decide
// cuáles mostrar en la portada con el interruptor de "visible".
//
// Cada reseña puede (opcionalmente) quedar asociada a una vela
// puntual (`producto_id`) — así el catálogo y la página de ese
// producto pueden mostrar SU PROPIA calificación, en vez de un
// promedio general repetido en todos lados. Una reseña sin producto
// asociado sigue contando como "reseña general de la tienda" y solo
// aparece en la portada.
import 'server-only';
import { getPool } from './pool';
import type { Resena } from './resenas';

let esquemaListo: Promise<void> | undefined;

function asegurarEsquema(): Promise<void> {
  if (!esquemaListo) {
    esquemaListo = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS tienda_resenas (
           id SERIAL PRIMARY KEY,
           cliente_nombre TEXT NOT NULL,
           texto TEXT NOT NULL,
           calificacion INTEGER NOT NULL DEFAULT 5,
           visible BOOLEAN NOT NULL DEFAULT true,
           creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         ALTER TABLE tienda_resenas ADD COLUMN IF NOT EXISTS producto_id INTEGER;`
      )
      .then(() => undefined);
  }
  return esquemaListo;
}

function filaAResena(r: {
  id: number;
  cliente_nombre: string;
  texto: string;
  calificacion: number;
  visible: boolean;
  creado_en: Date | string;
  producto_id: number | null;
}): Resena {
  return {
    id: r.id,
    clienteNombre: r.cliente_nombre,
    texto: r.texto,
    calificacion: r.calificacion,
    visible: r.visible,
    creadoEn: new Date(r.creado_en).toISOString(),
    productoId: r.producto_id,
  };
}

// Para la portada pública — solo las que el dueño marcó como
// visibles, más recientes primero.
export async function obtenerResenasVisibles(): Promise<Resena[]> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT id, cliente_nombre, texto, calificacion, visible, creado_en, producto_id
     FROM tienda_resenas
     WHERE visible = true
     ORDER BY creado_en DESC`
  );
  return rows.map(filaAResena);
}

// Para el panel de administración — todas, visibles u ocultas.
export async function obtenerResenas(): Promise<Resena[]> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT id, cliente_nombre, texto, calificacion, visible, creado_en, producto_id
     FROM tienda_resenas
     ORDER BY creado_en DESC`
  );
  return rows.map(filaAResena);
}

// Reseñas visibles de UNA vela puntual — para mostrar en su propia
// página de producto.
export async function obtenerResenasDeProducto(
  productoId: number
): Promise<Resena[]> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT id, cliente_nombre, texto, calificacion, visible, creado_en, producto_id
     FROM tienda_resenas
     WHERE visible = true AND producto_id = $1
     ORDER BY creado_en DESC`,
    [productoId]
  );
  return rows.map(filaAResena);
}

export type ResumenResenas = {
  promedio: number;
  total: number;
};

// Promedio y total de reseñas visibles de UNA vela puntual — null si
// todavía no tiene ninguna (para no mostrar "0 reseñas" en su
// página).
export async function obtenerResumenResenasDeProducto(
  productoId: number
): Promise<ResumenResenas | null> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT avg(calificacion) AS promedio, count(*) AS total
     FROM tienda_resenas
     WHERE visible = true AND producto_id = $1`,
    [productoId]
  );
  const total = Number(rows[0]?.total ?? 0);
  if (total === 0) return null;
  return { promedio: Number(rows[0].promedio), total };
}

// Lo mismo que la función de arriba, pero para TODOS los productos en
// una sola consulta (para el catálogo, que muestra muchas tarjetas a
// la vez) — solo trae productos que de verdad tienen al menos una
// reseña visible asociada.
export async function obtenerResumenResenasPorProducto(): Promise<
  Record<number, ResumenResenas>
> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT producto_id, avg(calificacion) AS promedio, count(*) AS total
     FROM tienda_resenas
     WHERE visible = true AND producto_id IS NOT NULL
     GROUP BY producto_id`
  );
  const mapa: Record<number, ResumenResenas> = {};
  for (const fila of rows) {
    mapa[fila.producto_id] = {
      promedio: Number(fila.promedio),
      total: Number(fila.total),
    };
  }
  return mapa;
}

export async function crearResena(datos: {
  clienteNombre: string;
  texto: string;
  calificacion: number;
  // null = reseña general de la tienda, no de una vela en particular.
  productoId: number | null;
}): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_resenas (cliente_nombre, texto, calificacion, producto_id)
     VALUES ($1, $2, $3, $4)`,
    [datos.clienteNombre, datos.texto, datos.calificacion, datos.productoId]
  );
}

export async function actualizarVisibilidadResena(
  id: number,
  visible: boolean
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `UPDATE tienda_resenas SET visible = $2 WHERE id = $1`,
    [id, visible]
  );
}

export async function eliminarResena(id: number): Promise<void> {
  await asegurarEsquema();
  await getPool().query(`DELETE FROM tienda_resenas WHERE id = $1`, [id]);
}
