import {
  obtenerNumeroWhatsApp,
  obtenerConfigEnvio,
  obtenerConfigCompra,
} from "@/lib/admin-db";
import CarritoCliente from "@/components/CarritoCliente";

// El número de WhatsApp, el costo de envío, y la info de pago/entrega
// pueden cambiar en cualquier momento desde /admin (ver
// ConfigWhatsAppForm/ConfigEnvioForm/ConfigCompraForm), así que nunca
// se sirve cacheada.
export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  const [numeroWhatsApp, configEnvio, configCompra] = await Promise.all([
    obtenerNumeroWhatsApp(),
    obtenerConfigEnvio(),
    obtenerConfigCompra(),
  ]);
  return (
    <CarritoCliente
      numeroWhatsApp={numeroWhatsApp}
      configEnvio={configEnvio}
      configCompra={configCompra}
    />
  );
}
