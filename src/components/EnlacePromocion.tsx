import Link from "next/link";
import { esEnlaceInterno } from "@/lib/promociones";

// Rutas de la tienda van con <Link> (navegación sin recarga); las
// direcciones https externas, con <a> normal y rel seguro.
export default function EnlacePromocion({
  enlace,
  className,
  onClick,
  children,
}: {
  enlace: string;
  className?: string;
  // Solo para quien lo use desde un componente de cliente (ej. cerrar
  // el pop-up al hacer clic).
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (esEnlaceInterno(enlace)) {
    return (
      <Link href={enlace} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
