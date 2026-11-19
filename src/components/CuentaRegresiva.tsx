"use client";

import { useEffect, useState } from "react";
import { finDePromocion } from "@/lib/promociones";

function partes(ms: number) {
  const total = Math.floor(ms / 1000);
  return {
    dias: Math.floor(total / 86400),
    horas: Math.floor((total % 86400) / 3600),
    minutos: Math.floor((total % 3600) / 60),
    segundos: total % 60,
  };
}

const dos = (n: number) => String(n).padStart(2, "0");

function formatear(ms: number): string {
  const { dias, horas, minutos, segundos } = partes(ms);
  if (dias > 0) {
    return `${dias} ${dias === 1 ? "día" : "días"} ${horas} h ${minutos} min`;
  }
  return `${dos(horas)}:${dos(minutos)}:${dos(segundos)}`;
}

// Milisegundos que faltan para que termine la promo — null hasta estar
// en el navegador (el servidor no sabe qué hora es para el cliente, y
// dibujarla distinta rompería la hidratación).
function useRestante(fin: string): number | null {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const objetivo = finDePromocion(fin);
    const actualizar = () => setRestante(objetivo - Date.now());
    actualizar();
    const id = setInterval(actualizar, 1000);
    return () => clearInterval(id);
  }, [fin]);

  return restante;
}

// "Termina en 2 días 5 h 12 min" — con la fecha de fin de la promo (ver
// finDePromocion). No pinta nada hasta estar en el navegador ni cuando
// ya terminó.
export default function CuentaRegresiva({
  fin,
  prefijo = "Termina en",
  className,
}: {
  fin: string;
  prefijo?: string;
  className?: string;
}) {
  const restante = useRestante(fin);

  if (restante === null || restante <= 0) return null;

  return (
    <span className={className}>
      {prefijo} <span className="font-semibold tabular-nums">{formatear(restante)}</span>
    </span>
  );
}

// Versión en cajitas (DÍAS · HORAS · MIN · SEG) para el banner de
// aniversario: numerales grandes en serif con borde dorado fino. Antes de
// montarse reserva el mismo espacio con las cajas invisibles, para que al
// aparecer la cuenta no empuje el resto del banner hacia abajo.
export function CuentaRegresivaCajas({
  fin,
  chica = false,
}: {
  fin: string;
  chica?: boolean;
}) {
  const restante = useRestante(fin);
  if (restante !== null && restante <= 0) return null;

  const listo = restante !== null;
  const { dias, horas, minutos, segundos } = partes(listo ? restante : 0);
  const cajas: [string, number][] = [
    ["días", dias],
    ["horas", horas],
    ["min", minutos],
    ["seg", segundos],
  ];

  return (
    <div
      role="timer"
      aria-label={listo ? `Termina en ${formatear(restante)}` : "Cuenta regresiva"}
      className={`flex items-stretch gap-1.5 transition-opacity duration-500 sm:gap-2 ${
        listo ? "opacity-100" : "opacity-0"
      }`}
    >
      {cajas.map(([etiqueta, valor]) => (
        <div
          key={etiqueta}
          aria-hidden="true"
          className={`flex flex-col items-center rounded-md border border-[#e9c46a]/35 bg-black/30 shadow-[inset_0_1px_0_rgb(255_243_196/0.12)] backdrop-blur-sm ${
            chica ? "min-w-[2.6rem] px-1.5 py-1" : "min-w-[2.9rem] px-2 py-1.5 sm:min-w-[3.6rem] sm:py-2"
          }`}
        >
          <span
            className={`font-serif leading-none text-[#fff3c4] tabular-nums ${
              chica ? "text-lg" : "text-xl sm:text-3xl"
            }`}
          >
            {dos(valor)}
          </span>
          <span
            className={`mt-1 tracking-[0.2em] text-[#e9c46a]/85 uppercase ${
              chica ? "text-[8px]" : "text-[8px] sm:text-[9px]"
            }`}
          >
            {etiqueta}
          </span>
        </div>
      ))}
    </div>
  );
}
