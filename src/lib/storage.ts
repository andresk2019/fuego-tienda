// Sube archivos (fotos de producto, logo de la tienda) a Supabase
// Storage. Solo se usa desde el panel de administración (protegido
// por sesión) — nunca se llama directamente desde una página pública.
import 'server-only';
import { createClient } from '@supabase/supabase-js';

let cliente: ReturnType<typeof createClient> | undefined;

function obtenerCliente() {
  if (!cliente) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) {
      throw new Error('Faltan las variables de entorno SUPABASE_URL / SUPABASE_SECRET_KEY');
    }
    cliente = createClient(url, key);
  }
  return cliente;
}

function obtenerBucket(): string {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) throw new Error('Falta la variable de entorno SUPABASE_STORAGE_BUCKET');
  return bucket;
}

// Sube siempre a la misma `ruta` (upsert) — así un archivo nuevo
// reemplaza al anterior en vez de acumular archivos huérfanos en el
// bucket. El "?v=" al final de la URL evita que quede una versión
// vieja cacheada en el navegador o el CDN.
async function subirArchivo(ruta: string, archivo: File): Promise<string> {
  const bytes = new Uint8Array(await archivo.arrayBuffer());

  const { error } = await obtenerCliente()
    .storage.from(obtenerBucket())
    .upload(ruta, bytes, {
      contentType: archivo.type || 'application/octet-stream',
      upsert: true,
    });
  if (error) throw error;

  const { data } = obtenerCliente().storage.from(obtenerBucket()).getPublicUrl(ruta);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function subirFotoAStorage(productoId: number, archivo: File): Promise<string> {
  const extension = (archivo.name.split('.').pop() || 'jpg').toLowerCase();
  return subirArchivo(`productos/${productoId}.${extension}`, archivo);
}

// Foto adicional para la galería de un producto (ver
// tienda_producto_galeria en admin-db.ts) — a diferencia de
// subirFotoAStorage (una sola ruta fija por producto, siempre se
// reemplaza), acá se pueden subir varias fotos para el mismo
// producto, así que cada una necesita su propia ruta única.
export async function subirFotoGaleriaAStorage(
  productoId: number,
  archivo: File
): Promise<string> {
  const extension = (archivo.name.split('.').pop() || 'jpg').toLowerCase();
  const sufijo = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return subirArchivo(`productos/${productoId}-galeria-${sufijo}.${extension}`, archivo);
}

export async function subirLogoAStorage(archivo: File): Promise<string> {
  const extension = (archivo.name.split('.').pop() || 'png').toLowerCase();
  return subirArchivo(`sitio/logo.${extension}`, archivo);
}
