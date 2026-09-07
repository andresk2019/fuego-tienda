import Link from "next/link";
import FlameIcon from "@/components/FlameIcon";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <FlameIcon className="h-8 w-8 text-ember" />
      <h1 className="font-serif text-2xl text-foreground">
        No encontramos esta página
      </h1>
      <p className="text-muted">
        El producto que buscas no existe o ya no está publicado.
      </p>
      <Link
        href="/catalogo"
        className="mt-2 text-sm font-medium text-ember transition-colors hover:text-ember-hover"
      >
        ← Volver al catálogo
      </Link>
    </main>
  );
}
