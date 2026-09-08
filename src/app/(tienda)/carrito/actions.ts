'use server';

import { crearPedido } from '@/lib/pedidos-db';
import type { ItemPedido } from '@/lib/pedidos';

export type ResultadoCrearPedido = { error?: string; numero?: string };

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

  try {
    const { numero } = await crearPedido({
      clienteNombre,
      clienteTelefono,
      items: datos.items,
      total: datos.total,
    });
    return { numero };
  } catch {
    return { error: 'No se pudo registrar el pedido.' };
  }
}
