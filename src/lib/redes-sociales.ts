// Funciones puras (sin acceso a base de datos) para convertir lo que
// el admin escribe en /admin/quienes-somos — un usuario, un
// "@usuario", o un link completo copiado del navegador — en el
// usuario limpio y, a partir de ahí, en el link real de cada red. Así
// el admin no tiene que preocuparse por el formato exacto.
//
// limpiarUsuarioRed se usa al GUARDAR (ver guardarRedSocialContacto
// en admin/quienes-somos/actions.ts) — lo que queda en la base de
// datos ya está limpio. linkInstagram/linkTikTok arman el href a
// partir de ese valor limpio, en la página pública.

export function limpiarUsuarioRed(valor: string): string {
  const sinArroba = valor.trim().replace(/^@/, "");
  if (!sinArroba) return "";

  // Si pegaron un link completo (ej. "instagram.com/fuego.velas" o
  // "https://www.tiktok.com/@fuego.velas"), nos quedamos solo con el
  // usuario: el último segmento de la ruta.
  if (sinArroba.includes("/")) {
    try {
      const url = new URL(
        /^https?:\/\//i.test(sinArroba) ? sinArroba : `https://${sinArroba}`
      );
      const segmentos = url.pathname.split("/").filter(Boolean);
      const ultimo = segmentos[segmentos.length - 1];
      if (ultimo) return ultimo.replace(/^@/, "");
    } catch {
      // No era un link válido — seguimos con el texto tal cual.
    }
  }

  return sinArroba;
}

export function linkInstagram(usuario: string): string {
  return `https://instagram.com/${usuario}`;
}

export function linkTikTok(usuario: string): string {
  return `https://www.tiktok.com/@${usuario}`;
}
