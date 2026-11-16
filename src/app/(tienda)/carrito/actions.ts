'use server';

import {
  obtenerCatalogoFuego,
  validarStockCarrito,
  obtenerPreciosReales,
  type ProblemaStock,
} from '@/lib/db';
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

export type ResultadoCrearPedido = {
  error?: string;
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
  const [problemasStock, preciosReales] = await Promise.all([
    validarStockCarrito(itemsParaValidar),
    obtenerPreciosReales(itemsParaValidar.map((item) => item.productoId)),
  ]);
  if (problemasStock.length > 0) {
    return { problemasStock };
  }

  // El pedido guarda el precio real de cada línea, no el que haya
  // mandado el navegador: si la promo cambió mientras el cliente tenía
  // el carrito abierto, lo registrado y el total siempre coinciden.
  const itemsConPrecioReal = datos.items.map((item) => ({
    ...item,
    precioUnitario: preciosReales.get(item.productoId) ?? 0,
  }));
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
  const costoBase =
    zonaEnvio === 'medellin' ? configEnvio.costoLocal : configEnvio.costoNacional;
  const costoEnvio = subtotalReal >= configEnvio.gratisDesde ? 0 : costoBase;
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
    });
    return { numero, costoEnvio, total };
  } catch {
    // A diferencia de la validación de stock, esto sí es un problema
    // técnico nuestro (ej. la base de datos no respondió) — no se le
    // niega el pedido al cliente por eso, ver CarritoPage.
    return { error: 'No se pudo registrar el pedido.' };
  }
}
