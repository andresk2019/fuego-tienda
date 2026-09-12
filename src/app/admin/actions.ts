'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eliminarSesion, haySesion } from '@/lib/session';
import {
  subirFotoAStorage,
  subirFotoGaleriaAStorage,
  subirLogoAStorage,
} from '@/lib/storage';
import {
  guardarFotoProducto,
  guardarDescripcionProducto,
  guardarLogoUrl,
  guardarDestacadoProducto,
  guardarNumeroWhatsApp,
  agregarFotoGaleria,
  eliminarFotoGaleria,
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

export type EstadoLogo = { error?: string; ok?: boolean } | undefined;

export async function subirLogo(
  _estado: EstadoLogo,
  formData: FormData
): Promise<EstadoLogo> {
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const archivo = formData.get('logo');

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
    const url = await subirLogoAStorage(archivo);
    await guardarLogoUrl(url);
  } catch {
    return { error: 'No se pudo subir el logo. Intenta de nuevo.' };
  }

  revalidatePath('/admin');
  revalidatePath('/');

  return { ok: true };
}

export type EstadoWhatsApp = { error?: string; ok?: boolean } | undefined;

export async function guardarWhatsApp(
  _estado: EstadoWhatsApp,
  formData: FormData
): Promise<EstadoWhatsApp> {
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const numero = String(formData.get('numero') ?? '').trim();

  // Solo dígitos, con el código de país incluido (ej. 573001234567) —
  // es justo el formato que espera el link de wa.me.
  if (!/^\d{10,15}$/.test(numero)) {
    return {
      error:
        'Escribe el número con el código de país, solo números (ej. 573001234567).',
    };
  }

  try {
    await guardarNumeroWhatsApp(numero);
  } catch {
    return { error: 'No se pudo guardar. Intenta de nuevo.' };
  }

  revalidatePath('/admin');
  revalidatePath('/carrito');

  return { ok: true };
}

export type EstadoFotoGaleria = { error?: string; ok?: boolean } | undefined;

// A diferencia de subir la foto principal (que siempre reemplaza a la
// anterior), esto AGREGA una foto más a la galería del producto —
// cualquier producto, no solo los personalizables (decisión del
// dueño, 2026-09-11).
export async function agregarFotoGaleriaProducto(
  _estado: EstadoFotoGaleria,
  formData: FormData
): Promise<EstadoFotoGaleria> {
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
    const url = await subirFotoGaleriaAStorage(productoId, archivo);
    await agregarFotoGaleria(productoId, url);
  } catch {
    return { error: 'No se pudo subir la imagen. Intenta de nuevo.' };
  }

  revalidatePath('/admin');
  revalidatePath(`/productos/${productoId}`);

  return { ok: true };
}

export async function quitarFotoGaleriaProducto(
  _estado: EstadoFotoGaleria,
  formData: FormData
): Promise<EstadoFotoGaleria> {
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const productoId = Number(formData.get('productoId'));
  const id = Number(formData.get('id'));

  if (!Number.isInteger(productoId) || productoId <= 0) {
    return { error: 'Producto inválido.' };
  }
  if (!Number.isInteger(id) || id <= 0) {
    return { error: 'Foto inválida.' };
  }

  try {
    await eliminarFotoGaleria(id, productoId);
  } catch {
    return { error: 'No se pudo quitar la foto. Intenta de nuevo.' };
  }

  revalidatePath('/admin');
  revalidatePath(`/productos/${productoId}`);

  return { ok: true };
}

export type EstadoDestacado = { error?: string; ok?: boolean } | undefined;

export async function guardarDestacado(
  _estado: EstadoDestacado,
  formData: FormData
): Promise<EstadoDestacado> {
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const productoId = Number(formData.get('productoId'));
  const destacado = formData.get('destacado') === 'on';

  if (!Number.isInteger(productoId) || productoId <= 0) {
    return { error: 'Producto inválido.' };
  }

  try {
    await guardarDestacadoProducto(productoId, destacado);
  } catch {
    return { error: 'No se pudo guardar. Intenta de nuevo.' };
  }

  revalidatePath('/admin');
  revalidatePath('/');

  return { ok: true };
}
