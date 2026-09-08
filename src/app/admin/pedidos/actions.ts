'use server';

import { revalidatePath } from 'next/cache';
import { haySesion } from '@/lib/session';
import { actualizarEstadoPedido } from '@/lib/pedidos-db';
import { ESTADOS_PEDIDO, type EstadoPedido } from '@/lib/pedidos';

export type EstadoActualizarPedido = { error?: string; ok?: boolean } | undefined;

const VALORES_VALIDOS = new Set(ESTADOS_PEDIDO.map((e) => e.valor));

export async function actualizarEstado(
  _estado: EstadoActualizarPedido,
  formData: FormData
): Promise<EstadoActualizarPedido> {
  // Server Actions se tratan como endpoints públicos — nunca hay que
  // confiar en que la página que los llama ya esté protegida.
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const pedidoId = Number(formData.get('pedidoId'));
  const nuevoEstado = String(formData.get('estado'));

  if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
    return { error: 'Pedido inválido.' };
  }
  if (!VALORES_VALIDOS.has(nuevoEstado as EstadoPedido)) {
    return { error: 'Estado inválido.' };
  }

  try {
    await actualizarEstadoPedido(pedidoId, nuevoEstado as EstadoPedido);
  } catch {
    return { error: 'No se pudo actualizar el estado. Intenta de nuevo.' };
  }

  revalidatePath('/admin/pedidos');
  return { ok: true };
}
