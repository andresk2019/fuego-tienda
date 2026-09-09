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
         );`
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
}): Resena {
  return {
    id: r.id,
    clienteNombre: r.cliente_nombre,
    texto: r.texto,
    calificacion: r.calificacion,
    visible: r.visible,
    creadoEn: new Date(r.creado_en).toISOString(),
  };
}

// Para la portada pública — solo las que el dueño marcó como
// visibles, más recientes primero.
export async function obtenerResenasVisibles(): Promise<Resena[]> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT id, cliente_nombre, texto, calificacion, visible, creado_en
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
    `SELECT id, cliente_nombre, texto, calificacion, visible, creado_en
     FROM tienda_resenas
     ORDER BY creado_en DESC`
  );
  return rows.map(filaAResena);
}

export async function crearResena(datos: {
  clienteNombre: string;
  texto: string;
  calificacion: number;
}): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_resenas (cliente_nombre, texto, calificacion)
     VALUES ($1, $2, $3)`,
    [datos.clienteNombre, datos.texto, datos.calificacion]
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
