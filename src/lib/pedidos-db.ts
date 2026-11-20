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
  type ZonaEnvio,
} from './pedidos';

let esquemaListo: Promise<void> | undefined;

export function asegurarEsquema(): Promise<void> {
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
         );
         ALTER TABLE tienda_pedidos ADD COLUMN IF NOT EXISTS cliente_direccion TEXT;
         ALTER TABLE tienda_pedidos ADD COLUMN IF NOT EXISTS costo_envio NUMERIC;
         ALTER TABLE tienda_pedidos ADD COLUMN IF NOT EXISTS zona_envio TEXT;
         ALTER TABLE tienda_pedidos ADD COLUMN IF NOT EXISTS cliente_departamento TEXT;
         ALTER TABLE tienda_pedidos ADD COLUMN IF NOT EXISTS cliente_municipio TEXT;
         -- "Confirmado" pasó a llamarse "En preparación" (2026-11-19,
         -- seguimiento de pedidos). Idempotente: sin filas viejas no hace nada.
         UPDATE tienda_pedidos SET estado = 'en_preparacion' WHERE estado = 'confirmado';
         -- Historial: cada vez que un pedido entra a un estado queda una fila
         -- con su fecha (se muestra al cliente en /seguimiento).
         CREATE TABLE IF NOT EXISTS tienda_pedidos_historial (
           id SERIAL PRIMARY KEY,
           pedido_id INTEGER NOT NULL,
           estado TEXT NOT NULL,
           creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         CREATE UNIQUE INDEX IF NOT EXISTS tienda_pedidos_historial_unico
           ON tienda_pedidos_historial (pedido_id, estado, creado_en);
         -- Pedidos de ANTES del historial: se reconstruye lo que se sabe
         -- (recibido al crearse, y el estado actual en su última
         -- actualización). Idempotente: solo toca pedidos sin historial, y el
         -- índice único evita duplicados si dos instancias arrancan a la vez.
         INSERT INTO tienda_pedidos_historial (pedido_id, estado, creado_en)
           SELECT id, 'pendiente', creado_en FROM tienda_pedidos p
           WHERE NOT EXISTS (SELECT 1 FROM tienda_pedidos_historial h WHERE h.pedido_id = p.id)
           ON CONFLICT DO NOTHING;
         INSERT INTO tienda_pedidos_historial (pedido_id, estado, creado_en)
           SELECT id, estado, actualizado_en FROM tienda_pedidos p
           WHERE estado <> 'pendiente'
             AND NOT EXISTS (SELECT 1 FROM tienda_pedidos_historial h WHERE h.pedido_id = p.id AND h.estado = p.estado)
           ON CONFLICT DO NOTHING;
         ALTER TABLE tienda_pedidos ADD COLUMN IF NOT EXISTS cupon_codigo TEXT;
         ALTER TABLE tienda_pedidos ADD COLUMN IF NOT EXISTS descuento_cupon NUMERIC;`
      )
      .then(() => undefined);
  }
  return esquemaListo;
}

export async function crearPedido(datos: {
  clienteNombre: string;
  clienteTelefono: string;
  clienteDireccion: string;
  clienteDepartamento: string;
  clienteMunicipio: string;
  items: ItemPedido[];
  total: number;
  costoEnvio: number;
  zonaEnvio: ZonaEnvio;
  // Cupón usado (código) y cuánto se ahorró el cliente con él — null
  // si no usó ninguno.
  cuponCodigo: string | null;
  descuentoCupon: number | null;
}): Promise<{ id: number; numero: string }> {
  await asegurarEsquema();
  // Un solo comando: el pedido y su primera fila de historial se crean
  // juntos o no se crea ninguno.
  const { rows } = await getPool().query(
    `WITH nuevo AS (
       INSERT INTO tienda_pedidos (cliente_nombre, cliente_telefono, cliente_direccion, cliente_departamento, cliente_municipio, items, total, costo_envio, zona_envio, cupon_codigo, descuento_cupon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id
     ), hist AS (
       INSERT INTO tienda_pedidos_historial (pedido_id, estado)
       SELECT id, 'pendiente' FROM nuevo
     )
     SELECT id FROM nuevo`,
    [
      datos.clienteNombre,
      datos.clienteTelefono,
      datos.clienteDireccion,
      datos.clienteDepartamento,
      datos.clienteMunicipio,
      JSON.stringify(datos.items),
      datos.total,
      datos.costoEnvio,
      datos.zonaEnvio,
      datos.cuponCodigo,
      datos.descuentoCupon,
    ]
  );
  const id = rows[0].id as number;
  return { id, numero: formatearNumeroPedido(id) };
}

export async function obtenerPedidos(): Promise<Pedido[]> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT id, cliente_nombre, cliente_telefono, cliente_direccion, cliente_departamento, cliente_municipio, items, total, costo_envio, zona_envio, cupon_codigo, descuento_cupon, estado, creado_en
     FROM tienda_pedidos
     ORDER BY creado_en DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    numero: formatearNumeroPedido(r.id),
    clienteNombre: r.cliente_nombre,
    clienteTelefono: r.cliente_telefono,
    // Pedidos de antes de este campo quedan con '' (ver comentario en
    // pedidos.ts) en vez de null.
    clienteDireccion: r.cliente_direccion ?? '',
    clienteDepartamento: r.cliente_departamento ?? null,
    clienteMunicipio: r.cliente_municipio ?? null,
    // node-postgres ya devuelve JSONB parseado como objeto/arreglo JS.
    items: r.items as ItemPedido[],
    total: Number(r.total),
    // null real (no 0) en pedidos de antes de este campo — ver
    // comentario en pedidos.ts.
    costoEnvio: r.costo_envio !== null ? Number(r.costo_envio) : null,
    zonaEnvio: (r.zona_envio as ZonaEnvio | null) ?? null,
    cuponCodigo: r.cupon_codigo ?? null,
    descuentoCupon: r.descuento_cupon !== null ? Number(r.descuento_cupon) : null,
    estado: r.estado as EstadoPedido,
    creadoEn: new Date(r.creado_en).toISOString(),
  }));
}

// Lo mínimo que se le muestra al cliente en /seguimiento. A propósito
// SIN teléfono completo, dirección ni apellido: quien consulta ya
// demostró conocer el número de pedido y el teléfono, pero no hay por
// qué mostrar más de lo necesario.
export type PedidoSeguimiento = {
  numero: string;
  primerNombre: string;
  municipio: string | null;
  items: ItemPedido[];
  total: number;
  costoEnvio: number | null;
  estado: EstadoPedido;
  creadoEn: string;
  actualizadoEn: string;
  // Fecha (ISO) más reciente en que el pedido entró a cada estado; un
  // estado que se saltó (ej. de pendiente a en camino) no aparece.
  historial: Partial<Record<EstadoPedido, string>>;
};

// Devuelve el pedido SOLO si el teléfono coincide con el del pedido
// (comparando los últimos 10 dígitos); si el pedido no existe o el
// teléfono no coincide, devuelve null en ambos casos — así no se puede
// usar para averiguar qué números de pedido existen.
export async function buscarPedidoParaSeguimiento(
  id: number,
  telefonoNormalizado: string
): Promise<PedidoSeguimiento | null> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT id, cliente_nombre, cliente_telefono, cliente_municipio, items, total, costo_envio, estado, creado_en, actualizado_en
     FROM tienda_pedidos WHERE id = $1`,
    [id]
  );
  const r = rows[0];
  if (!r) return null;
  const telefonoPedido = String(r.cliente_telefono).replace(/\D/g, '').slice(-10);
  if (telefonoNormalizado.length < 7 || telefonoPedido !== telefonoNormalizado) {
    return null;
  }
  const { rows: filasHistorial } = await getPool().query(
    `SELECT estado, MAX(creado_en) AS fecha
     FROM tienda_pedidos_historial WHERE pedido_id = $1 GROUP BY estado`,
    [id]
  );
  const historial: Partial<Record<EstadoPedido, string>> = {};
  for (const h of filasHistorial) {
    historial[h.estado as EstadoPedido] = new Date(h.fecha).toISOString();
  }
  return {
    numero: formatearNumeroPedido(r.id),
    primerNombre: String(r.cliente_nombre).trim().split(/\s+/)[0] ?? '',
    municipio: r.cliente_municipio ?? null,
    items: r.items as ItemPedido[],
    total: Number(r.total),
    costoEnvio: r.costo_envio !== null ? Number(r.costo_envio) : null,
    estado: r.estado as EstadoPedido,
    creadoEn: new Date(r.creado_en).toISOString(),
    actualizadoEn: new Date(r.actualizado_en).toISOString(),
    historial,
  };
}

export async function actualizarEstadoPedido(
  id: number,
  estado: EstadoPedido
): Promise<void> {
  await asegurarEsquema();
  // Solo deja rastro en el historial si el estado de verdad cambió
  // (elegir el mismo estado otra vez no añade nada).
  await getPool().query(
    `WITH previo AS (
       SELECT estado FROM tienda_pedidos WHERE id = $1 FOR UPDATE
     ), cambio AS (
       UPDATE tienda_pedidos SET estado = $2, actualizado_en = now()
       WHERE id = $1 RETURNING id
     )
     INSERT INTO tienda_pedidos_historial (pedido_id, estado)
     SELECT id, $2 FROM cambio
     WHERE (SELECT estado FROM previo) IS DISTINCT FROM $2`,
    [id, estado]
  );
}
