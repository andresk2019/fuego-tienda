'use server';

import { revalidatePath } from 'next/cache';
import { haySesion } from '@/lib/session';
import {
  crearCupon,
  actualizarActivoCupon,
  eliminarCupon,
} from '@/lib/cupones-db';
import {
  CUPON_PORCENTAJE_MAXIMO,
  CUPON_PORCENTAJE_MINIMO,
  LONGITUD_MAXIMA_CODIGO,
  LONGITUD_MINIMA_CODIGO,
  codigoValido,
  normalizarCodigo,
} from '@/lib/cupones';

export type EstadoCrearCupon = { error?: string; ok?: boolean } | undefined;

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function refrescar() {
  revalidatePath('/admin/cupones');
}

export async function agregarCupon(
  _estado: EstadoCrearCupon,
  formData: FormData
): Promise<EstadoCrearCupon> {
  // Server Actions se tratan como endpoints públicos — nunca hay que
  // confiar en que la página que los llama ya esté protegida.
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const codigo = normalizarCodigo(String(formData.get('codigo') ?? ''));
  const porcentaje = Number(String(formData.get('porcentaje') ?? '').trim());
  const topeTotal = Number(String(formData.get('tope') ?? '').trim());
  const inicio = String(formData.get('inicio') ?? '').trim();
  const fin = String(formData.get('fin') ?? '').trim();

  if (!codigoValido(codigo)) {
    return {
      error: `El código debe tener entre ${LONGITUD_MINIMA_CODIGO} y ${LONGITUD_MAXIMA_CODIGO} caracteres, solo letras y números (sin espacios ni tildes).`,
    };
  }
  const enRango = (n: number) =>
    Number.isInteger(n) && n >= CUPON_PORCENTAJE_MINIMO && n <= CUPON_PORCENTAJE_MAXIMO;
  if (!enRango(porcentaje)) {
    return {
      error: `El descuento del cupón debe ser un número entero entre ${CUPON_PORCENTAJE_MINIMO} y ${CUPON_PORCENTAJE_MAXIMO}.`,
    };
  }
  if (!enRango(topeTotal)) {
    return {
      error: `El tope total debe ser un número entero entre ${CUPON_PORCENTAJE_MINIMO} y ${CUPON_PORCENTAJE_MAXIMO}.`,
    };
  }
  if (topeTotal < porcentaje) {
    return { error: 'El tope total no puede ser menor que el descuento del cupón.' };
  }
  if (inicio && !FORMATO_FECHA.test(inicio)) return { error: 'Fecha de inicio inválida.' };
  if (fin && !FORMATO_FECHA.test(fin)) return { error: 'Fecha de fin inválida.' };
  if (inicio && fin && fin < inicio) {
    return { error: 'La fecha de fin no puede ser antes de la de inicio.' };
  }

  const resultado = await crearCupon({
    codigo,
    porcentaje,
    topeTotal,
    inicio: inicio || null,
    fin: fin || null,
  });
  if (resultado === 'codigo_repetido') {
    return { error: `Ya existe un cupón con el código ${codigo}.` };
  }
  refrescar();
  return { ok: true };
}

export type EstadoAccionCupon = { error?: string } | undefined;

export async function cambiarActivoCupon(
  _estado: EstadoAccionCupon,
  formData: FormData
): Promise<EstadoAccionCupon> {
  if (!(await haySesion())) return { error: 'Tu sesión expiró, vuelve a entrar.' };
  const id = Number(formData.get('cuponId'));
  if (!Number.isInteger(id) || id <= 0) return { error: 'Cupón inválido.' };
  await actualizarActivoCupon(id, formData.get('activo') === 'true');
  refrescar();
}

export async function borrarCupon(
  _estado: EstadoAccionCupon,
  formData: FormData
): Promise<EstadoAccionCupon> {
  if (!(await haySesion())) return { error: 'Tu sesión expiró, vuelve a entrar.' };
  const id = Number(formData.get('cuponId'));
  if (!Number.isInteger(id) || id <= 0) return { error: 'Cupón inválido.' };
  await eliminarCupon(id);
  refrescar();
}
