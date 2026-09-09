// Esqueleto de la página de producto (misma forma en dos columnas que
// la real: foto a la izquierda, info a la derecha).
export default function CargandoProducto() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="h-4 w-32 animate-pulse rounded bg-border" />

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-border" />

        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-border" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-border" />
          <div className="h-6 w-28 animate-pulse rounded bg-border" />
          <div className="mt-2 h-20 w-full animate-pulse rounded bg-border" />
          <div className="mt-2 h-12 w-40 animate-pulse rounded-lg bg-border" />
        </div>
      </div>
    </main>
  );
}
