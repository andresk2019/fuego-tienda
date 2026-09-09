import FlameIcon from "@/components/FlameIcon";
import BadgesQuienesSomos from "@/components/BadgesQuienesSomos";

export const metadata = {
  title: "Quiénes somos | Fuego",
  description: "Quiénes somos — Fuego, velas artesanales.",
};

// Página de prueba: contenido de relleno mientras el dueño define el
// texto real de "Quiénes somos" (historia de la marca, misión, fotos
// del taller, etc.). Reemplazar todo el contenido de este archivo
// cuando haya copy definitivo.
export default function QuienesSomosPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex flex-col gap-6">
        <span className="w-fit rounded-full border border-border px-3 py-1 text-xs tracking-wide text-muted uppercase">
          Contenido de prueba
        </span>

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
          <p className="leading-relaxed text-muted">
            Este es un texto de prueba. Aquí va la historia real de Fuego:
            cómo empezó la marca, quién la hace y qué la hace especial.
            Reemplazar por el contenido definitivo.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            Nuestra misión
          </h2>
          <p className="leading-relaxed text-muted">
            Otro texto de prueba. Aquí puede ir qué hace únicas a las velas
            de Fuego: materiales, proceso artesanal, valores de la marca.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">Contacto</h2>
          <p className="leading-relaxed text-muted">
            Texto de prueba también — aquí podría ir el WhatsApp, redes
            sociales o correo de contacto de Fuego, más adelante.
          </p>
        </section>
      </div>
    </main>
  );
}
