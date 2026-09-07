'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eliminarSesion, haySesion } from '@/lib/session';
import { subirFotoAStorage } from '@/lib/storage';
import {
  guardarFotoProducto,
  guardarDescripcionProducto,
} from '@/lib/admin-db';

export async function cerrarSesion() {
  await eliminarSesion();
  redirect('/admin/login');
}

export type EstadoSubidaFoto = { error?: string; ok?: boolean } | undefined;

const LIMITE_MB = 5;

export async function subirFotoProducto(
  _estado: EstadoSubidaFoto,
  formData: FormData
): Promise<EstadoSubidaFoto> {
  // Los Server Actions se tratan como endpoints públicos — nunca hay
  // que confiar en que la página que los llama ya esté protegida.
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const productoId = Number(formData.get('productoId'));
  const archivo = formData.get('foto');

  if (!Number.isInteger(productoId) || productoId <= 0) {
    return { error: 'Producto inválido.' };
  }
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: 'Selecciona una imagen.' };
  }
  if (!archivo.type.startsWith('image/')) {
    return { error: 'El archivo debe ser una imagen.' };
  }
  if (archivo.size > LIMITE_MB * 1024 * 1024) {
    return { error: `La imagen no puede pesar más de ${LIMITE_MB}MB.` };
  }

  try {
    const url = await subirFotoAStorage(productoId, archivo);
    await guardarFotoProducto(productoId, url);
  } catch {
    return { error: 'No se pudo subir la imagen. Intenta de nuevo.' };
  }

  // El catálogo, el detalle del producto y el panel muestran la foto
  // nueva de inmediato (aunque el catálogo/detalle ya son
  // force-dynamic, esto no sobra).
  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/productos/${productoId}`);

  return { ok: true };
}

export type EstadoDescripcion = { error?: string; ok?: boolean } | undefined;

export async function guardarDescripcion(
  _estado: EstadoDescripcion,
  formData: FormData
): Promise<EstadoDescripcion> {
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const productoId = Number(formData.get('productoId'));
  const descripcion = String(formData.get('descripcion') ?? '');

  if (!Number.isInteger(productoId) || productoId <= 0) {
    return { error: 'Producto inválido.' };
  }

  try {
    await guardarDescripcionProducto(productoId, descripcion);
  } catch {
    return { error: 'No se pudo guardar la descripción. Intenta de nuevo.' };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/productos/${productoId}`);

  return { ok: true };
}
