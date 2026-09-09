import type { ReactNode } from "react";
import InstagramIcon from "@/components/InstagramIcon";
import TikTokIcon from "@/components/TikTokIcon";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { linkInstagram, linkTikTok } from "@/lib/redes-sociales";

// Fila de íconos en la sección "Contacto" de Quiénes somos. Cada uno
// se arma con datos que el dueño escribe en /admin/quienes-somos (ver
// FormularioQuienesSomos) — si un campo está vacío, ese ícono
// simplemente no aparece, en vez de mostrar un link roto.
export default function RedesSocialesContacto({
  instagram,
  tiktok,
  numeroWhatsApp,
}: {
  instagram: string;
  tiktok: string;
  numeroWhatsApp: string | null;
}) {
  type Enlace = { nombre: string; href: string; icono: ReactNode };

  const candidatos: (Enlace | false)[] = [
    Boolean(numeroWhatsApp) && {
      nombre: "WhatsApp",
      href: `https://wa.me/${numeroWhatsApp}`,
      icono: <WhatsAppIcon className="h-6 w-6" />,
    },
    Boolean(instagram) && {
      nombre: "Instagram",
      href: linkInstagram(instagram),
      icono: <InstagramIcon className="h-6 w-6" />,
    },
    Boolean(tiktok) && {
      nombre: "TikTok",
      href: linkTikTok(tiktok),
      icono: <TikTokIcon className="h-6 w-6" />,
    },
  ];
  const enlaces = candidatos.filter((x): x is Enlace => x !== false);

  if (enlaces.length === 0) return null;

  return (
    <ul className="mt-1 flex items-center gap-4">
      {enlaces.map((enlace) => (
        <li key={enlace.nombre}>
          <a
            href={enlace.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={enlace.nombre}
            className="text-muted transition-colors hover:text-ember"
          >
            {enlace.icono}
          </a>
        </li>
      ))}
    </ul>
  );
}
