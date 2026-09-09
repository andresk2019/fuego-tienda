'use server';

import { revalidatePath } from 'next/cache';
import { haySesion } from '@/lib/session';
import { guardarDescripcionAroma } from '@/lib/aromas-db';
import { AROMAS_DISPONIBLES } from '@/lib/personalizacion';

export type EstadoGuardarAroma = { error?: string; ok?: boolean } | undefined;

export async function guardarDescripcion(
  _estado: EstadoGuardarAroma,
  formData: FormData
): Promise<EstadoGuardarAroma> {
  // Server Actions se tratan como endpoints públicos — nunca hay que
  // confiar en que la página que los llama ya esté protegida.
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const aroma = String(formData.get('aroma') ?? '');
  const descripcion = String(formData.get('descripcion') ?? '');

  if (!(AROMAS_DISPONIBLES as readonly string[]).includes(aroma)) {
    return { error: 'Aroma inválido.' };
  }

  try {
    await guardarDescripcionAroma(aroma, descripcion);
  } catch {
    return { error: 'No se pudo guardar. Intenta de nuevo.' };
  }

  revalidatePath('/admin/aromas');
  // Las páginas de producto ya son force-dynamic (nunca cacheadas),
  // así que esto no es estrictamente necesario, pero no sobra.
  revalidatePath('/productos/[id]', 'page');
  return { ok: true };
}
