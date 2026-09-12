import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerProductoFuego } from "@/lib/db";
import { obtenerFotosColorProducto } from "@/lib/admin-db";
import { AROMAS_DISPONIBLES, esPersonalizable } from "@/lib/personalizacion";
import { obtenerDescripcionesAromas } from "@/lib/aromas-db";
import ImagenProducto from "@/components/ImagenProducto";
import FichaProducto from "@/components/FichaProducto";
import GaleriaYPersonalizacion from "@/components/GaleriaYPersonalizacion";
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
  const esVela = producto.subcategoria === "velas";
  // Solo se necesita para velas — no vale la pena la consulta para
  // productos que ni siquiera muestran el selector de aroma. Las fotos
  // por color solo aplican a las velas personalizables.
  const [descripcionesAromas, fotosPorColor] = await Promise.all([
    esVela ? obtenerDescripcionesAromas() : Promise.resolve(undefined),
    personalizable
      ? obtenerFotosColorProducto(producto.id)
      : Promise.resolve({}),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <Link
        href="/catalogo"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        {personalizable ? (
          // La foto y el selector de color viven en un mismo
          // componente de cliente porque necesitan compartir el color
          // elegido — ver GaleriaYPersonalizacion.tsx.
          <GaleriaYPersonalizacion
            productoId={producto.id}
            nombre={producto.nombre}
            precioVenta={producto.precioVenta}
            categoria={producto.categoria}
            disponible={producto.disponible}
            pocasUnidades={producto.pocasUnidades}
            descripcion={producto.descripcion}
            fotoUrl={producto.fotoUrl}
            fotosPorColor={fotosPorColor}
            descripcionesAromas={descripcionesAromas}
          />
        ) : (
          <>
            <ImagenProducto fotoUrl={producto.fotoUrl} alt={producto.nombre} />

            <div className="flex flex-col gap-4">
              <FichaProducto
                categoria={producto.categoria}
                nombre={producto.nombre}
                precioVenta={producto.precioVenta}
                disponible={producto.disponible}
                pocasUnidades={producto.pocasUnidades}
                descripcion={producto.descripcion}
              />

              <div className="mt-2 border-t border-border pt-6">
                {producto.disponible ? (
                  <AgregarAlCarrito
                    productoId={producto.id}
                    nombre={producto.nombre}
                    precioUnitario={producto.precioVenta}
                    disponible={producto.disponible}
                    aromas={esVela ? AROMAS_DISPONIBLES : undefined}
                    descripcionesAromas={descripcionesAromas}
                  />
                ) : (
                  <p className="text-sm text-danger">
                    Agotado — no se puede agregar al carrito por ahora.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
