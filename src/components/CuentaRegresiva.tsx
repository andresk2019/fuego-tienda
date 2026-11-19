"use client";

import { useEffect, useState } from "react";
import { finDePromocion } from "@/lib/promociones";

function formatear(ms: number): string {
  const total = Math.floor(ms / 1000);
  const dias = Math.floor(total / 86400);
  const horas = Math.floor((total % 86400) / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segundos = total % 60;
  if (dias > 0) {
    return `${dias} ${dias === 1 ? "día" : "días"} ${horas} h ${minutos} min`;
  }
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${dos(horas)}:${dos(minutos)}:${dos(segundos)}`;
}

// "Termina en 2 días 5 h 12 min" — con la fecha de fin de la promo (ver
// finDePromocion). No pinta nada hasta estar en el navegador (el
// servidor no sabe qué hora es para el cliente, y dibujarla distinta
// rompería la hidratación) ni cuando ya terminó.
export default function CuentaRegresiva({
  fin,
  prefijo = "Termina en",
  className,
}: {
  fin: string;
  prefijo?: string;
  className?: string;
}) {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const objetivo = finDePromocion(fin);
    const actualizar = () => setRestante(objetivo - Date.now());
    actualizar();
    const id = setInterval(actualizar, 1000);
    return () => clearInterval(id);
  }, [fin]);

  if (restante === null || restante <= 0) return null;

  return (
    <span className={className}>
      {prefijo} <span className="font-semibold tabular-nums">{formatear(restante)}</span>
    </span>
  );
}
