import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="flex flex-col items-center gap-2 border-t border-border px-6 py-8 text-center text-xs tracking-wide text-muted">
      <span>Fuego — velas artesanales, hechas a mano.</span>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link
          href="/cuidado-de-las-velas"
          className="underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          Cuidado de las velas
        </Link>
        <Link
          href="/politica-de-datos"
          className="underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          Política de tratamiento de datos
        </Link>
      </div>
    </footer>
  );
}
