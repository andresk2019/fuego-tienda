// Brasas y chispas doradas que suben lentamente — reemplaza al confeti
// del estilo "aniversario": es más sobrio y va con la marca (Fuego). CSS
// puro (ver subir-brasa en globals.css). Igual que antes, posiciones,
// tamaños y tiempos salen de una fórmula con el índice — no de
// Math.random() — para que el servidor y el navegador dibujen exactamente
// lo mismo (si no, React avisa de un error de hidratación). Es
// decorativo: no recibe clics ni lo anuncian los lectores de pantalla.
// Va dentro de un contenedor `relative`.
export default function Brasas({
  cantidad = 16,
  encima = false,
}: {
  cantidad?: number;
  // Por encima de las imágenes del contenedor (pero siempre debajo del
  // texto, que va en z-10) — para que las brasas también suban sobre una
  // foto, no solo sobre el fondo liso.
  encima?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${encima ? "z-[5]" : ""}`}
    >
      {Array.from({ length: cantidad }).map((_, i) => {
        const estilo = {
          left: `${(i * 53 + 7) % 100}%`,
          // Tamaños de 2 a 5 px, la mayoría chicos.
          "--tam": `${2 + ((i * 5) % 4)}px`,
          // Retraso negativo: al cargar, las brasas ya van a media subida
          // en vez de arrancar todas desde abajo.
          "--retraso": `${-((i * 11) % 14)}s`,
          "--duracion": `${9 + ((i * 7) % 8)}s`,
          "--deriva": `${((i % 5) - 2) * 16}px`,
          "--intensidad": `${0.55 + ((i * 3) % 5) * 0.1}`,
        } as React.CSSProperties;
        return <span key={i} className="brasa" style={estilo} />;
      })}
    </div>
  );
}
