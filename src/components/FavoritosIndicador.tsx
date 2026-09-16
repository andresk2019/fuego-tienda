"use client";

import Link from "next/link";
import { useFavoritos } from "@/components/FavoritosContext";
import CorazonIcon from "@/components/CorazonIcon";

// Mismo patrón que CarritoIndicador.tsx: contador superpuesto en la
// esquina del ícono, para que se note de una vez cuántos favoritos
// tiene guardados sin tener que entrar a /favoritos.
export default function FavoritosIndicador({
  compacto = false,
}: {
  compacto?: boolean;
}) {
  const { favoritos } = useFavoritos();
  const cantidad = favoritos.length;

  return (
    <Link
      href="/favoritos"
      aria-label="Ver favoritos"
      className="flex items-center gap-1.5 transition-colors hover:text-foreground"
    >
      <span className="relative">
        <CorazonIcon llena={false} className="h-5 w-5" />
        {cantidad > 0 && (
          <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-semibold text-on-ember">
            {cantidad}
          </span>
        )}
      </span>
      {!compacto && "Favoritos"}
    </Link>
  );
}
