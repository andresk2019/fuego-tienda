import Link from 'next/link';
import { redirect } from 'next/navigation';
import { haySesion } from '@/lib/session';
import { obtenerPromociones } from '@/lib/promociones-db';
import { obtenerCatalogoFuego } from '@/lib/db';
import ListaPromociones from '@/components/admin/ListaPromociones';

export const dynamic = 'force-dynamic';

export default async function PromocionesPage() {
  if (!(await haySesion())) {
    redirect('/admin/login');
  }

  const [promociones, productos] = await Promise.all([
    obtenerPromociones(),
    obtenerCatalogoFuego({ conDescuento: false }),
  ]);
  // Para elegir qué productos quedan fuera del descuento — solo id y
  // nombre, en orden alfabético.
  const productosParaSelector = productos
    .map((p) => ({ id: p.id, nombre: p.nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

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
        encienden y se apagan solos. Si pones un porcentaje de descuento,
        se aplica de verdad a los precios de la tienda mientras la promo
        esté vigente; si lo dejas vacío, el banner solo anuncia.
      </p>

      <ListaPromociones
        promociones={promociones}
        productos={productosParaSelector}
      />
    </main>
  );
}
