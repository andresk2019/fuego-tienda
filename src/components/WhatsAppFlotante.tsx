import WhatsAppIcon from "@/components/WhatsAppIcon";

// Botón fijo, visible en cualquier página de la tienda (no solo en el
// carrito) — para que el cliente pueda escribirle al vendedor en
// cualquier momento, incluso si todavía no agregó nada al carrito. El
// mensaje es genérico a propósito: este botón no depende de qué
// producto se esté viendo. Es un componente de servidor simple (sin
// estado ni interacción más allá del link), así que no necesita
// "use client".
export default function WhatsAppFlotante({
  numeroWhatsApp,
}: {
  numeroWhatsApp: string | null;
}) {
  if (!numeroWhatsApp) return null;

  const mensaje = encodeURIComponent(
    "¡Hola! Quiero más información sobre sus productos."
  );

  return (
    <a
      href={`https://wa.me/${numeroWhatsApp}?text=${mensaje}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-semibold text-on-ember shadow-lg transition-colors hover:bg-whatsapp-hover"
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      <span>Atención personalizada</span>
    </a>
  );
}
