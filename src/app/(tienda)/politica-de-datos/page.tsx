import FlameIcon from "@/components/FlameIcon";
import { obtenerNumeroWhatsApp } from "@/lib/admin-db";

export const metadata = {
  title: "Política de tratamiento de datos | Fuego",
  description:
    "Cómo Fuego recoge, usa y protege los datos personales de sus clientes.",
};

// Borrador inicial (2026-09-14) — cubre lo básico que exige la Ley
// 1581 de 2012 (Habeas Data) para un negocio pequeño que solo recoge
// nombre/teléfono/dirección para coordinar un pedido por WhatsApp. No
// reemplaza una revisión legal si el dueño quiere quedar 100%
// tranquilo, pero cubre el mínimo: qué se recoge, para qué, y cómo
// ejercer los derechos sobre esos datos.
//
// El número de WhatsApp se lee del mismo lugar que ya usa el carrito
// (obtenerNumeroWhatsApp) — si el dueño lo cambia desde /admin, esta
// página nunca queda con un contacto viejo.
export const dynamic = "force-dynamic";

export default async function PoliticaDeDatosPage() {
  const numeroWhatsApp = await obtenerNumeroWhatsApp();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <FlameIcon className="h-8 w-8 text-ember" />
          <h1 className="font-serif text-3xl text-foreground">
            Política de tratamiento de datos personales
          </h1>
          <p className="text-xs text-muted">
            Última actualización: 14 de septiembre de 2026
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <p className="leading-relaxed text-muted">
            En Fuego respetamos tu privacidad. Este documento explica qué
            datos personales recogemos cuando haces un pedido en esta
            tienda, para qué los usamos, y qué derechos tienes sobre
            ellos, en cumplimiento de la Ley 1581 de 2012 y el Decreto
            1377 de 2013 de Colombia.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            ¿Quién es el responsable?
          </h2>
          <p className="leading-relaxed text-muted">
            Fuego, marca de velas artesanales hechas a mano, es la
            responsable del tratamiento de los datos que recoge a
            través de esta tienda.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            ¿Qué datos recogemos?
          </h2>
          <p className="leading-relaxed text-muted">
            Únicamente los que escribes en el formulario del carrito al
            hacer un pedido: tu nombre, tu número de WhatsApp y la
            dirección de entrega. No te pedimos datos financieros ni
            ningún dato sensible.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            ¿Para qué los usamos?
          </h2>
          <p className="leading-relaxed text-muted">
            Únicamente para coordinar y entregar tu pedido: confirmarlo
            contigo por WhatsApp, saber a dónde llevarlo, y guardar un
            registro interno de tus compras (número de pedido, estado,
            productos). No usamos tus datos para enviarte publicidad no
            solicitada, ni los vendemos ni los compartimos con
            terceros.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            ¿Cómo los protegemos?
          </h2>
          <p className="leading-relaxed text-muted">
            Tus datos se guardan en una base de datos propia de la
            tienda, protegida y de acceso restringido — solo el dueño
            de Fuego puede verlos, desde el panel de administración.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            Tus derechos
          </h2>
          <p className="leading-relaxed text-muted">
            Como titular de tus datos, en cualquier momento puedes
            pedirnos:
          </p>
          <ul className="list-inside list-disc leading-relaxed text-muted">
            <li>Conocer qué datos tuyos tenemos guardados.</li>
            <li>Actualizarlos o corregirlos si están mal.</li>
            <li>Que los eliminemos de nuestros registros.</li>
            <li>Revocar la autorización que nos diste para usarlos.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            ¿Cómo ejercer estos derechos?
          </h2>
          <p className="leading-relaxed text-muted">
            Escríbenos por el mismo WhatsApp de la tienda contándonos
            qué necesitas, y lo resolvemos directamente contigo.
          </p>
          {numeroWhatsApp && (
            <a
              href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
                "Hola, quiero hacer una solicitud sobre mis datos personales."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-sm font-medium text-ember transition-colors hover:text-ember-hover"
            >
              Escribir por WhatsApp →
            </a>
          )}
        </section>
      </div>
    </main>
  );
}
