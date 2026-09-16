// Ícono de "cerrar" (X) — se usa tanto en el menú lateral móvil como
// en el carrito lateral, mismo estilo de trazo simple que el resto de
// íconos inline del proyecto (ver CarritoIcon.tsx).
export default function CerrarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
