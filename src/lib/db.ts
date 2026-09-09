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

export type ProblemaStock = {
  productoId: number;
  nombre: string;
  cantidadDisponible: number;
  cantidadPedida: number;
};

// Se llama justo antes de registrar un pedido (ver
// (tienda)/carrito/actions.ts) — el catálogo se carga una sola vez al
// entrar a la tienda, pero el stock puede cambiar en cualquier
// momento por una venta de mostrador en Contabilidad Lady mientras el
// cliente arma su carrito. Sin esto, dos personas podrían "pedir" la
// última unidad de algo casi al mismo tiempo sin que nadie se entere
// hasta después. Devuelve solo los ítems que YA NO alcanzan; un
// arreglo vacío significa que todo el carrito sigue disponible.
export async function validarStockCarrito(
  items: { productoId: number; cantidad: number }[]
): Promise<ProblemaStock[]> {
  if (items.length === 0) return [];

  const { rows } = await getPool().query(
    `SELECT i.id, i.nombre, i.cantidad
     FROM inventario i
     JOIN empresas e ON e.id = i.empresa_id
     WHERE e.nombre = 'Fuego' AND i.es_informativo = false
       AND i.id = ANY($1::int[])`,
    [items.map((item) => item.productoId)]
  );

  const stockReal = new Map(
    rows.map((r) => [
      r.id as number,
      { nombre: r.nombre as string, cantidad: Number(r.cantidad) },
    ])
  );

  const problemas: ProblemaStock[] = [];
  for (const item of items) {
    // Si el id ni siquiera aparece (producto borrado, o de otra marca)
    // se trata como 0 disponibles — nunca como "no importa".
    const real = stockReal.get(item.productoId);
    const cantidadDisponible = real?.cantidad ?? 0;
    if (cantidadDisponible < item.cantidad) {
      problemas.push({
        productoId: item.productoId,
        nombre: real?.nombre ?? `Producto #${item.productoId}`,
        cantidadDisponible,
        cantidadPedida: item.cantidad,
      });
    }
  }
  return problemas;
}
