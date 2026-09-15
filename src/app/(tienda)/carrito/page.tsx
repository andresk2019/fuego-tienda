import { obtenerNumeroWhatsApp, obtenerConfigEnvio } from "@/lib/admin-db";
import CarritoCliente from "@/components/CarritoCliente";

// El número de WhatsApp y el costo de envío pueden cambiar en
// cualquier momento desde /admin (ver ConfigWhatsAppForm/
// ConfigEnvioForm), así que nunca se sirve cacheada.
export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  const [numeroWhatsApp, configEnvio] = await Promise.all([
    obtenerNumeroWhatsApp(),
    obtenerConfigEnvio(),
  ]);
  return (
    <CarritoCliente numeroWhatsApp={numeroWhatsApp} configEnvio={configEnvio} />
  );
}
