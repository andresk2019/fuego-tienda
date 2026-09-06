// Capa de acceso a datos (Data Access Layer) de la tienda Fuego.
//
// Esta tienda NUNCA escribe en el inventario — el único lugar que
// descuenta stock sigue siendo Contabilidad Lady (ver
// `C:\Contabilidad Lady\api\clientes.js`, que resta `cantidad` al
// registrar una venta a un cliente). Aquí solo leemos, para mostrar
// el catálogo público de la marca Fuego.
//
// `import 'server-only'` evita que este módulo (y por lo tanto la
// cadena de conexión a la base de datos) pueda terminar incluido por
// error en el bundle que se manda al navegador.
import 'server-only';
import { Pool } from 'pg';

let pool: Pool | undefined;

function getPool(): Pool {
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

// DTO (Data Transfer Object): solo los campos seguros para mostrar en
// público. A propósito NO incluye `costo_unitario` (margen/costo
// interno) ni la cantidad exacta en stock (dato operativo interno) —
// solo si hay disponibilidad y si quedan pocas unidades, para poder
// mostrar algo como "¡Últimas unidades!" sin revelar el número real.
export type ProductoCatalogo = {
  id: number;
  nombre: string;
  precioVenta: number;
  unidad: string | null;
  disponible: boolean;
  pocasUnidades: boolean;
};

export async function obtenerCatalogoFuego(): Promise<ProductoCatalogo[]> {
  const { rows } = await getPool().query(
    `SELECT i.id, i.nombre, i.precio_venta, i.unidad, i.cantidad, i.stock_minimo
     FROM inventario i
     JOIN empresas e ON e.id = i.empresa_id
     WHERE e.nombre = 'Fuego' AND i.es_informativo = false
     ORDER BY i.nombre`
  );

  return rows.map((r) => {
    const cantidad = Number(r.cantidad);
    const stockMinimo = Number(r.stock_minimo);
    return {
      id: r.id,
      nombre: r.nombre,
      precioVenta: Number(r.precio_venta),
      unidad: r.unidad,
      disponible: cantidad > 0,
      pocasUnidades: cantidad > 0 && cantidad <= stockMinimo,
    };
  });
}
