// Datos propios de la tienda (NO de Contabilidad Lady) — hoy, la foto
// y la descripción de cada producto, y configuración del sitio (el
// logo, el número de WhatsApp). Vive en el MISMO Postgres que
// `inventario`, pero en tablas nuevas y separadas
// (`tienda_producto_meta`, `tienda_config`), nunca en las tablas de
// Contabilidad Lady.
//
// Escribir aquí solo pasa desde /admin (protegido por sesión — ver
// cada Server Action en admin/actions.ts). Leer es distinto: algunas
// funciones de este archivo (ej. obtenerNumeroWhatsApp) también las
// usa la tienda pública, porque son configuración que cualquier
// visitante necesita ver (a dónde manda su pedido), no algo privado.
//
// (Pedidos, reseñas y aromas también escriben en su propia tabla —
// ver pedidos-db.ts/resenas-db.ts/aromas-db.ts — así que este archivo
// ya no es la única parte que escribe, solo la primera que hubo.)
import 'server-only';
import { getPool } from './pool';

let esquemaListo: Promise<void> | undefined;

// Un solo viaje de ida y vuelta para las 4 sentencias (antes eran 4
// consultas encadenadas por separado) — la base de datos está en
// sa-east-1 y las funciones de Vercel en iad1, así que cada viaje de
// más pesa, sobre todo la primera vez que arranca un contenedor
// nuevo (cuando `esquemaListo` todavía no está en caché).
function asegurarEsquema(): Promise<void> {
  if (!esquemaListo) {
    esquemaListo = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS tienda_producto_meta (
           producto_id INTEGER PRIMARY KEY,
           foto_url TEXT,
           descripcion TEXT,
           destacado BOOLEAN NOT NULL DEFAULT false,
           actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         ALTER TABLE tienda_producto_meta ADD COLUMN IF NOT EXISTS descripcion TEXT;
         ALTER TABLE tienda_producto_meta ADD COLUMN IF NOT EXISTS destacado BOOLEAN NOT NULL DEFAULT false;
         CREATE TABLE IF NOT EXISTS tienda_config (
           clave TEXT PRIMARY KEY,
           valor TEXT
         );
         CREATE TABLE IF NOT EXISTS tienda_producto_galeria (
           id SERIAL PRIMARY KEY,
           producto_id INTEGER NOT NULL,
           foto_url TEXT NOT NULL,
           creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         CREATE INDEX IF NOT EXISTS idx_tienda_producto_galeria_producto
           ON tienda_producto_galeria (producto_id);`
      )
      .then(() => undefined);
  }
  return esquemaListo;
}

export async function obtenerLogoUrl(): Promise<string | null> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    "SELECT valor FROM tienda_config WHERE clave = 'logo_url'"
  );
  return rows[0]?.valor ?? null;
}

export async function guardarLogoUrl(url: string): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_config (clave, valor) VALUES ('logo_url', $1)
     ON CONFLICT (clave) DO UPDATE SET valor = $1`,
    [url]
  );
}

// Número de WhatsApp de la tienda — antes vivía fijo en la variable
// de entorno NEXT_PUBLIC_WHATSAPP_NUMBER (cambiarlo exigía editarla en
// Vercel y esperar un nuevo despliegue). Ahora se guarda aquí, para
// que el dueño lo pueda cambiar él mismo desde /admin en cualquier
// momento (ej. si pierde el celular y necesita cambiar de número ya).
// La variable de entorno queda como respaldo, solo por si todavía no
// se ha guardado nada en esta tabla (ej. justo después de este
// cambio) — así no se rompe nada mientras el dueño no la haya tocado.
export async function obtenerNumeroWhatsApp(): Promise<string | null> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    "SELECT valor FROM tienda_config WHERE clave = 'whatsapp_numero'"
  );
  return rows[0]?.valor || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null;
}

export async function guardarNumeroWhatsApp(numero: string): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_config (clave, valor) VALUES ('whatsapp_numero', $1)
     ON CONFLICT (clave) DO UPDATE SET valor = $1`,
    [numero]
  );
}

// Texto de "Quiénes somos" (historia, misión, contacto) — antes vivía
// escrito directo en el archivo de la página, marcado como "contenido
// de prueba" mientras el dueño definía el texto real. Ahora se guarda
// en tienda_config (mismo patrón que el logo y el número de
// WhatsApp), editable desde /admin/quienes-somos.
//
// El valor por defecto es el mismo texto de relleno que ya se
// mostraba antes de este cambio — así la página no se queda vacía
// justo después del despliegue, mientras el dueño no haya guardado
// el texto real todavía.
export type ContenidoQuienesSomos = {
  historia: string;
  mision: string;
  contacto: string;
};

const CONTENIDO_QUIENES_SOMOS_POR_DEFECTO: ContenidoQuienesSomos = {
  historia:
    'Este es un texto de prueba. Aquí va la historia real de Fuego: cómo empezó la marca, quién la hace y qué la hace especial. Reemplazar por el contenido definitivo.',
  mision:
    'Otro texto de prueba. Aquí puede ir qué hace únicas a las velas de Fuego: materiales, proceso artesanal, valores de la marca.',
  contacto:
    'Texto de prueba también — aquí podría ir el WhatsApp, redes sociales o correo de contacto de Fuego, más adelante.',
};

const CLAVES_QUIENES_SOMOS = {
  historia: 'quienes_somos_historia',
  mision: 'quienes_somos_mision',
  contacto: 'quienes_somos_contacto',
} as const;

export async function obtenerContenidoQuienesSomos(): Promise<ContenidoQuienesSomos> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    "SELECT clave, valor FROM tienda_config WHERE clave = ANY($1)",
    [Object.values(CLAVES_QUIENES_SOMOS)]
  );
  const guardado: Record<string, string> = {};
  for (const fila of rows) {
    guardado[fila.clave] = fila.valor;
  }
  return {
    historia:
      guardado[CLAVES_QUIENES_SOMOS.historia] ||
      CONTENIDO_QUIENES_SOMOS_POR_DEFECTO.historia,
    mision:
      guardado[CLAVES_QUIENES_SOMOS.mision] ||
      CONTENIDO_QUIENES_SOMOS_POR_DEFECTO.mision,
    contacto:
      guardado[CLAVES_QUIENES_SOMOS.contacto] ||
      CONTENIDO_QUIENES_SOMOS_POR_DEFECTO.contacto,
  };
}

export type CampoQuienesSomos = keyof typeof CLAVES_QUIENES_SOMOS;

// Guarda un solo campo a la vez (no los 3 juntos) — así, en el admin,
// cada campo (historia/misión/contacto) se puede bloquear y editar
// por separado, sin reenviar los otros dos sin querer.
export async function guardarCampoQuienesSomos(
  campo: CampoQuienesSomos,
  texto: string
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_config (clave, valor) VALUES ($1, $2)
     ON CONFLICT (clave) DO UPDATE SET valor = $2`,
    [CLAVES_QUIENES_SOMOS[campo], texto]
  );
}

// Redes sociales que se muestran como íconos en "Quiénes somos"
// (sección Contacto) — ver src/lib/redes-sociales.ts para cómo se
// arma el link a partir de lo que el admin escribe aquí. El ícono de
// WhatsApp de ese mismo bloque reutiliza el número de arriba
// (obtenerNumeroWhatsApp) en vez de tener su propio campo — así no
// quedan dos números de WhatsApp que el dueño tenga que mantener
// sincronizados.
export type RedesSociales = {
  instagram: string;
  tiktok: string;
};

const CLAVES_REDES_SOCIALES = {
  instagram: 'contacto_instagram',
  tiktok: 'contacto_tiktok',
} as const;

export type RedSocial = keyof typeof CLAVES_REDES_SOCIALES;

export async function obtenerRedesSociales(): Promise<RedesSociales> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    'SELECT clave, valor FROM tienda_config WHERE clave = ANY($1)',
    [Object.values(CLAVES_REDES_SOCIALES)]
  );
  const guardado: Record<string, string> = {};
  for (const fila of rows) {
    if (fila.valor) guardado[fila.clave] = fila.valor;
  }
  return {
    instagram: guardado[CLAVES_REDES_SOCIALES.instagram] ?? '',
    tiktok: guardado[CLAVES_REDES_SOCIALES.tiktok] ?? '',
  };
}

// Si `usuario` llega vacío, se guarda como NULL (NULLIF) — así el
// ícono correspondiente deja de mostrarse en la tienda en vez de
// quedar apuntando a un link roto.
export async function guardarRedSocial(
  red: RedSocial,
  usuario: string
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_config (clave, valor) VALUES ($1, NULLIF($2, ''))
     ON CONFLICT (clave) DO UPDATE SET valor = NULLIF($2, '')`,
    [CLAVES_REDES_SOCIALES[red], usuario]
  );
}

export type MetaProductos = {
  fotos: Record<number, string>;
  descripciones: Record<number, string>;
  destacados: Set<number>;
};

// Trae foto/descripción/destacado de TODOS los productos en una sola
// consulta (antes eran 3 consultas separadas a la misma tabla) — son
// pocos productos hoy, no vale la pena una consulta por producto ni
// una por columna.
export async function obtenerMetaDeProductos(): Promise<MetaProductos> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    'SELECT producto_id, foto_url, descripcion, destacado FROM tienda_producto_meta'
  );

  const fotos: Record<number, string> = {};
  const descripciones: Record<number, string> = {};
  const destacados = new Set<number>();

  for (const fila of rows) {
    if (fila.foto_url) fotos[fila.producto_id] = fila.foto_url;
    if (fila.descripcion) descripciones[fila.producto_id] = fila.descripcion;
    if (fila.destacado) destacados.add(fila.producto_id);
  }

  return { fotos, descripciones, destacados };
}

export async function guardarFotoProducto(productoId: number, fotoUrl: string): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_producto_meta (producto_id, foto_url, actualizado_en)
     VALUES ($1, $2, now())
     ON CONFLICT (producto_id) DO UPDATE SET foto_url = $2, actualizado_en = now()`,
    [productoId, fotoUrl]
  );
}

// Si `descripcion` llega vacía, se guarda como NULL (NULLIF) — así el
// producto vuelve a mostrar el texto genérico en vez de quedar con un
// texto vacío.
export async function guardarDescripcionProducto(
  productoId: number,
  descripcion: string
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_producto_meta (producto_id, descripcion, actualizado_en)
     VALUES ($1, NULLIF($2, ''), now())
     ON CONFLICT (producto_id) DO UPDATE SET descripcion = NULLIF($2, ''), actualizado_en = now()`,
    [productoId, descripcion]
  );
}

export async function guardarDestacadoProducto(
  productoId: number,
  destacado: boolean
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    `INSERT INTO tienda_producto_meta (producto_id, destacado, actualizado_en)
     VALUES ($1, $2, now())
     ON CONFLICT (producto_id) DO UPDATE SET destacado = $2, actualizado_en = now()`,
    [productoId, destacado]
  );
}

// Galería de fotos adicionales de un producto — CUALQUIER producto,
// no solo los personalizables (decisión del dueño, 2026-09-11: la
// vista previa ya no depende de un color elegido, sino de que el
// cliente haga clic en una foto de la galería, ver
// GaleriaFotosProducto.tsx). No están asociadas a nada (ni color, ni
// talla): son solo fotos adicionales, en el orden en que se subieron.
export type FotoGaleria = {
  id: number;
  fotoUrl: string;
};

export async function obtenerGaleriaProducto(
  productoId: number
): Promise<FotoGaleria[]> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    'SELECT id, foto_url FROM tienda_producto_galeria WHERE producto_id = $1 ORDER BY id',
    [productoId]
  );
  return rows.map((fila) => ({ id: fila.id, fotoUrl: fila.foto_url }));
}

// Trae la galería de TODOS los productos en una sola consulta (para
// el panel de administración, que lista todos los productos de una
// vez) — la mayoría de productos hoy no tienen ninguna fila todavía.
export async function obtenerGaleriaTodosLosProductos(): Promise<
  Record<number, FotoGaleria[]>
> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    'SELECT id, producto_id, foto_url FROM tienda_producto_galeria ORDER BY id'
  );
  const mapa: Record<number, FotoGaleria[]> = {};
  for (const fila of rows) {
    (mapa[fila.producto_id] ??= []).push({
      id: fila.id,
      fotoUrl: fila.foto_url,
    });
  }
  return mapa;
}

// Agrega una foto nueva a la galería (no reemplaza ninguna — a
// diferencia de guardarFotoProducto, aquí se pueden ir acumulando
// varias). Devuelve el id de la fila nueva, aunque hoy no se use
// (por si hace falta más adelante).
export async function agregarFotoGaleria(
  productoId: number,
  fotoUrl: string
): Promise<number> {
  await asegurarEsquema();
  const { rows } = await getPool().query(
    'INSERT INTO tienda_producto_galeria (producto_id, foto_url) VALUES ($1, $2) RETURNING id',
    [productoId, fotoUrl]
  );
  return rows[0].id;
}

// Se filtra también por `productoId` (no solo por `id`) como defensa
// extra: así un id de foto "adivinado" o de otro producto nunca puede
// borrar la foto de un producto distinto.
export async function eliminarFotoGaleria(
  id: number,
  productoId: number
): Promise<void> {
  await asegurarEsquema();
  await getPool().query(
    'DELETE FROM tienda_producto_galeria WHERE id = $1 AND producto_id = $2',
    [id, productoId]
  );
}
