'use server';

import { revalidatePath } from 'next/cache';
import { haySesion } from '@/lib/session';
import { guardarContenidoQuienesSomos } from '@/lib/admin-db';

export type EstadoQuienesSomos = { error?: string; ok?: boolean } | undefined;

export async function guardarQuienesSomos(
  _estado: EstadoQuienesSomos,
  formData: FormData
): Promise<EstadoQuienesSomos> {
  // Server Actions se tratan como endpoints públicos — nunca hay que
  // confiar en que la página que los llama ya esté protegida.
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const historia = String(formData.get('historia') ?? '').trim();
  const mision = String(formData.get('mision') ?? '').trim();
  const contacto = String(formData.get('contacto') ?? '').trim();

  if (!historia || !mision || !contacto) {
    return { error: 'Ningún campo puede quedar vacío.' };
  }

  try {
    await guardarContenidoQuienesSomos({ historia, mision, contacto });
  } catch {
    return { error: 'No se pudo guardar. Intenta de nuevo.' };
  }

  revalidatePath('/admin/quienes-somos');
  revalidatePath('/quienes-somos');
  return { ok: true };
}
