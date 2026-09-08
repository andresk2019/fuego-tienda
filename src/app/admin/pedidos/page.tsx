import Link from 'next/link';
import { redirect } from 'next/navigation';
import { haySesion } from '@/lib/session';
import { obtenerPedidos } from '@/lib/pedidos-db';
import ListaPedidos from '@/components/admin/ListaPedidos';

// Igual que /admin: el proxy ya protege /admin/*, pero se vuelve a
// verificar aquí por si acaso.
export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
  if (!(await haySesion())) {
    redirect('/admin/login');
  }

  const pedidos = await obtenerPedidos();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Pedidos</h1>
        <Link
          href="/admin"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Panel
        </Link>
      </div>

      <p className="mt-2 text-sm text-muted">
        Cada pedido queda aquí cuando el cliente lo confirma en el carrito de
        la tienda, antes de escribir por WhatsApp. Esto no descuenta stock —
        eso lo sigues haciendo al registrar la venta en Contabilidad Lady.
      </p>

      <ListaPedidos pedidos={pedidos} />
    </main>
  );
}
