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
    </header>
  );
}
