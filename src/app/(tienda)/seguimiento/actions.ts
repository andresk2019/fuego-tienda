'use server';

// Consulta pública del estado de un pedido, SIN cuenta: el cliente
// demuestra que es suyo con el número de pedido + el teléfono con el que
// lo hizo. Es un endpoint público, así que:
//  - limita los intentos fallidos por IP (mismo mecanismo que el login
//    de /admin, con otra clave) para que nadie pueda probar teléfonos;
//  - responde igual si el pedido no existe o el teléfono no coincide;
//  - devuelve solo lo mínimo (ver PedidoSeguimiento).
import {
  obtenerIpCliente,
  verificarBloqueo,
  registrarIntentoFallido,
  registrarLoginExitoso,
} from '@/lib/login-intentos';
import { extraerIdPedido, normalizarTelefono } from '@/lib/pedidos';
import {
  buscarPedidoParaSeguimiento,
  type PedidoSeguimiento,
} from '@/lib/pedidos-db';

export type EstadoSeguimiento =
  | { error?: string; pedido?: PedidoSeguimiento; numero?: string; telefono?: string }
  | undefined;

export async function consultarPedido(
  _estado: EstadoSeguimiento,
  formData: FormData
): Promise<EstadoSeguimiento> {
  const numeroTexto = String(formData.get('numero') ?? '').trim().slice(0, 40);
  const telefonoTexto = String(formData.get('telefono') ?? '').trim().slice(0, 40);

  const id = extraerIdPedido(numeroTexto);
  const telefono = normalizarTelefono(telefonoTexto);

  if (!numeroTexto || !telefonoTexto) {
    return { numero: numeroTexto, telefono: telefonoTexto, error: 'Completa el número de pedido y tu teléfono.' };
  }
  if (id === null || telefono.length < 7) {
    return {
      numero: numeroTexto,
      telefono: telefonoTexto,
      error: 'Revisa el número de pedido (ej. FUEGO-000032) y tu teléfono.',
    };
  }

  const clave = `seguimiento:${await obtenerIpCliente()}`;
  const bloqueo = await verificarBloqueo(clave);
  if (bloqueo.bloqueado) {
    return {
      numero: numeroTexto,
      telefono: telefonoTexto,
      error: `Demasiados intentos. Intenta de nuevo en ${bloqueo.minutosRestantes} minuto${bloqueo.minutosRestantes === 1 ? '' : 's'}, o escríbenos por WhatsApp.`,
    };
  }

  const pedido = await buscarPedidoParaSeguimiento(id, telefono);
  if (!pedido) {
    await registrarIntentoFallido(clave);
    return {
      numero: numeroTexto,
      telefono: telefonoTexto,
      error:
        'No encontramos un pedido con ese número y ese teléfono. Revisa que sea el mismo número de WhatsApp que usaste al pedir.',
    };
  }

  await registrarLoginExitoso(clave);
  return { numero: numeroTexto, telefono: telefonoTexto, pedido };
}
