// Ícono de TikTok, inline (sin dependencias externas) — mismo trazo
// que usan las librerías de íconos abiertas (Simple Icons, licencia
// CC0), igual que WhatsAppIcon/InstagramIcon.
export default function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.6 5.82c-.9-.88-1.4-2.1-1.4-3.4h-3.28v13.35c0 1.61-1.31 2.92-2.92 2.92a2.92 2.92 0 0 1-2.92-2.92 2.92 2.92 0 0 1 2.92-2.92c.3 0 .59.05.86.13V9.6a6.2 6.2 0 0 0-.86-.06A6.2 6.2 0 0 0 3 15.75 6.2 6.2 0 0 0 9.2 21.9a6.2 6.2 0 0 0 6.2-6.15V9.02a8.9 8.9 0 0 0 5.2 1.67V7.4a5.3 5.3 0 0 1-3.99-1.58Z" />
    </svg>
  );
}
