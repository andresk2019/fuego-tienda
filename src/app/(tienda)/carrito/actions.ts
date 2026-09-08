'use server';

import { validarStockCarrito, type ProblemaStock } from '@/lib/db';
import { crearPedido } from '@/lib/pedidos-db';
import type { ItemPedido } from '@/lib/pedidos';

export type ResultadoCrearPedido = {
  error?: string;
  numero?: string;
  problemasStock?: ProblemaStock[];
};

// Este Server Action se llama directo desde el cliente (no desde un
// <form action>) justo antes de abrir WhatsApp — ver
// CarritoPage.manejarContinuar(). No requiere sesión: cualquier
// visitante de la tienda puede registrar un pedido, es la versión
// pública equivalente a lo que hoy solo pasa por el chat.
export async function crearPedidoDesdeCarrito(datos: {
  clienteNombre: string;
  clienteTelefono: string;
  items: ItemPedido[];
  total: number;
}): Promise<ResultadoCrearPedido> {
  const clienteNombre = datos.clienteNombre.trim();
  const clienteTelefono = datos.clienteTelefono.trim();

  if (!clienteNombre) return { error: 'Escribe tu nombre.' };
  if (!clienteTelefono) return { error: 'Escribe tu número de WhatsApp.' };
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

  try {
    const { numero } = await crearPedido({
      clienteNombre,
      clienteTelefono,
      items: datos.items,
      total: datos.total,
    });
    return { numero };
  } catch {
    // A diferencia de la validación de stock, esto sí es un problema
    // técnico nuestro (ej. la base de datos no respondió) — no se le
    // niega el pedido al cliente por eso, ver CarritoPage.
    return { error: 'No se pudo registrar el pedido.' };
  }
}
