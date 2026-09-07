import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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

export const metadata: Metadata = {
  title: "Fuego | Velas artesanales",
  description: "Catálogo de velas artesanales de Fuego.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <CarritoProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </CarritoProvider>
      </body>
    </html>
  );
}
