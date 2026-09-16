"use client";

import Link from "next/link";
import { useState } from "react";
import FotoProducto from "@/components/FotoProducto";
import EstrellaIcon from "@/components/EstrellaIcon";
import FavoritoBoton from "@/components/FavoritoBoton";
import { useCarrito } from "@/components/CarritoContext";
import { AROMAS_DISPONIBLES } from "@/lib/personalizacion";
import type { ResumenResenas } from "@/lib/resenas-db";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// La tarjeta de producto tal cual se ve en el catálogo público (el
// link a la ficha vive DENTRO de este componente, no envolviéndolo
// desde afuera — así el bloque de "agregar al carrito" de más abajo
// puede quedar fuera del link, sin anidar un botón/select dentro de
// un <a>). También vive en su propio componente para que el panel de
// administración pueda mostrar el mismo "espejo" exacto de cómo se
// vería un cambio — no una copia aparte que se pueda desactualizar
// con el tiempo (ver mostrarAgregar más abajo).
export default function TarjetaProducto({
  href,
  productoId,
  nombre,
  precioVenta,
  fotoUrl,
  disponible,
  pocasUnidades,
  personalizable,
  esVela = false,
  resumenResenas,
  mostrarAgregar = true,
}: {
  // Si no se pasa, la tarjeta no navega a ninguna parte — caso de los
  // espejos de vista previa en /admin (ver SubirFotoForm.tsx), donde
  // no hay una ficha real a la que ir.
  href?: string;
  productoId?: number;
  nombre: string;
  precioVenta: number;
  fotoUrl: string | null;
  disponible: boolean;
  pocasUnidades: boolean;
  personalizable: boolean;
  // Si el producto necesita elegir aroma antes de agregarse al
  // carrito (ver AROMAS_DISPONIBLES en personalizacion.ts) — aplica a
  // toda vela del catálogo. Se omite (false) para lo que no es vela.
  esVela?: boolean;
  // Opcional: resumen de ESTA vela puntual (ver
  // obtenerResumenResenasPorProducto en resenas-db.ts) — null si
  // todavía no tiene ninguna reseña asociada. Se omite por completo
  // (ni el prop se manda) en los espejos de vista previa del admin,
  // donde no aplica.
  resumenResenas?: ResumenResenas | null;
  // false en los espejos de vista previa de /admin — ahí no hay un
  // producto real al que agregar, solo se compara cómo se vería la
  // tarjeta.
  mostrarAgregar?: boolean;
}) {
  const { agregar } = useCarrito();
  const [aroma, setAroma] = useState<string>(AROMAS_DISPONIBLES[0]);

  // Los 2 productos con personalización completa (nombre secreto,
  // ver personalizacion.ts) necesitan el formulario de la ficha — no
  // hay agregado rápido posible desde la tarjeta para esos.
  const puedeAgregarRapido =
    mostrarAgregar &&
    disponible &&
    !personalizable &&
    productoId !== undefined;

  function manejarAgregar() {
    if (productoId === undefined) return;
    agregar({
      productoId,
      nombre,
      precioUnitario: precioVenta,
      cantidad: 1,
      aroma: esVela ? aroma : undefined,
      fotoUrl,
    });
  }

  const contenido = (
    <>
      <div className="relative">
        <FotoProducto
          fotoUrl={fotoUrl}
          alt={nombre}
          sizes="(max-width: 640px) 45vw, 220px"
          iconClassName="h-5 w-5 text-ember/70 transition-colors group-hover:text-ember"
        />
        {productoId !== undefined && <FavoritoBoton productoId={productoId} />}
      </div>
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
      {!puedeAgregarRapido && (
        <span className="mt-auto text-xs text-muted transition-colors group-hover:text-ember">
          Ver más →
        </span>
      )}
    </>
  );

  return (
    <div className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-ember/60 hover:bg-surface-hover">
      {href ? (
        <Link href={href} className="contents">
          {contenido}
        </Link>
      ) : (
        contenido
      )}

      {puedeAgregarRapido && (
        <div className="mt-auto flex flex-col gap-2">
          {esVela && (
            <select
              value={aroma}
              onChange={(e) => setAroma(e.target.value)}
              aria-label={`Aroma de ${nombre}`}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
            >
              {AROMAS_DISPONIBLES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={manejarAgregar}
            className="w-full rounded-lg bg-ember px-3 py-2 text-xs font-semibold text-on-ember transition-colors hover:bg-ember-hover"
          >
            Agregar al carrito
          </button>
        </div>
      )}
    </div>
  );
}
