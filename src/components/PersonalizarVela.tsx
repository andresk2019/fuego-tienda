"use client";

import { useState } from "react";
import {
  AROMAS_DISPONIBLES,
  LONGITUD_MAXIMA_NOMBRE_SECRETO,
} from "@/lib/personalizacion";
import { useCarrito } from "@/components/CarritoContext";
import AgregarAlCarrito from "@/components/AgregarAlCarrito";
import SelectorConBusqueda from "@/components/SelectorConBusqueda";
import DescripcionAroma from "@/components/DescripcionAroma";

// Le da al cliente la elección explícita entre comprar la vela tal
// cual está en el catálogo o personalizarla — el formulario de
// personalización NO se muestra de una vez, solo aparece si el
// cliente elige esa opción. Cada camino agrega al carrito por su
// cuenta (con o sin las opciones de personalización). El aroma se
// puede elegir en los dos caminos (aplica a toda vela); el nombre
// secreto solo en el camino de personalizar.
//
// Ya no hay un desplegable de "Color" acá (decisión del dueño,
// 2026-09-11): la vista previa de fotos ahora es una galería que el
// cliente elige haciendo clic en una imagen (ver
// GaleriaFotosProducto.tsx), no un color de texto para anotar en el
// pedido.
export default function PersonalizarVela({
  productoId,
  nombre,
  precioUnitario,
  disponible,
  descripcionesAromas,
}: {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  disponible: boolean;
  // Descripción de cada aroma (la carga el dueño en /admin/aromas) —
  // ver DescripcionAroma.tsx.
  descripcionesAromas?: Record<string, string>;
}) {
  const { agregar } = useCarrito();
  const [modo, setModo] = useState<"stock" | "personalizar">("stock");
  const [aromaElegido, setAromaElegido] = useState<string>(
    AROMAS_DISPONIBLES[0]
  );
  const [nombreSecreto, setNombreSecreto] = useState("");
  const [agregado, setAgregado] = useState(false);

  function agregarPersonalizada() {
    agregar({
      productoId,
      nombre,
      precioUnitario,
      cantidad: 1,
      aroma: aromaElegido || undefined,
      nombreSecreto: nombreSecreto.trim() || undefined,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  }

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

      {modo === "stock" && (
        <AgregarAlCarrito
          productoId={productoId}
          nombre={nombre}
          precioUnitario={precioUnitario}
          disponible={disponible}
          aromas={AROMAS_DISPONIBLES}
          descripcionesAromas={descripcionesAromas}
        />
      )}

      {modo === "personalizar" && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-background/40 p-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Aroma</span>
            <SelectorConBusqueda
              opciones={AROMAS_DISPONIBLES}
              valor={aromaElegido}
              onCambiar={setAromaElegido}
              placeholder="Buscar aroma..."
            />
          </label>

          <DescripcionAroma descripcion={descripcionesAromas?.[aromaElegido]} />

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">
              Nombre secreto (opcional)
            </span>
            <input
              type="text"
              value={nombreSecreto}
              onChange={(e) => setNombreSecreto(e.target.value)}
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

          {disponible && (
            <button
              type="button"
              onClick={agregarPersonalizada}
              className="w-fit rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
            >
              {agregado ? "¡Agregado!" : "Agregar al carrito"}
            </button>
          )}
        </div>
      )}

      {!disponible && (
        <p className="text-sm text-danger">
          Agotado — no se puede agregar al carrito por ahora.
        </p>
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
          ? "border-ember bg-ember text-on-ember"
          : "border-border text-muted hover:border-ember/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
