import FotoProducto from "@/components/FotoProducto";
import EstrellaIcon from "@/components/EstrellaIcon";
import type { ResumenResenas } from "@/lib/resenas-db";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// La tarjeta de producto tal cual se ve en el catálogo público
// (CatalogoFiltrable la envuelve en un <Link> para navegar). Vive en
// su propio componente para que el panel de administración pueda
// mostrar el mismo "espejo" exacto de cómo se vería un cambio — no
// una copia aparte que se pueda desactualizar con el tiempo.
export default function TarjetaProducto({
  nombre,
  precioVenta,
  fotoUrl,
  disponible,
  pocasUnidades,
  personalizable,
  resumenResenas,
}: {
  nombre: string;
  precioVenta: number;
  fotoUrl: string | null;
  disponible: boolean;
  pocasUnidades: boolean;
  personalizable: boolean;
  // Opcional: resumen de ESTA vela puntual (ver
  // obtenerResumenResenasPorProducto en resenas-db.ts) — null si
  // todavía no tiene ninguna reseña asociada. Se omite por completo
  // (ni el prop se manda) en los espejos de vista previa del admin,
  // donde no aplica.
  resumenResenas?: ResumenResenas | null;
}) {
  return (
    <div className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-ember/60 hover:bg-surface-hover">
      <FotoProducto
        fotoUrl={fotoUrl}
        alt={nombre}
        sizes="(max-width: 640px) 45vw, 220px"
        iconClassName="h-5 w-5 text-ember/70 transition-colors group-hover:text-ember"
      />
      <h2 className="font-serif text-lg text-foreground">{nombre}</h2>
      {resumenResenas && (
        <div className="-mt-1.5 flex items-center gap-1.5">
          <div className="flex gap-0.5 text-ember">
            {Array.from({ length: 5 }).map((_, i) => (
              <EstrellaIcon
                key={i}
                llena={i < Math.round(resumenResenas.promedio)}
                className="h-3.5 w-3.5"
              />
            ))}
          </div>
          <span className="text-xs text-muted">
            {resumenResenas.promedio.toFixed(1)} ({resumenResenas.total})
          </span>
        </div>
      )}
      <p className="text-lg font-semibold text-foreground">
        {formatoCOP.format(precioVenta)}
      </p>
      {!disponible && (
        <span className="inline-flex w-fit rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
          Agotado
        </span>
      )}
      {disponible && pocasUnidades && (
        <span className="inline-flex w-fit rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
          ¡Últimas unidades!
        </span>
      )}
      {personalizable && (
        <span className="inline-flex w-fit rounded-full border border-ember/40 px-2.5 py-0.5 text-xs font-medium text-ember">
          Personalizable
        </span>
      )}
      <span className="mt-auto text-xs text-muted transition-colors group-hover:text-ember">
        Ver más →
      </span>
    </div>
  );
}
