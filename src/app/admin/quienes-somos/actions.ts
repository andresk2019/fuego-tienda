'use server';

import { revalidatePath } from 'next/cache';
import { haySesion } from '@/lib/session';
import {
  guardarCampoQuienesSomos,
  guardarRedSocial,
  type CampoQuienesSomos,
  type RedSocial,
} from '@/lib/admin-db';
import { limpiarUsuarioRed } from '@/lib/redes-sociales';

const CAMPOS_VALIDOS: CampoQuienesSomos[] = ['historia', 'mision', 'contacto'];
const REDES_VALIDAS: RedSocial[] = ['instagram', 'tiktok'];

export type EstadoQuienesSomos = { error?: string; ok?: boolean } | undefined;

export async function guardarCampoContenidoQuienesSomos(
  _estado: EstadoQuienesSomos,
  formData: FormData
): Promise<EstadoQuienesSomos> {
  // Server Actions se tratan como endpoints públicos — nunca hay que
  // confiar en que la página que los llama ya esté protegida.
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const campo = String(formData.get('campo') ?? '') as CampoQuienesSomos;
  const texto = String(formData.get('texto') ?? '').trim();

  if (!CAMPOS_VALIDOS.includes(campo)) {
    return { error: 'Campo inválido.' };
  }
  if (!texto) {
    return { error: 'El texto no puede quedar vacío.' };
  }

  try {
    await guardarCampoQuienesSomos(campo, texto);
  } catch {
    return { error: 'No se pudo guardar. Intenta de nuevo.' };
  }

  revalidatePath('/admin/quienes-somos');
  revalidatePath('/quienes-somos');
  return { ok: true };
}

// A diferencia de historia/misión/contacto, aquí sí se permite guardar
// vacío: no todas las tiendas tienen las 3 redes, y un campo vacío
// simplemente hace que ese ícono no aparezca en la tienda (ver
// RedesSocialesContacto).
export async function guardarRedSocialContacto(
  _estado: EstadoQuienesSomos,
  formData: FormData
): Promise<EstadoQuienesSomos> {
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const red = String(formData.get('red') ?? '') as RedSocial;
  if (!REDES_VALIDAS.includes(red)) {
    return { error: 'Red inválida.' };
  }
  const usuario = limpiarUsuarioRed(String(formData.get('texto') ?? ''));

  try {
    await guardarRedSocial(red, usuario);
  } catch {
    return { error: 'No se pudo guardar. Intenta de nuevo.' };
  }

  revalidatePath('/admin/quienes-somos');
  revalidatePath('/quienes-somos');
  return { ok: true };
}
