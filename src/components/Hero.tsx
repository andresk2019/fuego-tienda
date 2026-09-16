import Image from "next/image";
import Link from "next/link";
import FlameIcon from "@/components/FlameIcon";

// Banner de bienvenida en la portada, pensado para llamar la
// atención al entrar: fondo con un resplandor cálido (distinto del
// resto de la página), el logo (o el ícono de marca mientras no se
// suba uno real desde el panel de administración), y un botón que
// lleva a la página del catálogo completo (/catalogo).
//
// A propósito es más compacto que antes (menos relleno, logo más
// chico) — decisión del dueño, 2026-09-16: mientras más alto este
// banner, más scroll hace falta para llegar a "Las más vendidas"
// (ver CarruselDestacados.tsx), y las velas deben verse casi de
// inmediato al entrar, no después del banner completo.
export default function Hero({ logoUrl }: { logoUrl: string | null }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-ember/15 via-background to-background px-6 py-10 text-center sm:py-12">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt="Fuego"
          width={175}
          height={224}
          className="mx-auto h-20 w-auto sm:h-28"
          priority
        />
      ) : (
        <FlameIcon className="mx-auto h-12 w-12 text-ember" />
      )}

      <h1 className="mt-4 font-serif text-3xl text-foreground sm:text-4xl">
        Bienvenido a Fuego
      </h1>
      <p className="mx-auto mt-2 max-w-md text-muted">
        Velas artesanales hechas a mano, con aroma y personalidad propia.
      </p>

      <Link
        href="/catalogo"
        className="mt-5 inline-block rounded-lg bg-ember px-6 py-3 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
      >
        Ver catálogo
      </Link>
    </section>
  );
}
