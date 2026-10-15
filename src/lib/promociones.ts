// Tipos y reglas puras de las promociones (banners de Black Friday,
// Navidad, etc.) — sin servidor ni React, para poder usarlas tanto en
// la base de datos como en los formularios del admin.

export const LONGITUD_MAXIMA_TITULO = 60;
export const LONGITUD_MAXIMA_TEXTO = 160;

// "vigente": activa y dentro de sus fechas — es lo único que se ve en
// la tienda. Las demás solo existen en el panel de administración.
export type EstadoPromocion =
  | "vigente"
  | "programada"
  | "vencida"
  | "desactivada";

export type Promocion = {
  id: number;
  titulo: string;
  texto: string;
  imagenUrl: string | null;
  enlace: string | null;
  // Formato YYYY-MM-DD (día calendario de Colombia), o null si no hay
  // límite de ese lado.
  inicio: string | null;
  fin: string | null;
  activa: boolean;
  enFranja: boolean;
  enPortada: boolean;
  estado: EstadoPromocion;
};

// El enlace lo escribe el dueño en el panel, pero igual se valida: solo
// una ruta de la propia tienda ("/catalogo") o una dirección https —
// nunca algo como "javascript:..." que se ejecutaría al hacer clic.
export function enlaceValido(enlace: string): boolean {
  if (enlace.startsWith("/")) return !enlace.startsWith("//");
  try {
    return new URL(enlace).protocol === "https:";
  } catch {
    return false;
  }
}

export function esEnlaceInterno(enlace: string): boolean {
  return enlace.startsWith("/");
}

export const ETIQUETA_ESTADO: Record<EstadoPromocion, string> = {
  vigente: "Vigente",
  programada: "Programada",
  vencida: "Vencida",
  desactivada: "Desactivada",
};
