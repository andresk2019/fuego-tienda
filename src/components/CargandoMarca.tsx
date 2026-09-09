import FlameIcon from "@/components/FlameIcon";

// Estado de carga de marca — se usa como contenido de los loading.tsx
// en las páginas que dependen de la base de datos (que vive en otra
// región, ver pool.ts, así que la espera es real y perceptible). La
// llama parpadea suave (".animar-parpadeo" en globals.css) en vez de
// un spinner genérico, para que la espera se sienta intencional y
// parte de la marca en vez de una página congelada.
export default function CargandoMarca({
  texto = "Cargando...",
}: {
  texto?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <FlameIcon className="animar-parpadeo h-10 w-10 text-ember" />
      <p className="text-sm text-muted">{texto}</p>
    </div>
  );
}
