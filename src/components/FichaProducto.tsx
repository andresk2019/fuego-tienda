import { nombreCategoria, type CategoriaSlug } from "@/lib/categorias";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// La "ficha" de texto del producto (categoría, nombre, precio,
// disponibilidad, descripción) tal cual aparece en la columna derecha
// de la página de detalle — separada de la foto y de la sección de
// compra/personalización. Vive en su propio componente para que el
// panel de administración pueda mostrar el mismo "espejo" exacto al
// previsualizar un cambio de descripción.
export default function FichaProducto({
  categoria,
  nombre,
  precioVenta,
  disponible,
  pocasUnidades,
  descripcion,
}: {
  categoria: CategoriaSlug;
  nombre: string;
  precioVenta: number;
  disponible: boolean;
  pocasUnidades: boolean;
  descripcion: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="w-fit rounded-full border border-border px-3 py-1 text-xs tracking-wide text-muted uppercase">
        {nombreCategoria(categoria)}
      </span>

      <h1 className="font-serif text-3xl text-foreground">{nombre}</h1>

      <p className="text-2xl font-semibold text-foreground">
        {formatoCOP.format(precioVenta)}
      </p>

      {!disponible && (
        <span className="inline-flex w-fit rounded-full bg-danger/10 px-3 py-1 text-sm font-medium text-danger">
          Agotado
        </span>
      )}
      {disponible && pocasUnidades && (
        <span className="inline-flex w-fit rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
          ¡Últimas unidades!
        </span>
      )}

      <p className="leading-relaxed text-muted">{descripcion}</p>
    </div>
  );
}
