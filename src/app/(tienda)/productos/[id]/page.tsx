import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { obtenerProductoFuego, obtenerAromasDisponiblesFuego } from "@/lib/db";
import { esPersonalizable } from "@/lib/personalizacion";
import FlameIcon from "@/components/FlameIcon";
import FichaProducto from "@/components/FichaProducto";
import PersonalizarVela from "@/components/PersonalizarVela";
import AgregarAlCarrito from "@/components/AgregarAlCarrito";

// Igual que el catálogo: el stock puede cambiar en cualquier momento
// por una venta de mostrador en Contabilidad Lady, así que nunca se
// sirve cacheada.
export const dynamic = "force-dynamic";

export default async function ProductoPage(
  props: PageProps<"/productos/[id]">
) {
  const { id } = await props.params;
  // El segmento de la URL puede venir como "2" (link viejo) o como
  // "2-vela-estrella" (link nuevo, más profesional) — el nombre es
  // solo cosmético, el id sigue siendo lo único que de verdad importa
  // para buscar el producto. parseInt lee los dígitos del inicio y
  // descarta el resto; si no empieza con un número, es inválido.
  const idNumero = parseInt(id, 10);
  if (!Number.isInteger(idNumero)) notFound();

  const producto = await obtenerProductoFuego(idNumero);
  if (!producto) notFound();

  const personalizable = esPersonalizable(producto.id);
  const aromas = personalizable ? await obtenerAromasDisponiblesFuego() : [];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <Link
        href="/catalogo"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Foto del producto — si todavía no se ha subido una desde
            el panel de administración, se muestra el ícono de marca
            a modo de marcador. */}
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface">
          {producto.fotoUrl ? (
            <Image
              src={producto.fotoUrl}
              alt={producto.nombre}
              width={600}
              height={600}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <FlameIcon className="h-16 w-16 text-ember/30" />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <FichaProducto
            categoria={producto.categoria}
            nombre={producto.nombre}
            precioVenta={producto.precioVenta}
            disponible={producto.disponible}
            pocasUnidades={producto.pocasUnidades}
            descripcion={producto.descripcion}
          />

          {personalizable ? (
            <PersonalizarVela
              productoId={producto.id}
              nombre={producto.nombre}
              precioUnitario={producto.precioVenta}
              disponible={producto.disponible}
              aromas={aromas}
            />
          ) : (
            <div className="mt-2 border-t border-border pt-6">
              {producto.disponible ? (
                <AgregarAlCarrito
                  productoId={producto.id}
                  nombre={producto.nombre}
                  precioUnitario={producto.precioVenta}
                  disponible={producto.disponible}
                />
              ) : (
                <p className="text-sm text-danger">
                  Agotado — no se puede agregar al carrito por ahora.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
