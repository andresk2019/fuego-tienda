import { nombreCategoria, type CategoriaSlug } from "@/lib/categorias";
import type { ResumenResenas } from "@/lib/resenas-db";
import EstrellaIcon from "@/components/EstrellaIcon";
import FavoritoBoton from "@/components/FavoritoBoton";

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
  resumenResenas,
  productoId,
}: {
  categoria: CategoriaSlug;
  nombre: string;
  precioVenta: number;
  disponible: boolean;
  pocasUnidades: boolean;
  descripcion: string;
  // Opcional: solo las velas con al menos una reseña asociada tienen
  // esto — ver obtenerResumenResenasDeProducto en resenas-db.ts.
  resumenResenas?: ResumenResenas | null;
  // Si no se pasa, no se muestra el corazón de favoritos — caso del
  // espejo de vista previa en /admin (ver SubirFotoForm.tsx), donde no
  // hay un producto real al que marcar.
  productoId?: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="w-fit rounded-full border border-border px-3 py-1 text-xs tracking-wide text-muted uppercase">
        {nombreCategoria(categoria)}
      </span>

      <div className="flex items-start justify-between gap-3">
        <h1 className="font-serif text-3xl text-foreground">{nombre}</h1>
        {productoId !== undefined && (
          <FavoritoBoton
            productoId={productoId}
            className="shrink-0 rounded-full p-2 text-ember transition-colors hover:bg-ember/10"
          />
        )}
      </div>

      {resumenResenas && (
        <div className="-mt-2 flex items-center gap-1.5">
          <div className="flex gap-0.5 text-ember">
            {Array.from({ length: 5 }).map((_, i) => (
              <EstrellaIcon
                key={i}
                llena={i < Math.round(resumenResenas.promedio)}
                className="h-4 w-4"
              />
            ))}
          </div>
          <span className="text-sm text-muted">
            {resumenResenas.promedio.toFixed(1)} ({resumenResenas.total}{" "}
            {resumenResenas.total === 1 ? "reseña" : "reseñas"})
          </span>
        </div>
      )}

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
