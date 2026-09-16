import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CarritoLateral from "@/components/CarritoLateral";

// Header/footer públicos — solo para las páginas de la tienda
// (portada, catálogo, producto, quiénes somos, carrito). El panel de
// administración (/admin) vive fuera de este grupo de rutas a
// propósito, con su propio layout, para que no comparta este menú:
// antes, hacer clic en "Catálogo" o "Inicio" desde /admin sacaba al
// dueño del panel sin darse cuenta.
export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <CarritoLateral />
    </>
  );
}
