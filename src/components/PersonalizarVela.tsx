"use client";

import { useState } from "react";
import { LONGITUD_MAXIMA_NOMBRE_SECRETO } from "@/lib/personalizacion";

// Le da al cliente la elección explícita entre comprar la vela tal
// cual está en el catálogo o personalizarla — el formulario de
// personalización NO se muestra de una vez, solo aparece si el
// cliente elige esa opción.
export default function PersonalizarVela({ aromas }: { aromas: string[] }) {
  const [modo, setModo] = useState<"stock" | "personalizar">("stock");

  return (
    <div
      id="personalizar"
      className="mt-2 flex flex-col gap-4 border-t border-border pt-6 scroll-mt-6"
    >
      <h2 className="font-serif text-xl text-foreground">
        ¿La quieres tal cual o personalizada?
      </h2>

      <div className="flex flex-wrap gap-2">
        <OpcionBoton
          activo={modo === "stock"}
          onClick={() => setModo("stock")}
        >
          Comprar tal cual
        </OpcionBoton>
        <OpcionBoton
          activo={modo === "personalizar"}
          onClick={() => setModo("personalizar")}
        >
          Personalizar mi vela
        </OpcionBoton>
      </div>

      {modo === "personalizar" && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-background/40 p-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Aroma</span>
            {aromas.length > 0 ? (
              <select className="rounded-lg border border-border bg-background px-3 py-2 text-foreground">
                {aromas.map((aroma) => (
                  <option key={aroma} value={aroma}>
                    {aroma}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-muted">
                No hay aromas disponibles por ahora.
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Color</span>
            <select
              disabled
              className="rounded-lg border border-border bg-background px-3 py-2 text-muted"
            >
              <option>Colores: por definir</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">
              Nombre secreto (opcional)
            </span>
            <input
              type="text"
              maxLength={LONGITUD_MAXIMA_NOMBRE_SECRETO}
              placeholder="Ej: Feliz cumpleaños, Andrés, Leidy..."
              className="rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted/60"
            />
            <span className="text-xs text-muted">
              Un nombre o una frase breve (máximo{" "}
              {LONGITUD_MAXIMA_NOMBRE_SECRETO} caracteres).
            </span>
          </label>

          <p className="text-xs text-muted italic">
            Cuéntanos tu personalización al hacer tu pedido.
          </p>
        </div>
      )}
    </div>
  );
}

function OpcionBoton({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
        activo
          ? "border-ember bg-ember text-foreground"
          : "border-border text-muted hover:border-ember/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
