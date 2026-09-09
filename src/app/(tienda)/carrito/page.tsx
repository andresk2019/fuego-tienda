import { obtenerNumeroWhatsApp } from "@/lib/admin-db";
import CarritoCliente from "@/components/CarritoCliente";

// El número de WhatsApp puede cambiar en cualquier momento desde
// /admin (ver ConfigWhatsAppForm), así que nunca se sirve cacheada.
export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  const numeroWhatsApp = await obtenerNumeroWhatsApp();
  return <CarritoCliente numeroWhatsApp={numeroWhatsApp} />;
}
