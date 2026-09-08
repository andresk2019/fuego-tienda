// Capa de acceso a datos (Data Access Layer) de la tienda Fuego.
//
// Esta tienda NUNCA escribe en el inventario — el único lugar que
// descuenta stock sigue siendo Contabilidad Lady (ver
// `C:\Contabilidad Lady\api\clientes.js`, que resta `cantidad` al
// registrar una venta a un cliente). Aquí solo leemos, para mostrar
// el catálogo público de la marca Fuego. La foto y la descripción de
// cada producto SÍ se leen de una tabla propia de la tienda
// (`admin-db.ts`), separada de las de Contabilidad Lady — ver ese
// archivo para el único lugar donde la tienda escribe algo.
//
// `import 'server-only'` evita que este módulo (y por lo tanto la
// cadena de conexión a la base de datos) pueda terminar incluido por
// error en el bundle que se manda al navegador.
import 'server-only';
import { getPool } from './pool';
import { categoriaDeProducto, type CategoriaSlug } from './categorias';
import { descripcionDeProducto } from './descripciones';
import { subcategoriaDeProducto, type SubcategoriaSlug } from './secciones';
import { obtenerMetaDeProductos, type MetaProductos } from './admin-db';

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
  categoria: CategoriaSlug;
  descripcion: string;
  subcategoria: SubcategoriaSlug;
  fotoUrl: string | null;
  destacado: boolean;
};

const CAMPOS_PRODUCTO = `i.id, i.nombre, i.precio_venta, i.unidad, i.cantidad, i.stock_minimo`;

function filaAProducto(
  r: {
    id: number;
    nombre: string;
    precio_venta: string | number;
    unidad: string | null;
    cantidad: string | number;
    stock_minimo: string | number;
  },
  meta: MetaProductos
): ProductoCatalogo {
  const cantidad = Number(r.cantidad);
  const stockMinimo = Number(r.stock_minimo);
  const categoria = categoriaDeProducto(r.id);
  // La descripción escrita desde el panel de administración tiene
  // prioridad; si no hay ninguna, se usa el texto genérico por
  // categoría (ver descripciones.ts).
  const descripcion = meta.descripciones[r.id] ?? descripcionDeProducto(r.id, categoria);
  return {
    id: r.id,
    nombre: r.nombre,
    precioVenta: Number(r.precio_venta),
    unidad: r.unidad,
    disponible: cantidad > 0,
    pocasUnidades: cantidad > 0 && cantidad <= stockMinimo,
    categoria,
    descripcion,
    subcategoria: subcategoriaDeProducto(r.id),
    fotoUrl: meta.fotos[r.id] ?? null,
    destacado: meta.destacados.has(r.id),
  };
}

export async function obtenerCatalogoFuego(): Promise<ProductoCatalogo[]> {
  const [resultado, meta] = await Promise.all([
    getPool().query(
      `SELECT ${CAMPOS_PRODUCTO}
       FROM inventario i
       JOIN empresas e ON e.id = i.empresa_id
       WHERE e.nombre = 'Fuego' AND i.es_informativo = false
       ORDER BY i.nombre`
    ),
    obtenerMetaDeProductos(),
  ]);

  return resultado.rows.map((r) => filaAProducto(r, meta));
}

// Para la página de detalle de un producto. Filtra también por
// empresa = Fuego (no solo por id) para que no se pueda llegar, con
// un id cualquiera en la URL, a un producto de otra marca (LadySoul,
// Suave Capricho) que esta tienda no debe mostrar.
export async function obtenerProductoFuego(
  id: number
): Promise<ProductoCatalogo | null> {
  // Trae la meta de todos los productos aunque solo haga falta uno —
  // son pocos productos hoy, no vale la pena una consulta separada
  // solo para eso.
  const [resultado, meta] = await Promise.all([
    getPool().query(
      `SELECT ${CAMPOS_PRODUCTO}
       FROM inventario i
       JOIN empresas e ON e.id = i.empresa_id
       WHERE e.nombre = 'Fuego' AND i.es_informativo = false AND i.id = $1`,
      [id]
    ),
    obtenerMetaDeProductos(),
  ]);

  return resultado.rows[0] ? filaAProducto(resultado.rows[0], meta) : null;
}

// Aromas disponibles para personalizar una vela. Los aromas no son un
// producto del catálogo (tabla `inventario`) sino un insumo interno
// (tabla `insumos`, con nombres tipo "Aroma Menta") — se listan solo
// los que tienen existencia (cantidad > 0), para no ofrecer un aroma
// agotado. Se les quita el prefijo "Aroma " para mostrarlos limpios.
export async function obtenerAromasDisponiblesFuego(): Promise<string[]> {
  const { rows } = await getPool().query(
    `SELECT ins.nombre
     FROM insumos ins
     JOIN empresas e ON e.id = ins.empresa_id
     WHERE e.nombre = 'Fuego' AND ins.nombre ILIKE 'Aroma %' AND ins.cantidad > 0
     ORDER BY ins.nombre`
  );

  return rows.map((r) => String(r.nombre).replace(/^Aroma\s+/i, ''));
}
