// Ícono de corazón para "favoritos" — mismo estilo de trazo simple
// que el resto de íconos inline del proyecto (ver CarritoIcon.tsx).
// `llena` decide si se rellena (ya es favorito) o queda solo de
// contorno (todavía no).
export default function CorazonIcon({
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
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21s-7.5-4.35-10-9.5C.5 7.4 2.7 4 6.2 4c2 0 3.6 1.1 5.8 3.5C14.2 5.1 15.8 4 17.8 4c3.5 0 5.7 3.4 4.2 7.5-2.5 5.15-10 9.5-10 9.5Z" />
    </svg>
  );
}
