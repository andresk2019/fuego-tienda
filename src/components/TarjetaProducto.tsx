import Image from "next/image";
import FlameIcon from "@/components/FlameIcon";

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
}: {
  nombre: string;
  precioVenta: number;
  fotoUrl: string | null;
  disponible: boolean;
  pocasUnidades: boolean;
  personalizable: boolean;
}) {
  return (
    <div className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-ember/60 hover:bg-surface-hover">
      {fotoUrl ? (
        <Image
          src={fotoUrl}
          alt={nombre}
          width={200}
          height={200}
          className="h-32 w-full rounded-xl object-cover"
        />
      ) : (
        <FlameIcon className="h-5 w-5 text-ember/70 transition-colors group-hover:text-ember" />
      )}
      <h2 className="font-serif text-lg text-foreground">{nombre}</h2>
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
