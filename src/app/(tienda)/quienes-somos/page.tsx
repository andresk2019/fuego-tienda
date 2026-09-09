import FlameIcon from "@/components/FlameIcon";
import { obtenerContenidoQuienesSomos } from "@/lib/admin-db";

export const metadata = {
  title: "Quiénes somos | Fuego",
  description: "Quiénes somos — Fuego, velas artesanales.",
};

// El texto (historia, misión, contacto) se edita desde
// /admin/quienes-somos y puede cambiar en cualquier momento, así que
// nunca se sirve cacheado.
export const dynamic = "force-dynamic";

export default async function QuienesSomosPage() {
  const { historia, mision, contacto } = await obtenerContenidoQuienesSomos();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <FlameIcon className="h-8 w-8 text-ember" />
          <h1 className="font-serif text-3xl text-foreground">
            Quiénes somos
          </h1>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            Nuestra historia
          </h2>
          <p className="leading-relaxed whitespace-pre-line text-muted">
            {historia}
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            Nuestra misión
          </h2>
          <p className="leading-relaxed whitespace-pre-line text-muted">
            {mision}
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">Contacto</h2>
          <p className="leading-relaxed whitespace-pre-line text-muted">
            {contacto}
          </p>
        </section>
      </div>
    </main>
  );
}
