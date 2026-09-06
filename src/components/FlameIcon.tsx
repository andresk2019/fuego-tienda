// Ícono de llama simple, inline (sin dependencias externas) — de relleno
// mientras no haya logo/fotos reales de producto.
export default function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.5 0.5c.6 3-1.9 4.6-3.4 6.8-1.7 2.4-2.1 5.7-.4 8.1 1 1.4 2.6 2.1 4.3 2.1 3 0 5.5-2.2 5.5-5.6 0-1.7-.7-3-1.6-4.3-.3.9-.9 1.7-1.7 2.2.2-3.4-1.2-6.6-2.7-9.3zM10.9 21.4c-2-.4-3.6-1.9-4.1-3.9-.6-2.3.2-4.4 1.6-6.1-.1 1.5.4 2.9 1.5 3.9.9.8 1.4 2 1.3 3.2-.1 1-.6 2-1.3 2.9z" />
    </svg>
  );
}
