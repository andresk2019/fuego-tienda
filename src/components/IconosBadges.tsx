// Íconos del banner de "Quiénes somos" (BadgesQuienesSomos.tsx) —
// inline, sin dependencias externas, mismo estilo de trazo simple que
// FlameIcon/WhatsAppIcon/CarritoIcon. Van juntos en un solo archivo
// porque los 4 solo se usan ahí, a diferencia de esos otros íconos
// que se reusan en varios lugares.

export function IconoArtesanal({ className }: { className?: string }) {
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
      <path d="M12 20.5s-7.5-4.6-9.8-9C.7 8 2 3.8 6.2 3.8c2.1 0 3.6 1.4 5.8 3.7 2.2-2.3 3.7-3.7 5.8-3.7 4.2 0 5.5 4.2 4 7.7-2.3 4.4-9.8 9-9.8 9Z" />
      <path d="M8.5 11.5 10 13l2-2 2 2 1.5-1.5" />
    </svg>
  );
}

export function IconoColombia({ className }: { className?: string }) {
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
      <path d="M12 21.5S5 14.8 5 9.5a7 7 0 1 1 14 0c0 5.3-7 12-7 12Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

export function IconoEcoamigable({ className }: { className?: string }) {
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
      {/* Hoja simple (globo+brote se veía como un candado a este
          tamaño — una sola hoja se reconoce mejor de lejos). */}
      <path d="M12 21c-5 0-8-4.5-8-10 0-4 3-8 8-8s8 4 8 8c0 5.5-3 10-8 10Z" />
      <path d="M12 3v18" />
    </svg>
  );
}

export function IconoReciclable({ className }: { className?: string }) {
  // Un arco + una flecha, repetido 3 veces girado 120° alrededor del
  // centro — el símbolo universal de reciclaje ("flechas persiguiéndose").
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
      <g>
        <path d="M12 5c2.8 0 5.3 1.6 6.5 4" />
        <path d="M17 6 19.2 8.6 16 9.4" />
      </g>
      <g transform="rotate(120 12 12)">
        <path d="M12 5c2.8 0 5.3 1.6 6.5 4" />
        <path d="M17 6 19.2 8.6 16 9.4" />
      </g>
      <g transform="rotate(240 12 12)">
        <path d="M12 5c2.8 0 5.3 1.6 6.5 4" />
        <path d="M17 6 19.2 8.6 16 9.4" />
      </g>
    </svg>
  );
}
