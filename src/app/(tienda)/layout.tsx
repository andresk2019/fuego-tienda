import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CarritoLateral from "@/components/CarritoLateral";
import CarritoFlotante from "@/components/CarritoFlotante";
import WhatsAppFlotante from "@/components/WhatsAppFlotante";
import { obtenerNumeroWhatsApp } from "@/lib/admin-db";

// Header/footer públicos — solo para las páginas de la tienda
// (portada, catálogo, producto, quiénes somos, carrito). El panel de
// administración (/admin) vive fuera de este grupo de rutas a
// propósito, con su propio layout, para que no comparta este menú:
// antes, hacer clic en "Catálogo" o "Inicio" desde /admin sacaba al
// dueño del panel sin darse cuenta.
//
// El número de WhatsApp se busca aquí (una sola vez para todo el
// grupo) para que el botón flotante aparezca en cualquier página de
// la tienda, no solo en el carrito. Como puede cambiar en cualquier
// momento desde /admin, el layout completo queda dinámico — el mismo
// trato que ya tienen casi todas las páginas de este grupo.
export const dynamic = "force-dynamic";

export default async function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const numeroWhatsApp = await obtenerNumeroWhatsApp();

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <CarritoLateral />
      <CarritoFlotante />
      <WhatsAppFlotante numeroWhatsApp={numeroWhatsApp} />
    </>
  );
}
