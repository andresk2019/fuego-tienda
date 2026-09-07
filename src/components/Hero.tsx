import Image from "next/image";
import Link from "next/link";
import FlameIcon from "@/components/FlameIcon";

// Banner de bienvenida en la portada, pensado para llamar la
// atención al entrar: fondo con un resplandor cálido (distinto del
// resto de la página), el logo en grande (o el ícono de marca
// mientras no se suba uno real desde el panel de administración), y
// un botón que lleva directo al catálogo de abajo.
export default function Hero({ logoUrl }: { logoUrl: string | null }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-ember/15 via-background to-background px-6 py-20 text-center">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt="Fuego"
          width={96}
          height={96}
          className="mx-auto h-20 w-20 rounded-full object-cover shadow-sm sm:h-24 sm:w-24"
          priority
        />
      ) : (
        <FlameIcon className="mx-auto h-16 w-16 text-ember" />
      )}

      <h1 className="mt-6 font-serif text-4xl text-foreground sm:text-5xl">
        Bienvenido a Fuego
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        Velas artesanales hechas a mano, con aroma y personalidad propia.
      </p>

      <Link
        href="#catalogo"
        className="mt-8 inline-block rounded-lg bg-ember px-6 py-3 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
      >
        Ver catálogo
      </Link>
    </section>
  );
}
