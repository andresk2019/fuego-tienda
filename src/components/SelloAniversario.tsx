import { useId } from "react";

// Medalla dorada del estilo "aniversario" (ej. "5" o "5 años"): un disco
// de oro con el lema de la marca girando muy despacio en el anillo y, al
// centro, la primera palabra grande y el resto chico. Es un SVG (escala
// sin perder nitidez) con un destello que lo cruza de vez en cuando (ver
// medalla-brillo en globals.css).
export default function SelloAniversario({
  texto,
  grande = false,
}: {
  texto: string;
  grande?: boolean;
}) {
  // ids únicos: puede haber varias medallas en la misma página (banner,
  // pop-up…) y un id repetido en un SVG hace que compartan el degradado.
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [primero, ...resto] = texto.trim().split(/\s+/);
  const segunda = resto.join(" ");

  // Que la palabra grande quepa en el círculo central aunque no sea un
  // número corto ("5" o "10" vs. "Gran").
  const tamanoNumero =
    primero.length <= 2 ? 36 : primero.length === 3 ? 28 : primero.length <= 5 ? 21 : 15;
  const tamanoSegunda = segunda.length > 9 ? 6 : 7.5;

  return (
    <span
      className={`sello-aniversario medalla relative inline-block shrink-0 overflow-hidden rounded-full ${
        grande ? "h-[4.75rem] w-[4.75rem] sm:h-28 sm:w-28" : "h-[4.25rem] w-[4.25rem]"
      }`}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-oro`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff3c4" />
            <stop offset="0.35" stopColor="#e9c46a" />
            <stop offset="0.7" stopColor="#a2731f" />
            <stop offset="1" stopColor="#f0d27a" />
          </linearGradient>
          <linearGradient id={`${id}-numero`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3c4" />
            <stop offset="1" stopColor="#e0b556" />
          </linearGradient>
          <radialGradient id={`${id}-centro`} cx="0.5" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#4a3216" />
            <stop offset="1" stopColor="#1f140a" />
          </radialGradient>
          <path
            id={`${id}-anillo`}
            d="M 60,60 m -44.5,0 a 44.5,44.5 0 1,1 89,0 a 44.5,44.5 0 1,1 -89,0"
          />
        </defs>

        {/* Disco de oro y sus filetes finos */}
        <circle cx="60" cy="60" r="58" fill={`url(#${id}-oro)`} />
        <circle cx="60" cy="60" r="55" fill="none" stroke="#2b1d0e" strokeOpacity="0.35" strokeWidth="0.8" />
        <circle cx="60" cy="60" r="36.5" fill="none" stroke="#2b1d0e" strokeOpacity="0.4" strokeWidth="0.8" />

        {/* Lema de la marca en el anillo: gira muy despacio */}
        <g className="anillo-giratorio">
          <text
            fill="#2b1d0e"
            fontSize="7.4"
            fontWeight="700"
            letterSpacing="1"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            <textPath
              href={`#${id}-anillo`}
              startOffset="0"
              textLength="276"
              lengthAdjust="spacing"
            >
              FUEGO ✦ VELAS ARTESANALES ✦
            </textPath>
          </text>
        </g>

        {/* Centro oscuro con la cifra */}
        <circle cx="60" cy="60" r="34.5" fill={`url(#${id}-centro)`} />
        <circle cx="60" cy="60" r="31.5" fill="none" stroke="#e9c46a" strokeOpacity="0.55" strokeWidth="0.7" />
        <text
          x="60"
          y={segunda ? 64 : 62 + tamanoNumero * 0.18}
          textAnchor="middle"
          fontSize={tamanoNumero}
          fontWeight="700"
          fill={`url(#${id}-numero)`}
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          {primero}
        </text>
        {segunda && (
          <text
            x="60"
            y="79"
            textAnchor="middle"
            fontSize={tamanoSegunda}
            fontWeight="600"
            letterSpacing="1.4"
            fill="#f6dc8f"
            style={{ fontFamily: "var(--font-display), Georgia, serif", textTransform: "uppercase" }}
          >
            {segunda}
          </text>
        )}
      </svg>
      <span aria-hidden="true" className="medalla-brillo" />
      {/* Texto real para lectores de pantalla (el del SVG está oculto). */}
      <span className="sr-only">{texto}</span>
    </span>
  );
}
