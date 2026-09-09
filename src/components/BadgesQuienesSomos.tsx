import {
  IconoArtesanal,
  IconoColombia,
  IconoEcoamigable,
  IconoReciclable,
} from "@/components/IconosBadges";

// Banner de confianza para "Quiénes somos" — mismo espíritu que
// BadgesConfianza.tsx (íconos + texto corto), pero con las 4
// afirmaciones que el dueño confirmó como ciertas (2026-09-08):
// artesanal, hecho en Colombia, ecoamigable y envases reciclables.
// Ninguna se copió de una imagen de referencia sin confirmar primero
// que aplicaba de verdad — mismo criterio que ya se usó para
// BadgesConfianza.
const PUNTOS = [
  { texto: "100% artesanal", Icono: IconoArtesanal },
  { texto: "Hecho en Colombia", Icono: IconoColombia },
  { texto: "Ecoamigable", Icono: IconoEcoamigable },
  { texto: "Envases reciclables", Icono: IconoReciclable },
] as const;

export default function BadgesQuienesSomos() {
  return (
    <ul className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-surface p-6 sm:grid-cols-4">
      {PUNTOS.map(({ texto, Icono }) => (
        <li
          key={texto}
          className="flex flex-col items-center gap-2 text-center"
        >
          <Icono className="h-8 w-8 text-ember" />
          <span className="text-sm font-semibold text-foreground">
            {texto}
          </span>
        </li>
      ))}
    </ul>
  );
}
