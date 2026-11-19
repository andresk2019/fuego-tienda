// Marco decorativo del estilo "aniversario": un filete dorado fino
// separado del borde, con un rombo en cada esquina, y una línea de luz
// arriba y abajo. Solo es adorno (no recibe clics ni lo anuncian los
// lectores de pantalla). Va dentro de un contenedor `relative`.
export default function MarcoAniversario({
  redondeado = false,
}: {
  // Para tarjetas con esquinas redondeadas (pop-up, banners de la
  // portada): el marco acompaña la curva en vez de quedar recto.
  redondeado?: boolean;
}) {
  const esquina = "absolute h-1.5 w-1.5 rotate-45 bg-[#e9c46a]";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f6dc8f] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#e9c46a]/60 to-transparent" />
      <div
        className={`absolute inset-2.5 border border-[#e9c46a]/20 sm:inset-3.5 ${
          redondeado ? "rounded-xl" : ""
        }`}
      >
        <span className={`${esquina} -top-[3px] -left-[3px]`} />
        <span className={`${esquina} -top-[3px] -right-[3px]`} />
        <span className={`${esquina} -bottom-[3px] -left-[3px]`} />
        <span className={`${esquina} -right-[3px] -bottom-[3px]`} />
      </div>
    </div>
  );
}
