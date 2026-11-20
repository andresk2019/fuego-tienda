import FlameIcon from "@/components/FlameIcon";
import SeguimientoPedido from "@/components/SeguimientoPedido";

export const metadata = {
  title: "¿Cómo va mi pedido? | Fuego",
  description: "Consulta el estado de tu pedido con tu número de pedido.",
  // Página privada de consulta: no tiene nada que posicionar en Google.
  robots: { index: false, follow: false },
};

// Nunca cacheada: el estado cambia cuando el dueño lo actualiza.
export const dynamic = "force-dynamic";

export default async function SeguimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string | string[] }>;
}) {
  const { pedido } = await searchParams;
  // Solo el NÚMERO de pedido puede venir en el enlace (para
  // prellenarlo); el teléfono nunca va en la URL.
  const numeroInicial = (Array.isArray(pedido) ? pedido[0] : pedido) ?? "";

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <FlameIcon className="h-8 w-8 text-ember" />
          <h1 className="font-serif text-3xl text-foreground">
            ¿Cómo va mi pedido?
          </h1>
          <p className="text-sm text-muted">
            Escribe tu número de pedido y el WhatsApp con el que lo hiciste.
            No necesitas crear una cuenta.
          </p>
        </div>
        <SeguimientoPedido numeroInicial={numeroInicial.slice(0, 40)} />
      </div>
    </main>
  );
}
