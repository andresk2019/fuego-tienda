'use server';

import { validarStockCarrito, type ProblemaStock } from '@/lib/db';
import { crearPedido } from '@/lib/pedidos-db';
import { obtenerConfigEnvio } from '@/lib/admin-db';
import type { ItemPedido } from '@/lib/pedidos';

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
  clienteDireccion: string;
  aceptaTratamientoDatos: boolean;
  items: ItemPedido[];
  // Solo la suma de los productos — el envío se calcula acá abajo con
  // la tarifa configurada en /admin, nunca confiando en un valor que
  // mande el navegador (un Server Action es un endpoint público).
  subtotalProductos: number;
}): Promise<ResultadoCrearPedido> {
  const clienteNombre = datos.clienteNombre.trim();
  const clienteTelefono = datos.clienteTelefono.trim();
  const clienteDireccion = datos.clienteDireccion.trim();

  if (!clienteNombre) return { error: 'Escribe tu nombre.' };
  if (!clienteTelefono) return { error: 'Escribe tu número de WhatsApp.' };
  if (!clienteDireccion) return { error: 'Escribe tu dirección de entrega.' };
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
  const problemasStock = await validarStockCarrito(
    datos.items.map((item) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
    }))
  );
  if (problemasStock.length > 0) {
    return { problemasStock };
  }

  // El envío se calcula acá, con la tarifa vigente en /admin — así no
  // importa cuánto haya calculado (o manipulado) el navegador, el
  // costo real siempre sale de la misma fuente que ve el dueño.
  const configEnvio = await obtenerConfigEnvio();
  const costoEnvio =
    datos.subtotalProductos >= configEnvio.gratisDesde ? 0 : configEnvio.costo;
  const total = datos.subtotalProductos + costoEnvio;

  try {
    const { numero } = await crearPedido({
      clienteNombre,
      clienteTelefono,
      clienteDireccion,
      items: datos.items,
      total,
      costoEnvio,
    });
    return { numero, costoEnvio, total };
  } catch {
    // A diferencia de la validación de stock, esto sí es un problema
    // técnico nuestro (ej. la base de datos no respondió) — no se le
    // niega el pedido al cliente por eso, ver CarritoPage.
    return { error: 'No se pudo registrar el pedido.' };
  }
}
