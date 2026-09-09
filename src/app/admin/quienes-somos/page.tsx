import Link from 'next/link';
import { redirect } from 'next/navigation';
import { haySesion } from '@/lib/session';
import {
  obtenerContenidoQuienesSomos,
  obtenerNumeroWhatsApp,
  obtenerRedesSociales,
} from '@/lib/admin-db';
import FormularioQuienesSomos from '@/components/admin/FormularioQuienesSomos';

export const dynamic = 'force-dynamic';

export default async function QuienesSomosAdminPage() {
  if (!(await haySesion())) {
    redirect('/admin/login');
  }

  const [contenido, redes, numeroWhatsApp] = await Promise.all([
    obtenerContenidoQuienesSomos(),
    obtenerRedesSociales(),
    obtenerNumeroWhatsApp(),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">
          Quiénes somos
        </h1>
        <Link
          href="/admin"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Panel
        </Link>
      </div>

      <p className="mt-2 mb-6 text-sm text-muted">
        Este texto se muestra en la página pública{' '}
        <Link
          href="/quienes-somos"
          className="text-ember transition-colors hover:text-ember-hover"
        >
          /quienes-somos
        </Link>
        .
      </p>

      <FormularioQuienesSomos
        contenidoInicial={contenido}
        redesInicial={redes}
        numeroWhatsApp={numeroWhatsApp}
      />
    </main>
  );
}
