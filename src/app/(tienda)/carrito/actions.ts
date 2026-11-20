'use server';

import {
  obtenerCatalogoFuego,
  validarStockCarrito,
  obtenerPreciosConCupon,
  type ProblemaStock,
} from '@/lib/db';
import { obtenerCuponVigente } from '@/lib/cupones-db';
import { codigoValido, normalizarCodigo } from '@/lib/cupones';
import { crearPedido } from '@/lib/pedidos-db';
import { obtenerConfigEnvio } from '@/lib/admin-db';
import { determinarZonaEnvio, type ItemPedido } from '@/lib/pedidos';
import { UBICACIONES_COLOMBIA } from '@/lib/colombia-ubicaciones';

// El carrito guarda foto y precio de cada producto "congelados" en el
// momento en que se agrega (ver ItemCarrito en lib/carrito.ts), porque
// vive en localStorage y no puede consultar la base de datos por su
// cuenta. Si el dueño cambia la foto, o empieza/termina una promo con
// descuento DESPUÉS de que un cliente ya agregó ese producto, el carrito
// se queda con lo viejo hasta que algo lo actualice — ver
// CarritoContext.tsx, que llama esto al cargar el carrito guardado. (El
// precio que de verdad se cobra siempre se recalcula en el servidor al
// registrar el pedido; esto es para que lo que el cliente ve coincida.)
export type DatosVigentesProducto = {
  fotoUrl: string | null;
  precioUnitario: number;
  precioOriginal: number | null;
};

export async function obtenerDatosVigentesProductos(): Promise<
  Record<number, DatosVigentesProducto>
> {
  const productos = await obtenerCatalogoFuego();
  return Object.fromEntries(
    productos.map((p) => [
      p.id,
      {
        fotoUrl: p.fotoUrl,
        precioUnitario: p.precioVenta,
        precioOriginal: p.precioOriginal,
      },
    ])
  );
}

export type ResultadoCupon =
  | { error: string }
  | {
      codigo: string;
      porcentaje: number;
      topeTotal: number;
      // Precio con el cupón de cada producto del carrito al que SÍ le
      // aplica (los demás no aparecen: se quedan con su precio actual).
      precios: Record<number, { precioUnitario: number; precioOriginal: number | null }>;
    };

const MENSAJE_CUPON_INVALIDO =
  'Ese cupón no existe o ya no está vigente. Revisa que esté bien escrito.';

// El cliente escribe su código en el carrito: acá se valida (existe,
// está vigente) y se calcula, con los precios y descuentos REALES de
// este momento, cuánto queda cada producto. Es solo para mostrar: al
// registrar el pedido se vuelve a calcular todo (ver
// crearPedidoDesdeCarrito). Un Server Action es un endpoint público,
// así que el código se valida antes de tocar la base de datos.
export async function aplicarCupon(
  codigoCrudo: string,
  productoIds: number[]
): Promise<ResultadoCupon> {
  const codigo = normalizarCodigo(String(codigoCrudo ?? ''));
  if (!codigo) return { error: 'Escribe tu cupón.' };
  if (!codigoValido(codigo)) return { error: MENSAJE_CUPON_INVALIDO };
  const ids = [...new Set((productoIds ?? []).map(Number))].filter(
    (id) => Number.isInteger(id) && id > 0
  ).slice(0, 100);

  const cupon = await obtenerCuponVigente(codigo);
  if (!cupon) return { error: MENSAJE_CUPON_INVALIDO };

  const detalle = await obtenerPreciosConCupon(ids, cupon);
  const precios: Record<number, { precioUnitario: number; precioOriginal: number | null }> = {};
  for (const [id, d] of detalle) {
    if (d.ahorroCupon > 0) {
      precios[id] = { precioUnitario: d.precioUnitario, precioOriginal: d.precioOriginal };
    }
  }
  if (ids.length > 0 && Object.keys(precios).length === 0) {
    return {
      error: `El cupón ${cupon.codigo} no aplica a los productos de tu carrito: ya tienen el descuento máximo (${cupon.topeTotal}%).`,
    };
  }
  return { codigo: cupon.codigo, porcentaje: cupon.porcentaje, topeTotal: cupon.topeTotal, precios };
}

export type ResultadoCrearPedido = {
  error?: string;
  // El cupón aplicado ya no vale (venció, se desactivó…): el carrito
  // debe quitarlo y avisar, NO seguir a WhatsApp con otro precio.
  cuponInvalido?: boolean;
  numero?: string;
  problemasStock?: ProblemaStock[];
  // Vienen del cálculo hecho acá (ver más abajo), para que el mensaje
  // de WhatsApp muestre el costo de envío real que quedó registrado
  // en el pedido, no uno calculado aparte en el navegador.
  costoEnvio?: number;
  total?: number;
};

// Este Server Action se llama directo desde el cliente (no desde un
// <form action>) justo antes de abrir WhatsApp — ver
// CarritoPage.manejarContinuar(). No requiere sesión: cualquier
// visitante de la tienda puede registrar un pedido, es la versión
// pública equivalente a lo que hoy solo pasa por el chat.
export async function crearPedidoDesdeCarrito(datos: {
  clienteNombre: string;
  clienteTelefono: string;
  clienteDepartamento: string;
  clienteMunicipio: string;
  aceptaTratamientoDatos: boolean;
  items: ItemPedido[];
  // Código de cupón que el cliente aplicó en el carrito (opcional).
  codigoCupon?: string | null;
}): Promise<ResultadoCrearPedido> {
  const clienteNombre = datos.clienteNombre.trim();
  const clienteTelefono = datos.clienteTelefono.trim();
  const clienteDepartamento = datos.clienteDepartamento.trim();
  const clienteMunicipio = datos.clienteMunicipio.trim();

  if (!clienteNombre) return { error: 'Escribe tu nombre.' };
  if (!clienteTelefono) return { error: 'Escribe tu número de WhatsApp.' };
  // Se valida contra la lista real de departamentos/municipios (no
  // solo que no vengan vacíos) — la zona de envío sale de este par,
  // así que no puede ser cualquier texto que mande el navegador (un
  // Server Action es un endpoint público).
  const departamentoValido = UBICACIONES_COLOMBIA.find(
    (d) => d.departamento === clienteDepartamento
  );
  if (
    !departamentoValido ||
    !departamentoValido.municipios.includes(clienteMunicipio)
  ) {
    return { error: 'Selecciona el departamento y el municipio de entrega.' };
  }
  // Igual que los campos de arriba: el checkbox del navegador ya lo
  // exige, pero un Server Action se trata como endpoint público —
  // nunca hay que confiar solo en que el formulario lo haya validado.
  if (!datos.aceptaTratamientoDatos) {
    return {
      error: 'Acepta la política de tratamiento de datos para continuar.',
    };
  }
  if (!datos.items || datos.items.length === 0) {
    return { error: 'Tu carrito está vacío.' };
  }

  // Esta validación SÍ debe bloquear (a diferencia de si falla el
  // registro del pedido más abajo): pedir algo que ya no existe es un
  // problema real para el cliente, no un detalle técnico nuestro — se
  // le avisa en el carrito para que ajuste cantidades, en vez de
  // dejarlo llegar a WhatsApp a pedir algo que no se le puede cumplir.
  //
  // Los precios se leen en paralelo, con el precio real del catálogo
  // y el descuento vigente ahora mismo — nunca con lo que sume el
  // navegador (ver obtenerPreciosReales en db.ts). Antes este Server
  // Action recibía `subtotalProductos` directo del cliente y lo daba
  // por bueno: cualquiera podía llamarlo con un total inventado.
  const itemsParaValidar = datos.items.map((item) => ({
    productoId: item.productoId,
    cantidad: item.cantidad,
  }));
  // El cupón se vuelve a validar AQUÍ (nunca se confía en lo que el
  // navegador diga que aplicó): si ya venció o se desactivó mientras
  // el cliente armaba el carrito, se le avisa en vez de cobrarle
  // otro precio sin que se entere.
  let cupon = null;
  const codigoCupon = normalizarCodigo(datos.codigoCupon ?? '');
  if (codigoCupon) {
    cupon = codigoValido(codigoCupon) ? await obtenerCuponVigente(codigoCupon) : null;
    if (!cupon) {
      return {
        error: `El cupón ${codigoCupon} ya no está vigente, así que el precio cambió. Revisa tu carrito.`,
        cuponInvalido: true,
      };
    }
  }
  const [problemasStock, preciosReales] = await Promise.all([
    validarStockCarrito(itemsParaValidar),
    obtenerPreciosConCupon(itemsParaValidar.map((item) => item.productoId), cupon),
  ]);
  if (problemasStock.length > 0) {
    return { problemasStock };
  }

  // El pedido guarda el precio real de cada línea, no el que haya
  // mandado el navegador: si la promo cambió mientras el cliente tenía
  // el carrito abierto, lo registrado y el total siempre coinciden.
  const itemsConPrecioReal = datos.items.map((item) => ({
    ...item,
    precioUnitario: preciosReales.get(item.productoId)?.precioUnitario ?? 0,
  }));
  // Cuánto se ahorró el cliente por el cupón en todo el pedido (0 si
  // el cupón no le aplicó a ningún producto).
  const descuentoCupon = datos.items.reduce(
    (suma, item) =>
      suma + (preciosReales.get(item.productoId)?.ahorroCupon ?? 0) * item.cantidad,
    0
  );
  const subtotalReal = itemsConPrecioReal.reduce(
    (suma, item) => suma + item.precioUnitario * item.cantidad,
    0
  );

  // La zona de envío se calcula acá, a partir del departamento y
  // municipio ya validados arriba — nunca se recibe directo del
  // navegador, así el cliente no puede elegir "Medellín" con
  // cualquier dirección para pagar la tarifa más barata.
  const zonaEnvio = determinarZonaEnvio(clienteDepartamento, clienteMunicipio);

  // El envío se calcula acá, con la tarifa vigente en /admin — así no
  // importa cuánto haya calculado (o manipulado) el navegador, el
  // costo real siempre sale de la misma fuente que ve el dueño.
  const configEnvio = await obtenerConfigEnvio();
  // Sin envío gratis por monto de compra (decisión del dueño,
  // 2026-11-16): siempre se cobra la tarifa de la zona.
  const costoEnvio =
    zonaEnvio === 'medellin' ? configEnvio.costoLocal : configEnvio.costoNacional;
  const total = subtotalReal + costoEnvio;

  try {
    const { numero } = await crearPedido({
      clienteNombre,
      clienteTelefono,
      // Ya no se pide en el formulario (decisión del dueño,
      // 2026-09-16) — la columna se deja vacía en vez de quitarla de
      // la tabla, igual que quedaron vacíos los pedidos de ANTES de
      // que este campo existiera (ver comentario en pedidos.ts).
      clienteDireccion: '',
      clienteDepartamento,
      clienteMunicipio,
      items: itemsConPrecioReal,
      total,
      costoEnvio,
      zonaEnvio,
      cuponCodigo: cupon && descuentoCupon > 0 ? cupon.codigo : null,
      descuentoCupon: cupon && descuentoCupon > 0 ? descuentoCupon : null,
    });
    return { numero, costoEnvio, total };
  } catch {
    // A diferencia de la validación de stock, esto sí es un problema
    // técnico nuestro (ej. la base de datos no respondió) — no se le
    // niega el pedido al cliente por eso, ver CarritoPage.
    return { error: 'No se pudo registrar el pedido.' };
  }
}
