import Image from "next/image";
import FlameIcon from "@/components/FlameIcon";

// El recuadro de foto grande de la página de producto — separado en
// su propio componente para que GaleriaFotosProducto.tsx pueda
// reusarlo tal cual (mismo recuadro, cambiando solo qué foto muestra
// según la miniatura elegida).
export default function ImagenProducto({
  fotoUrl,
  alt,
}: {
  fotoUrl: string | null;
  alt: string;
}) {
  return (
    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface">
      {fotoUrl ? (
        // object-contain (no object-cover): una foto que no sea
        // cuadrada se veía recortada — sobre todo fotos verticales de
        // celular, que perdían la parte de arriba/abajo. Con contain
        // se ve la foto completa, con un margen del mismo fondo si no
        // es cuadrada, en vez de adivinar qué parte recortar.
        <Image
          src={fotoUrl}
          alt={alt}
          width={600}
          height={600}
          className="h-full w-full object-contain"
          priority
        />
      ) : (
        <FlameIcon className="h-16 w-16 text-ember/30" />
      )}
    </div>
  );
}
