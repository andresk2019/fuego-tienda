import CargandoMarca from "@/components/CargandoMarca";

// Fallback de Suspense mientras carga la portada (lee el catálogo
// para armar el carrusel de destacados) — Next.js lo muestra
// automáticamente por convención de archivo mientras el Server
// Component de page.tsx está resolviendo. No aplica a /catalogo ni a
// /productos/[id], que tienen su propio loading.tsx más específico.
export default function CargandoInicio() {
  return <CargandoMarca texto="Cargando Fuego..." />;
}
