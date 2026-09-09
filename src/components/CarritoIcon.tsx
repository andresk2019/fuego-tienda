// Ícono de carrito de compras, inline (sin dependencias externas) —
// trazo de línea simple y moderno, el mismo diseño que usan
// librerías de íconos abiertas tipo Feather (licencia MIT). Se
// reconoce como "carrito" al instante, a diferencia de una bolsa o un
// ícono más abstracto.
export default function CarritoIcon({ className }: { className?: string }) {
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
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
