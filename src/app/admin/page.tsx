import { redirect } from 'next/navigation';
import { haySesion } from '@/lib/session';
import { cerrarSesion } from './actions';

// El proxy (src/proxy.ts) ya protege /admin/*, pero se vuelve a
// verificar aquí — nunca hay que confiar solo en el proxy (ver la
// guía de autenticación de Next.js: un cambio de matcher podría dejar
// una ruta desprotegida sin que se note).
export default async function AdminPage() {
  if (!(await haySesion())) {
    redirect('/admin/login');
  }

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

      <p className="mt-6 text-muted">
        Próximamente: gestión de fotos de producto.
      </p>
    </main>
  );
}
