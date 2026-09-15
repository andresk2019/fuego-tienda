import Image from "next/image";
import FlameIcon from "@/components/FlameIcon";

// Marco de foto reutilizable — antes cada vista (tarjeta de catálogo,
// carrusel de destacados, ficha de producto) repetía su propia copia
// de este marco por separado, y quedaban desincronizadas entre sí
// cada vez que había que ajustar algo (así se coló el problema de las
// fotos recortadas/con franjas: se arregló en un lugar y no en otro).
//
// Las fotos que sube el dueño desde /admin vienen en cualquier
// proporción (cuadradas, verticales, panorámicas — no hay ningún
// control sobre eso), así que ni recortar (object-cover, perdía
// contenido de la foto) ni dejar un color plano alrededor
// (object-contain solo, se veía como un espacio vacío/error) se ve
// bien para TODAS las proporciones a la vez. En vez de eso, se rellena
// todo el marco con la misma foto ampliada y difuminada de fondo, y la
// foto real —completa, sin recortar— va encima. Así cualquier
// proporción llena el marco de borde a borde y se ve intencional,
// nunca "rota" ni con espacios vacíos, sin importar qué tan distinta
// sea una foto de otra.
export default function FotoProducto({
  fotoUrl,
  alt,
  sizes,
  aspectClassName = "aspect-square",
  marcoClassName = "rounded-xl bg-background",
  iconClassName = "h-5 w-5 text-ember/30",
  prioridad = false,
}: {
  fotoUrl: string | null;
  alt: string;
  // Mismo prop `sizes` de next/image — obligatorio con `fill` para
  // que el navegador no asuma "ancho de toda la pantalla" y pida una
  // imagen más pesada de lo necesario.
  sizes: string;
  // Solo cambia la forma del marco (cuadrado por defecto) y sus
  // clases propias (radio de borde, fondo, borde) — el mecanismo de
  // difuminado de fondo es siempre el mismo.
  aspectClassName?: string;
  marcoClassName?: string;
  // El ícono de llama que se ve cuando el producto todavía no tiene
  // foto — algunas tarjetas lo quieren con hover propio (ver
  // TarjetaProducto.tsx, "group-hover"), así que es personalizable.
  iconClassName?: string;
  // Solo la foto grande de la ficha del producto (LCP de esa página)
  // debería marcarse como prioritaria — las miniaturas del catálogo
  // no.
  prioridad?: boolean;
}) {
  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden ${aspectClassName} ${marcoClassName}`}
    >
      {fotoUrl ? (
        <>
          <Image
            src={fotoUrl}
            alt=""
            aria-hidden="true"
            fill
            sizes={sizes}
            className="scale-125 object-cover opacity-70 blur-2xl"
          />
          <Image
            src={fotoUrl}
            alt={alt}
            fill
            sizes={sizes}
            className="object-contain"
            priority={prioridad}
          />
        </>
      ) : (
        <FlameIcon className={iconClassName} />
      )}
    </div>
  );
}
