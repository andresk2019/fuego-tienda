import Link from "next/link";
import AriesIcon from "@/components/AriesIcon";
import CarritoIndicador from "@/components/CarritoIndicador";
import FavoritosIndicador from "@/components/FavoritosIndicador";
import MenuMovil from "@/components/MenuMovil";
import { ENLACES_NAV } from "@/lib/navegacion";

export default function SiteHeader() {
  // Ninguna de las 2 barras de abajo puede vivir anidada dentro de un
  // <header> propio: `position: sticky` solo se queda pegado
  // mientras el CONTENEDOR DIRECTO del elemento siga a la vista — un
  // <header> que solo envuelve el logo/lema (un bloque bajito) se
  // termina de desplazar casi enseguida, así que el sticky se
  // "soltaba" apenas se bajaba un poco. Al quedar como hermanas
  // sueltas directas de <body> (que sí mide lo que mide toda la
  // página), tienen de sobra dónde quedarse fijas mientras se
  // recorre el resto del catálogo.
  return (
    <>
      {/* Fila compacta, solo en móvil: menú lateral a la izquierda,
          marca al centro, favoritos y carrito a la derecha. Los
          enlaces ya no se apretujan aquí — viven en el panel de
          MenuMovil.tsx.
          `sticky top-0`: antes, al bajar a ver el catálogo, esta fila
          (y con ella el botón del menú, favoritos y carrito) se
          perdía de vista y había que volver a subir hasta el inicio
          para acceder a cualquiera de los 3 — ahora se queda fija
          arriba todo el tiempo. */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-6 py-4 md:hidden">
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

      {/* Bloque de marca, solo en escritorio (logo, nombre, lema): se
          ve una sola vez arriba de todo y se pierde de vista al
          bajar, a propósito — lo que se queda fijo es solo el <nav>
          de aquí abajo, sin arrastrar este logo grande con él. */}
      <div className="hidden px-6 pt-14 pb-6 text-center md:block">
        <Link href="/" className="mx-auto flex flex-col items-center gap-3">
          <AriesIcon className="h-8 w-8 text-ember" />
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            Fuego
          </h1>
          <p className="text-sm tracking-[0.2em] text-muted uppercase">
            Velas artesanales
          </p>
        </Link>
      </div>

      {/* <nav> de escritorio: sticky por su cuenta, así el cliente
          siempre tiene a mano el menú, favoritos y carrito sin tener
          que subir hasta el inicio de la página. */}
      <nav
        aria-label="Principal"
        className="sticky top-0 z-30 hidden flex-wrap items-center justify-center gap-6 border-b border-border bg-background px-6 py-4 text-sm font-medium text-muted md:flex"
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
        {/* Favoritos y carrito van agrupados aparte, con una línea
            divisoria — son acciones sobre la compra, no páginas del
            sitio, así que no deberían mezclarse visualmente con el
            resto de los enlaces (decisión del dueño, 2026-09-16). */}
        <div className="flex items-center gap-5 border-l border-border pl-6">
          <FavoritosIndicador />
          <CarritoIndicador />
        </div>
      </nav>
    </>
  );
}
