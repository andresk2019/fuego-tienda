import Link from "next/link";
import FlameIcon from "@/components/FlameIcon";

export default function SiteHeader() {
  return (
    <header className="border-b border-border px-6 py-14 text-center">
      <Link href="/" className="mx-auto flex flex-col items-center gap-3">
        <FlameIcon className="h-8 w-8 text-ember" />
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
        <Link
          href="/quienes-somos"
          className="transition-colors hover:text-foreground"
        >
          Quiénes somos
        </Link>
        <Link
          href="/"
          className="transition-colors hover:text-foreground"
        >
          Catálogo
        </Link>
      </nav>
    </header>
  );
}
