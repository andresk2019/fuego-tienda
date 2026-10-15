'use server';

import { revalidatePath } from 'next/cache';
import { haySesion } from '@/lib/session';
import {
  crearPromocion,
  actualizarActivaPromocion,
  eliminarPromocion,
} from '@/lib/promociones-db';
import { subirImagenPromocionAStorage } from '@/lib/storage';
import {
  enlaceValido,
  LONGITUD_MAXIMA_TITULO,
  LONGITUD_MAXIMA_TEXTO,
} from '@/lib/promociones';

export type EstadoCrearPromocion = { error?: string; ok?: boolean } | undefined;

const LIMITE_MB = 8;
const EXTENSION_POR_TIPO: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function revalidarTienda() {
  revalidatePath('/admin/promociones');
  revalidatePath('/', 'layout');
}

export async function agregarPromocion(
  _estado: EstadoCrearPromocion,
  formData: FormData
): Promise<EstadoCrearPromocion> {
  // Server Actions se tratan como endpoints públicos — nunca hay que
  // confiar en que la página que los llama ya esté protegida.
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const titulo = String(formData.get('titulo') ?? '').trim();
  const texto = String(formData.get('texto') ?? '').trim();
  const enlace = String(formData.get('enlace') ?? '').trim();
  const inicio = String(formData.get('inicio') ?? '').trim();
  const fin = String(formData.get('fin') ?? '').trim();
  const enFranja = formData.get('enFranja') === 'on';
  const enPortada = formData.get('enPortada') === 'on';
  const imagen = formData.get('imagen');

  if (!titulo) return { error: 'Escribe el título de la promoción.' };
  if (titulo.length > LONGITUD_MAXIMA_TITULO) {
    return { error: `El título puede tener máximo ${LONGITUD_MAXIMA_TITULO} caracteres.` };
  }
  if (texto.length > LONGITUD_MAXIMA_TEXTO) {
    return { error: `El texto puede tener máximo ${LONGITUD_MAXIMA_TEXTO} caracteres.` };
  }
  if (enlace && !enlaceValido(enlace)) {
    return {
      error: 'El enlace debe ser una ruta de la tienda (ej. /catalogo) o una dirección que empiece por https://.',
    };
  }
  if (inicio && !FORMATO_FECHA.test(inicio)) return { error: 'Fecha de inicio inválida.' };
  if (fin && !FORMATO_FECHA.test(fin)) return { error: 'Fecha de fin inválida.' };
  if (inicio && fin && fin < inicio) {
    return { error: 'La fecha de fin no puede ser antes de la de inicio.' };
  }
  if (!enFranja && !enPortada) {
    return { error: 'Elige dónde se muestra: franja superior, portada, o ambas.' };
  }

  let imagenUrl: string | null = null;
  if (imagen instanceof File && imagen.size > 0) {
    const extension = EXTENSION_POR_TIPO[imagen.type];
    if (!extension) {
      return { error: 'La imagen debe ser JPG, PNG, WebP o GIF.' };
    }
    if (imagen.size > LIMITE_MB * 1024 * 1024) {
      return { error: `La imagen no puede pesar más de ${LIMITE_MB}MB.` };
    }
    try {
      imagenUrl = await subirImagenPromocionAStorage(imagen, extension);
    } catch {
      return { error: 'No se pudo subir la imagen. Intenta de nuevo.' };
    }
  }

  try {
    await crearPromocion({
      titulo,
      texto,
      imagenUrl,
      enlace: enlace || null,
      inicio: inicio || null,
      fin: fin || null,
      enFranja,
      enPortada,
    });
  } catch {
    return { error: 'No se pudo guardar la promoción. Intenta de nuevo.' };
  }

  revalidarTienda();
  return { ok: true };
}

export type EstadoActualizarPromocion = { error?: string; ok?: boolean } | undefined;

export async function actualizarActiva(
  _estado: EstadoActualizarPromocion,
  formData: FormData
): Promise<EstadoActualizarPromocion> {
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const promocionId = Number(formData.get('promocionId'));
  const activa = formData.get('activa') === 'on';

  if (!Number.isInteger(promocionId) || promocionId <= 0) {
    return { error: 'Promoción inválida.' };
  }

  try {
    await actualizarActivaPromocion(promocionId, activa);
  } catch {
    return { error: 'No se pudo actualizar. Intenta de nuevo.' };
  }

  revalidarTienda();
  return { ok: true };
}

export async function borrarPromocion(formData: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const promocionId = Number(formData.get('promocionId'));
  if (!Number.isInteger(promocionId) || promocionId <= 0) return;

  await eliminarPromocion(promocionId);
  revalidarTienda();
}
