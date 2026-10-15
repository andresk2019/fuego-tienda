import Link from "next/link";
import { esEnlaceInterno } from "@/lib/promociones";

// Rutas de la tienda van con <Link> (navegación sin recarga); las
// direcciones https externas, con <a> normal y rel seguro.
export default function EnlacePromocion({
  enlace,
  className,
  children,
}: {
  enlace: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (esEnlaceInterno(enlace)) {
    return (
      <Link href={enlace} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={enlace} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
