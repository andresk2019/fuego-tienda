import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { CarritoProvider } from "@/components/CarritoContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Tipografía serif con carácter para el nombre de la marca y los
// títulos de producto — le da un aire artesanal/boutique frente al
// sans-serif genérico del resto del texto.
const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const TITULO = "Fuego | Velas artesanales";
const DESCRIPCION = "Catálogo de velas artesanales de Fuego.";

export const metadata: Metadata = {
  // Necesario para que el og:image (generado por convención de
  // archivo en opengraph-image.png) se anuncie con URL absoluta —
  // WhatsApp/Instagram/Facebook no cargan bien una ruta relativa.
  metadataBase: new URL("https://fuego-tienda.vercel.app"),
  title: TITULO,
  description: DESCRIPCION,
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    type: "website",
    locale: "es_CO",
  },
};

// Header/footer públicos ya NO viven aquí — se movieron al layout del
// grupo (tienda), para que /admin no los comparta (ver ese layout).
// Aquí solo queda lo verdaderamente global: fuentes, el carrito, y el
// esqueleto html/body.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <CarritoProvider>{children}</CarritoProvider>
      </body>
    </html>
  );
}
