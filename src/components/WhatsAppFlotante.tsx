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
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-on-ember shadow-lg transition-colors hover:bg-whatsapp-hover sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-3 sm:text-sm sm:font-semibold"
    >
      <WhatsAppIcon className="h-6 w-6 shrink-0 sm:h-5 sm:w-5" />
      {/* En celular solo el círculo con el ícono: la píldora con texto
          (217px) tapaba la mitad de los botones de "Agregar al carrito". */}
      <span className="hidden sm:inline">Atención personalizada</span>
    </a>
  );
}
