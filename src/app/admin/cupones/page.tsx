import Link from 'next/link';
import { redirect } from 'next/navigation';
import { haySesion } from '@/lib/session';
import { obtenerCupones } from '@/lib/cupones-db';
import ListaCupones from '@/components/admin/ListaCupones';

export const dynamic = 'force-dynamic';

export default async function CuponesPage() {
  if (!(await haySesion())) {
    redirect('/admin/login');
  }

  const cupones = await obtenerCupones();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Cupones</h1>
        <Link
          href="/admin"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Panel
        </Link>
      </div>

      <p className="mt-2 mb-6 text-sm text-muted">
        Crea cupones por temporada (ej. el cliente escribe FUEGO en el carrito
        y obtiene un descuento). El cupón se <strong>suma</strong> al
        descuento que el producto ya tenga (propio o de una promoción), pero
        el total nunca pasa del <strong>tope</strong> que pongas: con un cupón
        de 10% y tope de 20%, un producto sin descuento queda con 10%, uno con
        10% queda con 20%, uno con 15% queda con 20%, y uno con 20% o más no
        recibe nada del cupón. Se enciende y se apaga solo según las fechas.
      </p>

      <ListaCupones cupones={cupones} />
    </main>
  );
}
