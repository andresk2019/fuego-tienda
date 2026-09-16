'use server';

import { validarStockCarrito, calcularSubtotalReal, type ProblemaStock } from '@/lib/db';
import { crearPedido } from '@/lib/pedidos-db';
import { obtenerConfigEnvio } from '@/lib/admin-db';
import { determinarZonaEnvio, type ItemPedido } from '@/lib/pedidos';
import { UBICACIONES_COLOMBIA } from '@/lib/colombia-ubicaciones';

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
  // El subtotal se calcula en paralelo, con el precio real del
  // catálogo — nunca con lo que sume el navegador (ver comentario de
  // calcularSubtotalReal en db.ts). Antes este Server Action recibía
  // `subtotalProductos` directo del cliente y lo daba por bueno:
  // cualquiera podía llamarlo con un total inventado.
  const itemsParaValidar = datos.items.map((item) => ({
    productoId: item.productoId,
    cantidad: item.cantidad,
  }));
  const [problemasStock, subtotalReal] = await Promise.all([
    validarStockCarrito(itemsParaValidar),
    calcularSubtotalReal(itemsParaValidar),
  ]);
  if (problemasStock.length > 0) {
    return { problemasStock };
  }

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
      items: datos.items,
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
