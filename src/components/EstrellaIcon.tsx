// Ícono de estrella, inline (sin dependencias externas) — para la
// calificación de las reseñas. `llena` decide si se rellena (color
// ember) o queda solo de contorno (color muted/border).
export default function EstrellaIcon({
  llena,
  className,
}: {
  llena: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={llena ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 3 2.5 5.5 6 .7-4.4 4.1 1.1 6-5.2-3-5.2 3 1.1-6L3.5 9.2l6-.7Z" />
    </svg>
  );
}
