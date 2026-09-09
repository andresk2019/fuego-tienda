'use server';

import { revalidatePath } from 'next/cache';
import { haySesion } from '@/lib/session';
import {
  crearResena,
  actualizarVisibilidadResena,
  eliminarResena,
} from '@/lib/resenas-db';
import { CALIFICACION_MAXIMA } from '@/lib/resenas';

export type EstadoCrearResena = { error?: string; ok?: boolean } | undefined;

export async function agregarResena(
  _estado: EstadoCrearResena,
  formData: FormData
): Promise<EstadoCrearResena> {
  // Server Actions se tratan como endpoints públicos — nunca hay que
  // confiar en que la página que los llama ya esté protegida.
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const clienteNombre = String(formData.get('clienteNombre') ?? '').trim();
  const texto = String(formData.get('texto') ?? '').trim();
  const calificacion = Number(formData.get('calificacion'));

  if (!clienteNombre) return { error: 'Escribe el nombre del cliente.' };
  if (!texto) return { error: 'Escribe el texto de la reseña.' };
  if (
    !Number.isInteger(calificacion) ||
    calificacion < 1 ||
    calificacion > CALIFICACION_MAXIMA
  ) {
    return { error: 'Calificación inválida.' };
  }

  try {
    await crearResena({ clienteNombre, texto, calificacion });
  } catch {
    return { error: 'No se pudo guardar la reseña. Intenta de nuevo.' };
  }

  revalidatePath('/admin/resenas');
  revalidatePath('/');
  return { ok: true };
}

export type EstadoActualizarResena = { error?: string; ok?: boolean } | undefined;

export async function actualizarVisibilidad(
  _estado: EstadoActualizarResena,
  formData: FormData
): Promise<EstadoActualizarResena> {
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const resenaId = Number(formData.get('resenaId'));
  const visible = formData.get('visible') === 'on';

  if (!Number.isInteger(resenaId) || resenaId <= 0) {
    return { error: 'Reseña inválida.' };
  }

  try {
    await actualizarVisibilidadResena(resenaId, visible);
  } catch {
    return { error: 'No se pudo actualizar. Intenta de nuevo.' };
  }

  revalidatePath('/admin/resenas');
  revalidatePath('/');
  return { ok: true };
}

export async function borrarResena(formData: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const resenaId = Number(formData.get('resenaId'));
  if (!Number.isInteger(resenaId) || resenaId <= 0) return;

  await eliminarResena(resenaId);
  revalidatePath('/admin/resenas');
  revalidatePath('/');
}
