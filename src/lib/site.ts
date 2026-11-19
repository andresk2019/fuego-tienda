// URL pública de la tienda — un solo lugar para no repetir el literal
// en layout.tsx (metadataBase), sitemap.ts y robots.ts. Si el dominio
// cambia, este es el único sitio que hay que tocar.
//
// Dominio propio (comprado en GoDaddy el 2026-11-19): la dirección
// principal es CON www — en Vercel, velasfuego.com.co redirige (308) a
// www.velasfuego.com.co, así que esa es la que debe figurar como
// canónica en el sitemap y en los metadatos. fuego-tienda.vercel.app
// sigue funcionando como dirección alterna.
export const SITE_URL = "https://www.velasfuego.com.co";
