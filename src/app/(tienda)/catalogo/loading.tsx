// Esqueleto del catálogo mientras carga (misma forma que el catálogo
// real: pestañas de sección, píldoras de subcategoría/categoría, y la
// cuadrícula de tarjetas) — colores neutros de la propia paleta
// (bg-border) con la animación de Tailwind, para que no desentone ni
// un instante con el resto del sitio.
export default function CargandoCatalogo() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="mb-8 flex justify-center gap-8 border-b border-border pb-3">
        <div className="h-5 w-36 animate-pulse rounded bg-border" />
        <div className="h-5 w-36 animate-pulse rounded bg-border" />
      </div>

      <div className="mb-10 flex justify-center gap-2">
        <div className="h-9 w-24 animate-pulse rounded-full bg-border" />
        <div className="h-9 w-32 animate-pulse rounded-full bg-border" />
      </div>

      <div className="mb-10 flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-16 animate-pulse rounded-full bg-border"
          />
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <li
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
          >
            <div className="h-32 w-full animate-pulse rounded-xl bg-border" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-border" />
          </li>
        ))}
      </ul>
    </main>
  );
}
