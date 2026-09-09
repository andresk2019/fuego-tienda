import Link from 'next/link';
import { redirect } from 'next/navigation';
import { haySesion } from '@/lib/session';
import { obtenerCatalogoFuego } from '@/lib/db';
import { obtenerLogoUrl } from '@/lib/admin-db';
import { esPersonalizable } from '@/lib/personalizacion';
import { cerrarSesion } from './actions';
import SubirLogoForm from '@/components/admin/SubirLogoForm';
import ListaProductosAdmin from '@/components/admin/ListaProductosAdmin';

// El proxy (src/proxy.ts) ya protege /admin/*, pero se vuelve a
// verificar aquí — nunca hay que confiar solo en el proxy (ver la
// guía de autenticación de Next.js: un cambio de matcher podría dejar
// una ruta desprotegida sin que se note).
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await haySesion())) {
    redirect('/admin/login');
  }

  const [productos, logoUrl] = await Promise.all([
    obtenerCatalogoFuego(),
    obtenerLogoUrl(),
  ]);

  const productosParaAdmin = productos.map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    precioVenta: producto.precioVenta,
    categoria: producto.categoria,
    subcategoria: producto.subcategoria,
    disponible: producto.disponible,
    pocasUnidades: producto.pocasUnidades,
    personalizable: esPersonalizable(producto.id),
    fotoUrl: producto.fotoUrl,
    descripcion: producto.descripcion,
    destacado: producto.destacado,
  }));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">
          Panel de administración
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pedidos"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Pedidos
          </Link>
          <Link
            href="/admin/resenas"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Reseñas
          </Link>
          <Link
            href="/admin/aromas"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Aromas
          </Link>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6">
        <SubirLogoForm logoUrl={logoUrl} />
      </div>

      <p className="mb-2 text-sm text-muted">
        Sube o cambia la foto y la descripción de cada producto.
      </p>

      <ListaProductosAdmin productos={productosParaAdmin} />
    </main>
  );
}
