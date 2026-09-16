import Link from "next/link";
import AriesIcon from "@/components/AriesIcon";
import CarritoIndicador from "@/components/CarritoIndicador";
import FavoritosIndicador from "@/components/FavoritosIndicador";
import MenuMovil from "@/components/MenuMovil";
import { ENLACES_NAV } from "@/lib/navegacion";

export default function SiteHeader() {
  return (
    <header className="border-b border-border px-6 py-4 md:py-14">
      {/* Fila compacta, solo en móvil: menú lateral a la izquierda,
          marca al centro, favoritos y carrito a la derecha. Los
          enlaces ya no se apretujan aquí — viven en el panel de
          MenuMovil.tsx. */}
      <div className="flex items-center justify-between md:hidden">
        <MenuMovil />
        <Link href="/" className="flex items-center gap-2">
          <AriesIcon className="h-6 w-6 text-ember" />
          <span className="font-serif text-lg text-foreground">Fuego</span>
        </Link>
        <div className="flex items-center gap-3">
          <FavoritosIndicador compacto />
          <CarritoIndicador compacto />
        </div>
      </div>

      {/* Header clásico, solo en escritorio: todo visible de una vez,
          sin necesidad de un menú lateral. */}
      <div className="hidden text-center md:block">
        <Link href="/" className="mx-auto flex flex-col items-center gap-3">
          <AriesIcon className="h-8 w-8 text-ember" />
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            Fuego
          </h1>
          <p className="text-sm tracking-[0.2em] text-muted uppercase">
            Velas artesanales
          </p>
        </Link>

        <nav
          aria-label="Principal"
          className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-medium text-muted"
        >
          {ENLACES_NAV.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="transition-colors hover:text-foreground"
            >
              {enlace.etiqueta}
            </Link>
          ))}
          <FavoritosIndicador />
          <CarritoIndicador />
        </nav>
      </div>
    </header>
  );
}
