// Registro de pedidos — otra tabla propia de la tienda (igual que
// `tienda_producto_meta`/`tienda_config` en admin-db.ts), vive en el
// mismo Postgres pero nunca toca las tablas de Contabilidad Lady.
//
// A propósito esto NO descuenta stock ni reemplaza a Contabilidad
// Lady: el pedido queda guardado con estado "pendiente" solo para
// dejar rastro (número, cliente, productos, total) de algo que hoy
// vive únicamente en el chat de WhatsApp. El dueño lo sigue
// registrando como venta en Contabilidad Lady (eso es lo que de
// verdad descuenta el inventario) y aquí solo actualiza el estado
// para llevar el control del pedido.
import 'server-only';
import { getPool } from './pool';
import {
  formatearNumeroPedido,
  type EstadoPedido,
  type ItemPedido,
  type Pedido,
} from './pedidos';

let esquemaListo: Promise<void> | undefined;

function asegurarEsquema(): Promise<void> {
  if (!esquemaListo) {
    esquemaListo = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS tienda_pedidos (
           id SERIAL PRIMARY KEY,
           cliente_nombre TEXT NOT NULL,
           cliente_telefono TEXT NOT NULL,
           items JSONB NOT NULL,
           total NUMERIC NOT NULL,
           estado TEXT NOT NULL DEFAULT 'pendiente',
           creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
           actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
         );`
      )
      .then(() => undefined);
  }
  return esquemaListo;
}

export async function crearPedido(datos: {
  clienteNombre: string;
  clienteTelefono: string;
  items: ItemPedido[];
  total: number;
}): Promise<{ id: number; numero: string }> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `INSERT INTO tienda_pedidos (cliente_nombre, cliente_telefono, items, total)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      datos.clienteNombre,
      datos.clienteTelefono,
      JSON.stringify(datos.items),
      datos.total,
    ]
  );
  const id = rows[0].id as number;
  return { id, numero: formatearNumeroPedido(id) };
}

export async function obtenerPedidos(): Promise<Pedido[]> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT id, cliente_nombre, cliente_telefono, items, total, estado, creado_en
     FROM tienda_pedidos
     ORDER BY creado_en DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    numero: formatearNumeroPedido(r.id),
    clienteNombre: r.cliente_nombre,
    clienteTelefono: r.cliente_telefono,
    // node-postgres ya devuelve JSONB parseado como objeto/arreglo JS.
    items: r.items as ItemPedido[],
    total: Number(r.total),
    estado: r.estado as EstadoPedido,
    creadoEn: new Date(r.creado_en).toISOString(),
  }));
}

export async function actualizarEstadoPedido(
  id: number,
  estado: EstadoPedido
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `UPDATE tienda_pedidos SET estado = $2, actualizado_en = now() WHERE id = $1`,
    [id, estado]
  );
}
