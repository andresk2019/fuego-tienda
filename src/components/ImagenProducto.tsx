import FotoProducto from "@/components/FotoProducto";

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
    <FotoProducto
      fotoUrl={fotoUrl}
      alt={alt}
      sizes="(max-width: 768px) 100vw, 600px"
      marcoClassName="rounded-2xl border border-border bg-surface"
      iconClassName="h-16 w-16 text-ember/30"
      prioridad
    />
  );
}
