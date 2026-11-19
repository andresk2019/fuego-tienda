import EnlacePromocion from "@/components/EnlacePromocion";
import CuentaRegresiva from "@/components/CuentaRegresiva";
import type { Promocion } from "@/lib/promociones";

// Franja delgada arriba de todo el sitio con la promo vigente (ver
// obtenerPromocionFranja en promociones-db.ts) — una sola línea, así
// que solo cabe una promo a la vez. Si no hay ninguna vigente, no se
// renderiza nada.
export default function FranjaPromocion({
  promocion,
}: {
  promocion: Promocion | null;
}) {
  if (!promocion) return null;

  const contenido = (
    <>
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
    </>
  );

  const clases = "block bg-ember px-4 py-2 text-center text-xs text-on-ember sm:text-sm";

  return promocion.enlace ? (
    <EnlacePromocion enlace={promocion.enlace} className={`${clases} hover:bg-ember-hover`}>
      {contenido}
    </EnlacePromocion>
  ) : (
    <p className={clases}>{contenido}</p>
  );
}
