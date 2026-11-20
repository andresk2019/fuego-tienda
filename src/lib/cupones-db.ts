// Cupones de descuento — otra tabla propia de la tienda (igual que
// tienda_promociones): vive en el mismo Postgres pero nunca toca las
// tablas de Contabilidad Lady. Las reglas de suma están en cupones.ts.
import 'server-only';
import { getPool } from './pool';
import type { Cupon } from './cupones';
import { asegurarEsquema as asegurarEsquemaPedidos } from './pedidos-db';

let esquemaListo: Promise<void> | undefined;

function asegurarEsquema(): Promise<void> {
  if (!esquemaListo) {
    esquemaListo = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS tienda_cupones (
           id SERIAL PRIMARY KEY,
           codigo TEXT NOT NULL UNIQUE,
           porcentaje INTEGER NOT NULL,
           tope_total INTEGER NOT NULL,
           inicio DATE,
           fin DATE,
           activo BOOLEAN NOT NULL DEFAULT true,
           creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
         );`
      )
      .then(() => undefined);
  }
  return esquemaListo;
}

// "Hoy" = día calendario de Colombia (igual que en promociones-db.ts): un
// cupón que termina "el 30" sigue sirviendo todo el día 30, hora local.
const HOY = `(now() AT TIME ZONE 'America/Bogota')::date`;

const COLUMNAS = `
  id, codigo, porcentaje, tope_total,
  to_char(inicio, 'YYYY-MM-DD') AS inicio,
  to_char(fin, 'YYYY-MM-DD') AS fin,
  activo,
  CASE
    WHEN NOT activo THEN 'desactivado'
    WHEN inicio IS NOT NULL AND inicio > ${HOY} THEN 'programado'
    WHEN fin IS NOT NULL AND fin < ${HOY} THEN 'vencido'
    ELSE 'vigente'
  END AS estado`;

type Fila = {
  id: number;
  codigo: string;
  porcentaje: number;
  tope_total: number;
  inicio: string | null;
  fin: string | null;
  activo: boolean;
  estado: Cupon['estado'];
  usos?: string | number;
};

function filaACupon(r: Fila): Cupon {
  return {
    id: r.id,
    codigo: r.codigo,
    porcentaje: r.porcentaje,
    topeTotal: r.tope_total,
    inicio: r.inicio,
    fin: r.fin,
    activo: r.activo,
    estado: r.estado,
    usos: Number(r.usos ?? 0),
  };
}

// Para el panel de administración — todos, con su estado y cuántos
// pedidos (no cancelados) lo usaron.
export async function obtenerCupones(): Promise<Cupon[]> {
  // La cuenta de usos lee tienda_pedidos.cupon_codigo: esa columna se
  // crea en pedidos-db.
  await Promise.all([asegurarEsquema(), asegurarEsquemaPedidos()]);
  const { rows } = await getPool().query(
    `SELECT c.*, (
       SELECT count(*) FROM tienda_pedidos p
       WHERE p.cupon_codigo = c.codigo AND p.estado <> 'cancelado'
     ) AS usos
     FROM (SELECT ${COLUMNAS}, creado_en FROM tienda_cupones) c
     ORDER BY c.creado_en DESC`
  );
  return rows.map(filaACupon);
}

// El cupón de ese código SOLO si está vigente ahora mismo; null si no
// existe, está desactivado, aún no empieza o ya venció.
export async function obtenerCuponVigente(codigo: string): Promise<Cupon | null> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT * FROM (SELECT ${COLUMNAS} FROM tienda_cupones) c
     WHERE c.codigo = $1 AND c.estado = 'vigente'`,
    [codigo]
  );
  return rows[0] ? filaACupon(rows[0]) : null;
}

export async function crearCupon(datos: {
  codigo: string;
  porcentaje: number;
  topeTotal: number;
  inicio: string | null;
  fin: string | null;
}): Promise<'creado' | 'codigo_repetido'> {
  await asegurarEsquema();
  const { rowCount } = await getPool().query(
    `INSERT INTO tienda_cupones (codigo, porcentaje, tope_total, inicio, fin)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (codigo) DO NOTHING`,
    [datos.codigo, datos.porcentaje, datos.topeTotal, datos.inicio, datos.fin]
  );
  return rowCount === 1 ? 'creado' : 'codigo_repetido';
}

export async function actualizarActivoCupon(id: number, activo: boolean): Promise<void> {
  await asegurarEsquema();
  await getPool().query(`UPDATE tienda_cupones SET activo = $2 WHERE id = $1`, [id, activo]);
}

export async function eliminarCupon(id: number): Promise<void> {
  await asegurarEsquema();
  await getPool().query(`DELETE FROM tienda_cupones WHERE id = $1`, [id]);
}
