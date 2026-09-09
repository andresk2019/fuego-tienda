'use server';

import { revalidatePath } from 'next/cache';
import { haySesion } from '@/lib/session';
import {
  guardarCampoQuienesSomos,
  type CampoQuienesSomos,
} from '@/lib/admin-db';

const CAMPOS_VALIDOS: CampoQuienesSomos[] = ['historia', 'mision', 'contacto'];

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
