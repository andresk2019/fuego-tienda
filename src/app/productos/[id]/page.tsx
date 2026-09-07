import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerProductoFuego, obtenerAromasDisponiblesFuego } from "@/lib/db";
import { nombreCategoria } from "@/lib/categorias";
import {
  esPersonalizable,
  LONGITUD_MAXIMA_NOMBRE_SECRETO,
} from "@/lib/personalizacion";
import FlameIcon from "@/components/FlameIcon";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// Igual que el catálogo: el stock puede cambiar en cualquier momento
// por una venta de mostrador en Contabilidad Lady, así que nunca se
// sirve cacheada.
export const dynamic = "force-dynamic";

export default async function ProductoPage(
  props: PageProps<"/productos/[id]">
) {
  const { id } = await props.params;
  const idNumero = Number(id);
  if (!Number.isInteger(idNumero)) notFound();

  const producto = await obtenerProductoFuego(idNumero);
  if (!producto) notFound();

  const personalizable = esPersonalizable(producto.id);
  const aromas = personalizable ? await obtenerAromasDisponiblesFuego() : [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link
        href="/"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Volver al catálogo
      </Link>

      <article className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-8">
        <FlameIcon className="h-8 w-8 text-ember" />

        <span className="w-fit rounded-full border border-border px-3 py-1 text-xs tracking-wide text-muted uppercase">
          {nombreCategoria(producto.categoria)}
        </span>

        <h1 className="font-serif text-3xl text-foreground">
          {producto.nombre}
        </h1>

        <p className="text-2xl font-semibold text-foreground">
          {formatoCOP.format(producto.precioVenta)}
        </p>

        {!producto.disponible && (
          <span className="inline-flex w-fit rounded-full bg-danger/10 px-3 py-1 text-sm font-medium text-danger">
            Agotado
          </span>
        )}
        {producto.disponible && producto.pocasUnidades && (
          <span className="inline-flex w-fit rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
            ¡Últimas unidades!
          </span>
        )}

        <p className="leading-relaxed text-muted">{producto.descripcion}</p>

        {personalizable && (
          <div className="mt-2 flex flex-col gap-4 border-t border-border pt-6">
            <h2 className="font-serif text-xl text-foreground">
              Personaliza tu vela
            </h2>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Aroma</span>
              {aromas.length > 0 ? (
                <select className="rounded-lg border border-border bg-background px-3 py-2 text-foreground">
                  {aromas.map((aroma) => (
                    <option key={aroma} value={aroma}>
                      {aroma}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-muted">
                  No hay aromas disponibles por ahora.
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Color</span>
              <select
                disabled
                className="rounded-lg border border-border bg-background px-3 py-2 text-muted"
              >
                <option>Colores: por definir</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">
                Nombre secreto (opcional)
              </span>
              <input
                type="text"
                maxLength={LONGITUD_MAXIMA_NOMBRE_SECRETO}
                placeholder="Ej: Feliz cumpleaños, Andrés, Leidy..."
                className="rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted/60"
              />
              <span className="text-xs text-muted">
                Un nombre o una frase breve (máximo{" "}
                {LONGITUD_MAXIMA_NOMBRE_SECRETO} caracteres).
              </span>
            </label>

            <p className="text-xs text-muted italic">
              Cuéntanos tu personalización al hacer tu pedido.
            </p>
          </div>
        )}
      </article>
    </main>
  );
}
