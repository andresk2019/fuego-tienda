import Link from 'next/link';
import { redirect } from 'next/navigation';
import { haySesion } from '@/lib/session';
import { obtenerPromociones } from '@/lib/promociones-db';
import ListaPromociones from '@/components/admin/ListaPromociones';

export const dynamic = 'force-dynamic';

export default async function PromocionesPage() {
  if (!(await haySesion())) {
    redirect('/admin/login');
  }

  const promociones = await obtenerPromociones();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Promociones</h1>
        <Link
          href="/admin"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Panel
        </Link>
      </div>

      <p className="mt-2 mb-6 text-sm text-muted">
        Crea banners para fechas especiales (Black Friday, Navidad, Día de la
        Madre...). Puedes programarlos con fecha de inicio y fin: se
        encienden y se apagan solos. Son solo visuales — no cambian los
        precios.
      </p>

      <ListaPromociones promociones={promociones} />
    </main>
  );
}
