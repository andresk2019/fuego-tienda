import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerProductoFuego, visibleEnTienda } from "@/lib/db";
import { obtenerGaleriaProducto } from "@/lib/admin-db";
import {
  obtenerResumenResenasDeProducto,
  obtenerResenasDeProducto,
} from "@/lib/resenas-db";
import { AROMAS_DISPONIBLES, esPersonalizable } from "@/lib/personalizacion";
import { obtenerDescripcionesAromas } from "@/lib/aromas-db";
import GaleriaFotosProducto from "@/components/GaleriaFotosProducto";
import RegistrarVistaProducto from "@/components/RegistrarVistaProducto";
import FichaProducto from "@/components/FichaProducto";
import PersonalizarVela from "@/components/PersonalizarVela";
import AgregarAlCarrito from "@/components/AgregarAlCarrito";
import ResenasProducto from "@/components/ResenasProducto";

// Igual que el catálogo: el stock puede cambiar en cualquier momento
// por una venta de mostrador en Contabilidad Lady, así que nunca se
// sirve cacheada.
export const dynamic = "force-dynamic";

// Antes, TODAS las páginas de producto compartían el mismo título
// genérico de la portada ("Fuego | Velas artesanales") — Google no
// tenía forma de distinguir una vela de otra en los resultados de
// búsqueda. Ahora cada una tiene su propio título y descripción (ver
// generateMetadata, docs/01-app/.../generate-metadata.md).
export async function generateMetadata(
  props: PageProps<"/productos/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const idNumero = parseInt(id, 10);
  if (!Number.isInteger(idNumero)) return {};

  const producto = await obtenerProductoFuego(idNumero);
  if (!producto || !visibleEnTienda(producto)) return {};

  // Tope de ~155 caracteres: es lo que Google suele mostrar de un
  // meta description antes de cortarlo — una descripción larga
  // escrita desde /admin no debería romper el resultado de búsqueda.
  const descripcion =
    producto.descripcion.length > 155
      ? `${producto.descripcion.slice(0, 152)}...`
      : producto.descripcion;
  const titulo = `${producto.nombre} | Fuego`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: titulo, description: descripcion },
  };
}

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
  // Sin precio todavía en Contabilidad Lady = no visible al público
  // (ver visibleEnTienda en db.ts) — se trata igual que "no existe",
  // así alguien con el link viejo no llega a una ficha con "$0".
  if (!producto || !visibleEnTienda(producto)) notFound();

  const personalizable = esPersonalizable(producto.id);
  const esVela = producto.subcategoria === "velas";
  // La galería de fotos aplica a CUALQUIER producto (no solo a los
  // personalizables) — ver GaleriaFotosProducto.tsx. Las reseñas
  // también son por producto — ver resenas-db.ts. Las descripciones
  // de aroma solo se necesitan para velas.
  const [descripcionesAromas, galeria, resumenResenas, resenas] =
    await Promise.all([
      esVela ? obtenerDescripcionesAromas() : Promise.resolve(undefined),
      obtenerGaleriaProducto(producto.id),
      obtenerResumenResenasDeProducto(producto.id),
      obtenerResenasDeProducto(producto.id),
    ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <RegistrarVistaProducto
        productoId={producto.id}
        nombre={producto.nombre}
        precioVenta={producto.precioVenta}
      />
      <Link
        href="/catalogo"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        <GaleriaFotosProducto
          fotoPrincipal={producto.fotoUrl}
          fotosGaleria={galeria.map((foto) => foto.fotoUrl)}
          alt={producto.nombre}
        />

        <div className="flex flex-col gap-4">
          <FichaProducto
            categoria={producto.categoria}
            nombre={producto.nombre}
            precioVenta={producto.precioVenta}
            disponible={producto.disponible}
            pocasUnidades={producto.pocasUnidades}
            descripcion={producto.descripcion}
            resumenResenas={resumenResenas}
            productoId={producto.id}
          />

          {esVela && (
            <Link
              href="/cuidado-de-las-velas"
              className="-mt-2 w-fit text-sm text-muted underline-offset-2 transition-colors hover:text-foreground hover:underline"
            >
              🕯️ Cómo cuidar esta vela →
            </Link>
          )}

          {personalizable ? (
            <PersonalizarVela
              productoId={producto.id}
              nombre={producto.nombre}
              precioUnitario={producto.precioVenta}
              disponible={producto.disponible}
              descripcionesAromas={descripcionesAromas}
              fotoUrl={producto.fotoUrl}
            />
          ) : (
            <div className="mt-2 border-t border-border pt-6">
              {producto.disponible ? (
                <AgregarAlCarrito
                  productoId={producto.id}
                  nombre={producto.nombre}
                  precioUnitario={producto.precioVenta}
                  disponible={producto.disponible}
                  aromas={esVela ? AROMAS_DISPONIBLES : undefined}
                  descripcionesAromas={descripcionesAromas}
                  fotoUrl={producto.fotoUrl}
                />
              ) : (
                <p className="text-sm text-danger">
                  Agotado — no se puede agregar al carrito por ahora.
                </p>
              )}
            </div>
          )}

          <ResenasProducto resenas={resenas} />
        </div>
      </div>
    </main>
  );
}
