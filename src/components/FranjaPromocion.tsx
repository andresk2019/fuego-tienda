import EnlacePromocion from "@/components/EnlacePromocion";
import CuentaRegresiva from "@/components/CuentaRegresiva";
import type { Promocion } from "@/lib/promociones";

// Franja delgada arriba de todo el sitio con la promo vigente (ver
// obtenerPromocionFranja en promociones-db.ts) — una sola línea, así
// que solo cabe una promo a la vez. Si no hay ninguna vigente, no se
// renderiza nada. En el estilo "aniversario" va dorada, con un destello
// que la recorre.
export default function FranjaPromocion({
  promocion,
}: {
  promocion: Promocion | null;
}) {
  if (!promocion) return null;

  const esAniversario = promocion.estilo === "aniversario";

  const contenido = (
    <>
      {esAniversario && <span aria-hidden="true">✦ </span>}
      <span className="font-semibold">{promocion.titulo}</span>
      {promocion.texto && <span className="opacity-90"> — {promocion.texto}</span>}
      {promocion.fin && (
        <CuentaRegresiva
          fin={promocion.fin}
          prefijo=" · Termina en"
          className="whitespace-nowrap"
        />
      )}
      {promocion.enlace && <span aria-hidden="true"> →</span>}
      {esAniversario && <span aria-hidden="true"> ✦</span>}
    </>
  );

  const clases = esAniversario
    ? "franja-aniversario block bg-gradient-to-r from-[#8a6420] via-[#d4af5a] to-[#8a6420] px-4 py-2 text-center text-xs text-[#2b1d0e] sm:text-sm"
    : "block bg-ember px-4 py-2 text-center text-xs text-on-ember sm:text-sm";
  const hover = esAniversario ? "hover:brightness-110" : "hover:bg-ember-hover";

  return promocion.enlace ? (
    <EnlacePromocion enlace={promocion.enlace} className={`${clases} ${hover}`}>
      {contenido}
    </EnlacePromocion>
  ) : (
    <p className={clases}>{contenido}</p>
  );
}
