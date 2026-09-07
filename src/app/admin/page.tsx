import { redirect } from 'next/navigation';
import { haySesion } from '@/lib/session';
import { obtenerCatalogoFuego } from '@/lib/db';
import { obtenerLogoUrl } from '@/lib/admin-db';
import { cerrarSesion } from './actions';
import SubirFotoForm from '@/components/admin/SubirFotoForm';
import SubirLogoForm from '@/components/admin/SubirLogoForm';

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

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">
          Panel de administración
        </h1>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      <SubirLogoForm logoUrl={logoUrl} />

      <p className="mt-2 text-sm text-muted">
        Sube o cambia la foto y la descripción de cada producto.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {productos.map((producto) => (
          <SubirFotoForm
            key={producto.id}
            productoId={producto.id}
            nombre={producto.nombre}
            fotoUrl={producto.fotoUrl}
            descripcion={producto.descripcion}
          />
        ))}
      </ul>
    </main>
  );
}
