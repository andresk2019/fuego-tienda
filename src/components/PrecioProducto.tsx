const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// Precio de un producto. Sin descuento es solo el precio; con
// descuento (ver precioOriginal en ProductoCatalogo, db.ts) muestra
// el precio rebajado, el original tachado y la etiqueta "-20 %".
// `className` es el estilo del precio principal, que cambia según
// dónde se use (tarjeta, ficha, destacados).
export default function PrecioProducto({
  precioVenta,
  precioOriginal,
  descuentoPorcentaje,
  className,
}: {
  precioVenta: number;
  precioOriginal?: number | null;
  descuentoPorcentaje?: number | null;
  className?: string;
}) {
  if (!precioOriginal) {
    return <p className={className}>{formatoCOP.format(precioVenta)}</p>;
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <p className={className}>
        <span className="sr-only">Precio con descuento: </span>
        {formatoCOP.format(precioVenta)}
      </p>
      <p className="text-sm text-muted line-through">
        <span className="sr-only">Precio normal: </span>
        {formatoCOP.format(precioOriginal)}
      </p>
      {descuentoPorcentaje ? (
        <span className="rounded-full bg-ember px-2 py-0.5 text-[11px] font-semibold text-on-ember">
          -{descuentoPorcentaje}%
        </span>
      ) : null}
    </div>
  );
}
