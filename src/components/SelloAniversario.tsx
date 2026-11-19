// Sello dorado redondo del estilo "aniversario" (ej. "5 años"): la
// primera palabra grande, el resto chico. Aparece con un pequeño
// rebote y luego late suave (ver sello-aniversario en globals.css).
export default function SelloAniversario({
  texto,
  grande = false,
}: {
  texto: string;
  grande?: boolean;
}) {
  const [primero, ...resto] = texto.split(" ");
  return (
    <span
      className={`sello-aniversario inline-flex shrink-0 flex-col items-center justify-center rounded-full border-2 border-[#fff3c4] bg-gradient-to-br from-[#f0d27a] to-[#a2731f] text-center font-serif font-bold text-[#2b1d0e] shadow-lg ${
        grande ? "h-20 w-20" : "h-16 w-16"
      }`}
    >
      <span className={`leading-none ${grande ? "text-2xl" : "text-xl"}`}>
        {primero}
      </span>
      {resto.length > 0 && (
        <span className="mt-0.5 text-[10px] leading-none tracking-wide uppercase">
          {resto.join(" ")}
        </span>
      )}
    </span>
  );
}
