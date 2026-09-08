"use client";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// Barra de precio con dos perillas (mínimo y máximo), armada con dos
// <input type="range"> superpuestos — es la técnica estándar para un
// slider de rango sin depender de una librería aparte. El estilo que
// hace clickeable solo la perilla (no todo el carril) vive en
// globals.css, bajo ".rango-precio-input".
//
// "Dinámica" (pedido del dueño): minDisponible/maxDisponible nunca son
// valores fijos en el código, los calcula quien use este componente a
// partir de los productos que de verdad están visibles en ese momento
// (ver CatalogoFiltrable) — si cambias de sección o subcategoría, el
// rango del slider se ajusta solo al precio real de esos productos.
export default function FiltroPrecio({
  minDisponible,
  maxDisponible,
  valor,
  onCambiar,
}: {
  minDisponible: number;
  maxDisponible: number;
  valor: [number, number];
  onCambiar: (valor: [number, number]) => void;
}) {
  // Si todos los productos visibles cuestan lo mismo no hay nada que
  // filtrar por precio — mostrar un slider con min == max se ve roto
  // (las dos perillas quedan pegadas en el mismo punto).
  if (minDisponible >= maxDisponible) return null;

  const [min, max] = valor;
  const pctMin = ((min - minDisponible) / (maxDisponible - minDisponible)) * 100;
  const pctMax = ((max - minDisponible) / (maxDisponible - minDisponible)) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium tracking-wide text-muted uppercase">
        Filtrar por precio
      </span>
      <p className="text-sm text-foreground">
        {formatoCOP.format(min)} – {formatoCOP.format(max)}
      </p>
      <div className="relative h-5 w-full max-w-xs">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ember"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <input
          type="range"
          aria-label="Precio mínimo"
          min={minDisponible}
          max={maxDisponible}
          value={min}
          onChange={(e) =>
            onCambiar([Math.min(Number(e.target.value), max), max])
          }
          className="rango-precio-input absolute inset-0 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          aria-label="Precio máximo"
          min={minDisponible}
          max={maxDisponible}
          value={max}
          onChange={(e) =>
            onCambiar([min, Math.max(Number(e.target.value), min)])
          }
          className="rango-precio-input absolute inset-0 w-full appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}
