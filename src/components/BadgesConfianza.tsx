// Franja de confianza de la portada, con el mismo espíritu que suelen
// tener las tiendas boutique (3 puntos cortos con ícono). El texto de
// cada punto se ajustó a lo que es cierto hoy de Fuego (hecha a mano,
// pedido coordinado por WhatsApp, atención directa) — no se copiaron
// frases de la referencia que no aplican todavía (como pago con
// tarjeta en línea o envíos a todo el país, que no están confirmados).
const PUNTOS = [
  {
    titulo: "Hecha a mano",
    texto: "Cada vela es artesanal y única",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3c1.5 2.5-1 4-1 6a3 3 0 1 0 6 0c0-1-.5-2-1-3 1.5 1 3 3 3 5.5A5.5 5.5 0 0 1 13.5 17 5.5 5.5 0 0 1 8 11.5c0-3 2-5 4-8.5Z"
        />
      </svg>
    ),
  },
  {
    titulo: "Pide fácil por WhatsApp",
    texto: "Coordinamos tu pedido directo contigo",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 19l1.4-3.8A7.5 7.5 0 1 1 9 18.2Z"
        />
      </svg>
    ),
  },
  {
    titulo: "Atención personalizada",
    texto: "Hablas directo con quien hace tus velas",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m12 3 2.5 5.5 6 .7-4.4 4.1 1.1 6-5.2-3-5.2 3 1.1-6L3.5 9.2l6-.7Z"
        />
      </svg>
    ),
  },
];

export default function BadgesConfianza() {
  return (
    <section className="border-b border-border px-6 py-10">
      <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
        {PUNTOS.map((punto) => (
          <li
            key={punto.titulo}
            className="flex flex-col items-center gap-2 text-center"
          >
            <span className="h-7 w-7 text-ember">{punto.icono}</span>
            <h3 className="text-sm font-semibold text-foreground">
              {punto.titulo}
            </h3>
            <p className="text-xs text-muted">{punto.texto}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
