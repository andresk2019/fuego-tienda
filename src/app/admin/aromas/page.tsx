import Link from 'next/link';
import { redirect } from 'next/navigation';
import { haySesion } from '@/lib/session';
import { obtenerDescripcionesAromas } from '@/lib/aromas-db';
import ListaAromas from '@/components/admin/ListaAromas';

export const dynamic = 'force-dynamic';

export default async function AromasPage() {
  if (!(await haySesion())) {
    redirect('/admin/login');
  }

  const descripciones = await obtenerDescripcionesAromas();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Aromas</h1>
        <Link
          href="/admin"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Panel
        </Link>
      </div>

      <p className="mt-2 mb-6 text-sm text-muted">
        La descripción de cada aroma se muestra en la tienda cuando el
        cliente lo elige en el desplegable de una vela — así puede saber
        qué esperar de cada uno antes de comprar.
      </p>

      <ListaAromas descripciones={descripciones} />
    </main>
  );
}
