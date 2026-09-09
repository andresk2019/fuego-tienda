// Símbolo de Aries (los cuernos de carnero) — el signo zodiacal del
// elemento Fuego, para el logo del encabezado (SiteHeader.tsx). Es un
// símbolo astrológico universal (no un logo de marca de nadie), igual
// que el emblema del logo real subido desde el panel de admin (ver
// Hero.tsx) ya usa este mismo motivo dentro de su círculo.
export default function AriesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21v-9" />
      <path d="M12 12c-.3-4-1.8-7-4.5-7-2 0-3 1.4-2.3 2.8.6 1.1 1.8 1 1.8-.3" />
      <path d="M12 12c.3-4 1.8-7 4.5-7 2 0 3 1.4 2.3 2.8-.6 1.1-1.8 1-1.8-.3" />
    </svg>
  );
}
