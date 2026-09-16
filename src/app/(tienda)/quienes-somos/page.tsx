import FlameIcon from "@/components/FlameIcon";
import BadgesQuienesSomos from "@/components/BadgesQuienesSomos";
import RedesSocialesContacto from "@/components/RedesSocialesContacto";
import {
  obtenerContenidoQuienesSomos,
  obtenerNumeroWhatsApp,
  obtenerRedesSociales,
} from "@/lib/admin-db";

export const metadata = {
  title: "Quiénes somos | Fuego",
  description: "Quiénes somos — Fuego, velas artesanales.",
};

// El texto (historia, mensaje de la creadora, contacto) se edita
// desde /admin/quienes-somos y puede cambiar en cualquier momento, así
// que nunca se sirve cacheado.
export const dynamic = "force-dynamic";

export default async function QuienesSomosPage() {
  const [
    { historia, mensajeFundadora, nombreFundadora, contacto },
    redes,
    numeroWhatsApp,
  ] = await Promise.all([
    obtenerContenidoQuienesSomos(),
    obtenerRedesSociales(),
    obtenerNumeroWhatsApp(),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <FlameIcon className="h-8 w-8 text-ember" />
          <h1 className="font-serif text-3xl text-foreground">
            Quiénes somos
          </h1>
        </div>

        <BadgesQuienesSomos />

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            Nuestra historia
          </h2>
          <p className="leading-relaxed whitespace-pre-line text-muted">
            {historia}
          </p>
        </section>

        {/* Reemplaza la antigua sección "Nuestra misión" (decisión del
            dueño, 2026-09-16): un párrafo institucional de "misión" se
            sentía frío — una reseña breve y personal de quien hace las
            velas se lee más cercana. */}
        <section className="flex flex-col gap-3 rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/10 to-transparent p-6">
          <span aria-hidden="true" className="font-serif text-5xl leading-none text-ember/30">
            &ldquo;
          </span>
          <p className="-mt-4 font-serif text-lg leading-relaxed text-foreground italic whitespace-pre-line">
            {mensajeFundadora}
          </p>
          <p className="text-sm font-semibold text-ember">
            {nombreFundadora}, creadora de Fuego
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">Contacto</h2>
          <p className="leading-relaxed whitespace-pre-line text-muted">
            {contacto}
          </p>
          <RedesSocialesContacto
            instagram={redes.instagram}
            tiktok={redes.tiktok}
            numeroWhatsApp={numeroWhatsApp}
          />
        </section>
      </div>
    </main>
  );
}
