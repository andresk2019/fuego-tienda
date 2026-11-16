// Promociones (banners, franja superior y descuentos) — otra tabla
// propia de la tienda, igual que tienda_resenas: vive en el mismo
// Postgres pero nunca toca las tablas de Contabilidad Lady (el precio
// real sigue siendo el de `inventario`; el descuento se calcula encima,
// al leerlo — nunca se escribe de vuelta).
import 'server-only';
import { cache } from 'react';
import { getPool } from './pool';
import type { Promocion } from './promociones';

let esquemaListo: Promise<void> | undefined;

function asegurarEsquema(): Promise<void> {
  if (!esquemaListo) {
    esquemaListo = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS tienda_promociones (
           id SERIAL PRIMARY KEY,
           titulo TEXT NOT NULL,
           texto TEXT NOT NULL DEFAULT '',
           imagen_url TEXT,
           enlace TEXT,
           inicio DATE,
           fin DATE,
           activa BOOLEAN NOT NULL DEFAULT true,
           en_franja BOOLEAN NOT NULL DEFAULT true,
           en_portada BOOLEAN NOT NULL DEFAULT true,
           creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         ALTER TABLE tienda_promociones ADD COLUMN IF NOT EXISTS descuento_porcentaje INTEGER;
         ALTER TABLE tienda_promociones ADD COLUMN IF NOT EXISTS productos_excluidos INTEGER[] NOT NULL DEFAULT '{}';`
      )
      .then(() => undefined);
  }
  return esquemaListo;
}

// "Hoy" siempre es el día calendario de Colombia, no el del servidor
// (que corre en UTC): si no, una promo que termina "el 30" se
// apagaría a las 7 pm del 29 hora local. La fecha de fin es inclusiva
// (la promo se ve todo ese día).
const HOY = `(now() AT TIME ZONE 'America/Bogota')::date`;

const COLUMNAS = `
  id, titulo, texto, imagen_url, enlace,
  to_char(inicio, 'YYYY-MM-DD') AS inicio,
  to_char(fin, 'YYYY-MM-DD') AS fin,
  activa, en_franja, en_portada,
  descuento_porcentaje, productos_excluidos,
  CASE
    WHEN NOT activa THEN 'desactivada'
    WHEN inicio IS NOT NULL AND inicio > ${HOY} THEN 'programada'
    WHEN fin IS NOT NULL AND fin < ${HOY} THEN 'vencida'
    ELSE 'vigente'
  END AS estado`;

function filaAPromocion(r: {
  id: number;
  titulo: string;
  texto: string;
  imagen_url: string | null;
  enlace: string | null;
  inicio: string | null;
  fin: string | null;
  activa: boolean;
  en_franja: boolean;
  en_portada: boolean;
  descuento_porcentaje: number | null;
  productos_excluidos: number[];
  estado: Promocion['estado'];
}): Promocion {
  return {
    id: r.id,
    titulo: r.titulo,
    texto: r.texto,
    imagenUrl: r.imagen_url,
    enlace: r.enlace,
    inicio: r.inicio,
    fin: r.fin,
    activa: r.activa,
    enFranja: r.en_franja,
    enPortada: r.en_portada,
    descuentoPorcentaje: r.descuento_porcentaje,
    productosExcluidos: r.productos_excluidos,
    estado: r.estado,
  };
}

// Para el panel de administración — todas, con su estado.
export async function obtenerPromociones(): Promise<Promocion[]> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    `SELECT ${COLUMNAS} FROM tienda_promociones ORDER BY creado_en DESC`
  );
  return rows.map(filaAPromocion);
}

// Las promos vigentes (más reciente primero). De acá salen la franja,
// los banners y los descuentos — una sola consulta por petición
// (`cache`), porque el layout, la página y el catálogo la piden a la
// vez.
export const obtenerPromocionesVigentes = cache(
  async (): Promise<Promocion[]> => {
    await asegurarEsquema();
    const { rows } = await getPool().query(
      `SELECT * FROM (SELECT ${COLUMNAS}, creado_en FROM tienda_promociones) p
       WHERE estado = 'vigente'
       ORDER BY creado_en DESC`
    );
    return rows.map(filaAPromocion);
  }
);

// La franja superior solo muestra UNA promo (la vigente más reciente):
// es una línea de texto, no cabe más de una.
export async function obtenerPromocionFranja(): Promise<Promocion | null> {
  const vigentes = await obtenerPromocionesVigentes();
  return vigentes.find((p) => p.enFranja) ?? null;
}

export async function obtenerPromocionesPortada(): Promise<Promocion[]> {
  const vigentes = await obtenerPromocionesVigentes();
  return vigentes.filter((p) => p.enPortada);
}

export async function crearPromocion(datos: {
  titulo: string;
  texto: string;
  imagenUrl: string | null;
  enlace: string | null;
  inicio: string | null;
  fin: string | null;
  enFranja: boolean;
  enPortada: boolean;
  descuentoPorcentaje: number | null;
  productosExcluidos: number[];
}): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_promociones
       (titulo, texto, imagen_url, enlace, inicio, fin, en_franja, en_portada,
        descuento_porcentaje, productos_excluidos)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      datos.titulo,
      datos.texto,
      datos.imagenUrl,
      datos.enlace,
      datos.inicio,
      datos.fin,
      datos.enFranja,
      datos.enPortada,
      datos.descuentoPorcentaje,
      datos.productosExcluidos,
    ]
  );
}

export async function actualizarActivaPromocion(
  id: number,
  activa: boolean
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `UPDATE tienda_promociones SET activa = $2 WHERE id = $1`,
    [id, activa]
  );
}

export async function eliminarPromocion(id: number): Promise<void> {
  await asegurarEsquema();
  await getPool().query(`DELETE FROM tienda_promociones WHERE id = $1`, [id]);
}
