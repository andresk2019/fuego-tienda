'use server';

import { crearResena } from '@/lib/resenas-db';
import { CALIFICACION_MAXIMA } from '@/lib/resenas';

export type EstadoResenaCliente = { error?: string; ok?: boolean } | undefined;

// Topes de longitud generosos pero no ilimitados — un formulario
// público sin sesión (cualquier visitante lo puede llamar) merece al
// menos este freno básico, igual que se recorta la descripción en
// generateMetadata de page.tsx.
const LONGITUD_MAXIMA_NOMBRE = 60;
const LONGITUD_MAXIMA_TEXTO = 500;

// Server Action pública (sin haySesion) — cualquier visitante de la
// ficha de un producto puede dejar su reseña, a diferencia de
// agregarResena (admin/resenas/actions.ts), que sí exige sesión. La
// diferencia real de seguridad está en `visible`: esta SIEMPRE la
// crea oculta, así que no hay forma de que un cliente publique algo
// directo en la tienda sin que el dueño lo revise primero (ver
// crearResena en resenas-db.ts).
export async function enviarResenaCliente(
  _estado: EstadoResenaCliente,
  formData: FormData
): Promise<EstadoResenaCliente> {
  const clienteNombre = String(formData.get('clienteNombre') ?? '')
    .trim()
    .slice(0, LONGITUD_MAXIMA_NOMBRE);
  const texto = String(formData.get('texto') ?? '')
    .trim()
    .slice(0, LONGITUD_MAXIMA_TEXTO);
  const calificacion = Number(formData.get('calificacion'));
  const productoId = Number(formData.get('productoId'));

  if (!clienteNombre) return { error: 'Escribe tu nombre.' };
  if (!texto) return { error: 'Escribe tu reseña.' };
  if (
    !Number.isInteger(calificacion) ||
    calificacion < 1 ||
    calificacion > CALIFICACION_MAXIMA
  ) {
    return { error: 'Elige una calificación.' };
  }
  if (!Number.isInteger(productoId) || productoId <= 0) {
    return { error: 'Producto inválido.' };
  }

  try {
    await crearResena({
      clienteNombre,
      texto,
      calificacion,
      productoId,
      visible: false,
    });
  } catch {
    return { error: 'No se pudo enviar tu reseña. Intenta de nuevo.' };
  }

  // Sin revalidatePath: la reseña queda oculta hasta que el dueño la
  // apruebe desde /admin/resenas, así que todavía no hay nada nuevo
  // que mostrarle a otros visitantes de la tienda.
  return { ok: true };
}
