import Link from 'next/link';
import { redirect } from 'next/navigation';
import { haySesion } from '@/lib/session';
import { obtenerResenas } from '@/lib/resenas-db';
import ListaResenas from '@/components/admin/ListaResenas';

export const dynamic = 'force-dynamic';

export default async function ResenasPage() {
  if (!(await haySesion())) {
    redirect('/admin/login');
  }

  const resenas = await obtenerResenas();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Reseñas</h1>
        <Link
          href="/admin"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Panel
        </Link>
      </div>

      <p className="mt-2 mb-6 text-sm text-muted">
        Cárgalas a mano cuando un cliente te escriba algo bueno (ej. por
        WhatsApp) — solo las que marques &ldquo;Visible en portada&rdquo;
        aparecen en el inicio de la tienda.
      </p>

      <ListaResenas resenas={resenas} />
    </main>
  );
}
