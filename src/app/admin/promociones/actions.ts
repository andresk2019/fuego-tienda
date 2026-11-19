'use server';

import { revalidatePath } from 'next/cache';
import { haySesion } from '@/lib/session';
import {
  crearPromocion,
  actualizarPromocion,
  actualizarActivaPromocion,
  eliminarPromocion,
} from '@/lib/promociones-db';
import { subirImagenPromocionAStorage } from '@/lib/storage';
import { obtenerCatalogoFuego } from '@/lib/db';
import {
  enlaceValido,
  LONGITUD_MAXIMA_TITULO,
  LONGITUD_MAXIMA_TEXTO,
  DESCUENTO_MINIMO,
  DESCUENTO_MAXIMO,
  ESTILOS_PROMOCION,
  FONDOS_PROMOCION,
  LONGITUD_MAXIMA_SELLO,
  type EstiloPromocion,
  type FondoPromocion,
} from '@/lib/promociones';

export type EstadoCrearPromocion = { error?: string; ok?: boolean } | undefined;

// Vercel corta en ~4.5MB por petición (ver LIMITE_MB en admin/actions.ts);
// el navegador ya reduce la imagen antes de enviarla.
const LIMITE_MB = 4;
const EXTENSION_POR_TIPO: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function revalidarTienda() {
  revalidatePath('/admin/promociones');
  // El descuento cambia precios en el catálogo, las fichas y el carrito.
  revalidatePath('/', 'layout');
}

type DatosPromocion = {
  titulo: string;
  texto: string;
  enlace: string | null;
  inicio: string | null;
  fin: string | null;
  enFranja: boolean;
  enPortada: boolean;
  enPopup: boolean;
  estilo: EstiloPromocion;
  sello: string | null;
  fondo: FondoPromocion | null;
  descuentoPorcentaje: number | null;
  productosExcluidos: number[];
};

// Lee y valida los campos del formulario — el MISMO código para crear
// y para editar, así las dos formas no pueden aceptar cosas distintas.
function leerDatosPromocion(
  formData: FormData
): { error: string } | { datos: DatosPromocion } {
  const titulo = String(formData.get('titulo') ?? '').trim();
  const texto = String(formData.get('texto') ?? '').trim();
  const enlace = String(formData.get('enlace') ?? '').trim();
  const inicio = String(formData.get('inicio') ?? '').trim();
  const fin = String(formData.get('fin') ?? '').trim();
  const enFranja = formData.get('enFranja') === 'on';
  const enPortada = formData.get('enPortada') === 'on';
  const enPopup = formData.get('enPopup') === 'on';
  const estiloCrudo = String(formData.get('estilo') ?? 'normal');
  const selloCrudo = String(formData.get('sello') ?? '').trim();
  const fondoCrudo = String(formData.get('fondo') ?? '').trim();
  const descuentoCrudo = String(formData.get('descuento') ?? '').trim();

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
  const estilo = ESTILOS_PROMOCION.find((e) => e.valor === estiloCrudo)?.valor;
  if (!estilo) return { error: 'Estilo inválido.' };
  // Vacío = el fondo de siempre según el estilo.
  const fondo = fondoCrudo
    ? (FONDOS_PROMOCION.find((f) => f.valor === fondoCrudo)?.valor ?? null)
    : null;
  if (fondoCrudo && !fondo) return { error: 'Fondo inválido.' };
  if (selloCrudo.length > LONGITUD_MAXIMA_SELLO) {
    return { error: `El sello puede tener máximo ${LONGITUD_MAXIMA_SELLO} caracteres.` };
  }
  if (!enFranja && !enPortada && !enPopup) {
    return {
      error: 'Elige dónde se muestra: franja superior, banners o pop-up (al menos uno).',
    };
  }

  // Campo vacío = promo solo informativa, sin descuento. Con valor,
  // tiene que ser un porcentaje entero razonable: este número rebaja
  // de verdad los precios de la tienda (ver porcentajeDescuentoDe).
  let descuentoPorcentaje: number | null = null;
  if (descuentoCrudo) {
    const descuento = Number(descuentoCrudo);
    if (
      !Number.isInteger(descuento) ||
      descuento < DESCUENTO_MINIMO ||
      descuento > DESCUENTO_MAXIMO
    ) {
      return {
        error: `El descuento debe ser un número entero entre ${DESCUENTO_MINIMO} y ${DESCUENTO_MAXIMO}.`,
      };
    }
    descuentoPorcentaje = descuento;
  }
  const productosExcluidos = descuentoPorcentaje
    ? [...new Set(formData.getAll('productosExcluidos').map(Number))].filter(
        (id) => Number.isInteger(id) && id > 0
      )
    : [];

  return {
    datos: {
      titulo,
      texto,
      enlace: enlace || null,
      inicio: inicio || null,
      fin: fin || null,
      enFranja,
      enPortada,
      enPopup,
      estilo,
      // El sello solo existe en el estilo aniversario.
      sello: estilo === 'aniversario' && selloCrudo ? selloCrudo : null,
      fondo,
      descuentoPorcentaje,
      productosExcluidos,
    },
  };
}

// Sube la imagen del formulario si se eligió una. Devuelve url null si
// no se eligió ninguna (no es un error).
async function subirImagenDelFormulario(
  imagen: FormDataEntryValue | null
): Promise<{ error: string } | { url: string | null }> {
  if (!(imagen instanceof File) || imagen.size === 0) return { url: null };

  const extension = EXTENSION_POR_TIPO[imagen.type];
  if (!extension) return { error: 'La imagen debe ser JPG, PNG, WebP o GIF.' };
  if (imagen.size > LIMITE_MB * 1024 * 1024) {
    return { error: `La imagen no puede pesar más de ${LIMITE_MB}MB.` };
  }
  try {
    return { url: await subirImagenPromocionAStorage(imagen, extension) };
  } catch (error) {
    console.error('[subida] imagen de promoción', { tipo: imagen.type, bytes: imagen.size }, error);
    return { error: 'No se pudo subir la imagen. Intenta de nuevo.' };
  }
}

// "Usar la foto de un producto": en vez de subir una imagen, se
// reutiliza la foto que ese producto ya tiene (solo se guarda su URL).
async function fotoDeProductoDelFormulario(
  formData: FormData
): Promise<{ error: string } | { url: string | null }> {
  const crudo = String(formData.get('imagenProductoId') ?? '').trim();
  if (!crudo) return { url: null };
  const id = Number(crudo);
  if (!Number.isInteger(id) || id <= 0) return { error: 'Producto inválido.' };
  const productos = await obtenerCatalogoFuego({ conDescuento: false });
  const producto = productos.find((p) => p.id === id);
  if (!producto) return { error: 'Producto inválido.' };
  if (!producto.fotoUrl) return { error: 'Ese producto todavía no tiene foto.' };
  return { url: producto.fotoUrl };
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

  const leido = leerDatosPromocion(formData);
  if ('error' in leido) return { error: leido.error };

  const imagen = await subirImagenDelFormulario(formData.get('imagen'));
  if ('error' in imagen) return { error: imagen.error };
  const fotoProducto = await fotoDeProductoDelFormulario(formData);
  if ('error' in fotoProducto) return { error: fotoProducto.error };

  try {
    // Una imagen subida manda sobre la foto de un producto.
    await crearPromocion({
      ...leido.datos,
      imagenUrl: imagen.url ?? fotoProducto.url,
    });
  } catch {
    return { error: 'No se pudo guardar la promoción. Intenta de nuevo.' };
  }

  revalidarTienda();
  return { ok: true };
}

export async function editarPromocion(
  _estado: EstadoCrearPromocion,
  formData: FormData
): Promise<EstadoCrearPromocion> {
  if (!(await haySesion())) {
    return { error: 'Tu sesión expiró, vuelve a entrar.' };
  }

  const promocionId = Number(formData.get('promocionId'));
  if (!Number.isInteger(promocionId) || promocionId <= 0) {
    return { error: 'Promoción inválida.' };
  }

  const leido = leerDatosPromocion(formData);
  if ('error' in leido) return { error: leido.error };

  // Imagen: una nueva reemplaza a la actual; si no se elige ninguna,
  // "Quitar la imagen actual" la deja sin imagen; si no, queda como
  // estaba (undefined = no tocar).
  const imagen = await subirImagenDelFormulario(formData.get('imagen'));
  if ('error' in imagen) return { error: imagen.error };
  const fotoProducto = await fotoDeProductoDelFormulario(formData);
  if ('error' in fotoProducto) return { error: fotoProducto.error };
  const imagenUrl =
    imagen.url !== null
      ? imagen.url
      : fotoProducto.url !== null
        ? fotoProducto.url
        : formData.get('quitarImagen') === 'on'
          ? null
          : undefined;

  try {
    await actualizarPromocion(promocionId, { ...leido.datos, imagenUrl });
  } catch {
    return { error: 'No se pudieron guardar los cambios. Intenta de nuevo.' };
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
