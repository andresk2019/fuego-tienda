// Reduce una imagen en el NAVEGADOR antes de subirla desde /admin.
//
// Por qué existe: Vercel rechaza (413 FUNCTION_PAYLOAD_TOO_LARGE)
// cualquier petición de más de ~4.5MB a una función, y subir una foto
// es una petición a un Server Action. Una foto de celular pesa
// fácilmente de 3 a 12MB, así que pasaba nuestra propia validación
// (8MB) pero Vercel la cortaba antes de que llegara a nuestro código —
// el error de subida que se veía desde el celular. Con esto, lo que
// sale del navegador pesa unos cientos de KB.
//
// Solo corre en el navegador (usa canvas), nunca en el servidor.

const TIPOS_DIRECTOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
// Una imagen que ya pesa menos que esto, y es de un formato que la
// tienda acepta tal cual, se sube sin tocarla (no se le pierde
// calidad ni transparencia).
const LIMITE_SIN_TOCAR = 2 * 1024 * 1024;
// Lo que se busca como máximo al reducir — bien por debajo de los
// ~4.5MB de Vercel, para dejar margen a los demás campos del formulario.
const OBJETIVO_BYTES = 2.5 * 1024 * 1024;
const LADO_MAXIMO = 2400;

type ImagenDecodificada = {
  fuente: CanvasImageSource;
  ancho: number;
  alto: number;
  liberar: () => void;
};

async function decodificar(archivo: File): Promise<ImagenDecodificada> {
  // Safari (iPhone) también decodifica HEIC aquí, aunque el servidor no
  // lo aceptaría tal cual — por eso todo lo que no sea un formato
  // conocido pasa por este camino y sale como JPG.
  try {
    const bitmap = await createImageBitmap(archivo);
    return {
      fuente: bitmap,
      ancho: bitmap.width,
      alto: bitmap.height,
      liberar: () => bitmap.close(),
    };
  } catch {
    const url = URL.createObjectURL(archivo);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return {
        fuente: img,
        ancho: img.naturalWidth,
        alto: img.naturalHeight,
        liberar: () => URL.revokeObjectURL(url),
      };
    } catch {
      URL.revokeObjectURL(url);
      throw new Error('No se pudo leer la imagen. Prueba con otra foto (JPG o PNG).');
    }
  }
}

function aBlob(
  imagen: ImagenDecodificada,
  escala: number,
  tipo: 'image/jpeg' | 'image/png',
  calidad: number
): Promise<Blob> {
  const ancho = Math.max(1, Math.round(imagen.ancho * escala));
  const alto = Math.max(1, Math.round(imagen.alto * escala));
  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar la imagen en este navegador.');
  if (tipo === 'image/jpeg') {
    // JPG no tiene transparencia: sin esto, lo transparente saldría negro.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ancho, alto);
  }
  ctx.drawImage(imagen.fuente, 0, 0, ancho, alto);
  return new Promise((resolver, rechazar) =>
    canvas.toBlob(
      (blob) => (blob ? resolver(blob) : rechazar(new Error('No se pudo reducir la imagen.'))),
      tipo,
      calidad
    )
  );
}

export async function prepararImagen(archivo: File): Promise<File> {
  const formatoConocido = TIPOS_DIRECTOS.includes(archivo.type);
  if (formatoConocido && archivo.size <= LIMITE_SIN_TOCAR) return archivo;

  // Un GIF animado perdería la animación al volver a codificarlo.
  if (archivo.type === 'image/gif') {
    throw new Error('El GIF pesa demasiado (máximo 2MB). Usa una imagen JPG o PNG.');
  }

  const imagen = await decodificar(archivo);
  try {
    // Los PNG (logos, con transparencia) siguen siendo PNG; todo lo
    // demás (fotos, WebP, HEIC) sale como JPG.
    const tipo = archivo.type === 'image/png' ? 'image/png' : 'image/jpeg';
    let escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.ancho, imagen.alto));
    let calidad = 0.85;

    let blob = await aBlob(imagen, escala, tipo, calidad);
    for (let intento = 0; blob.size > OBJETIVO_BYTES && intento < 6; intento++) {
      if (tipo === 'image/jpeg' && calidad > 0.55) calidad -= 0.1;
      else escala *= 0.8;
      blob = await aBlob(imagen, escala, tipo, calidad);
    }
    if (blob.size > OBJETIVO_BYTES) {
      throw new Error('La imagen sigue pesando demasiado. Prueba con otra más pequeña.');
    }

    const base = archivo.name.replace(/\.[^.]+$/, '') || 'imagen';
    const extension = tipo === 'image/png' ? 'png' : 'jpg';
    return new File([blob], `${base}.${extension}`, { type: tipo });
  } finally {
    imagen.liberar();
  }
}

// Reduce el archivo que eligió la persona en un <input type="file"> y
// lo deja puesto de vuelta en el mismo input, para que el formulario lo
// envíe tal cual. Devuelve un mensaje de error en español, o null si
// todo salió bien.
export async function prepararInputImagen(
  input: HTMLInputElement
): Promise<string | null> {
  const archivo = input.files?.[0];
  if (!archivo) return null;

  try {
    const preparado = await prepararImagen(archivo);
    if (preparado !== archivo) {
      const transferencia = new DataTransfer();
      transferencia.items.add(preparado);
      input.files = transferencia.files;
    }
    return null;
  } catch (error) {
    input.value = '';
    return error instanceof Error
      ? error.message
      : 'No se pudo preparar la imagen. Intenta con otra.';
  }
}
