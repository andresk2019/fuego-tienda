const COLORES = ["#f6dc8f", "#d9662e", "#fff3c4", "#c9a24a", "#e8a66b"];

// Confeti cayendo (CSS puro, ver caer-confeti en globals.css). Las
// posiciones, tamaños y tiempos salen de una fórmula con el índice —
// no de Math.random() — para que el servidor y el navegador dibujen
// exactamente lo mismo (si no, React avisa de un error de hidratación).
// Es decorativo: no recibe clics ni lo anuncian los lectores de
// pantalla. Va dentro de un contenedor `relative`.
export default function Confeti({
  cantidad = 22,
  encima = false,
}: {
  cantidad?: number;
  // Por encima de las imágenes del contenedor (pero siempre debajo del
  // texto, que va en z-10) — para que el confeti también caiga sobre
  // una foto, no solo sobre el fondo liso.
  encima?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${encima ? "z-[5]" : ""}`}
    >
      {Array.from({ length: cantidad }).map((_, i) => {
        const estilo = {
          left: `${(i * 37 + 11) % 100}%`,
          width: 6 + (i % 3) * 2,
          height: 10 + (i % 3) * 3,
          backgroundColor: COLORES[i % COLORES.length],
          // Retraso negativo: al cargar, el confeti ya va a media caída
          // en vez de empezar todo desde arriba.
          "--retraso": `${-((i * 13) % 9)}s`,
          "--duracion": `${5 + ((i * 7) % 5)}s`,
          "--deriva": `${((i % 5) - 2) * 18}px`,
          "--giro": `${360 + (i % 4) * 120}deg`,
        } as React.CSSProperties;
        return <span key={i} className="confeti-pieza" style={estilo} />;
      })}
    </div>
  );
}
