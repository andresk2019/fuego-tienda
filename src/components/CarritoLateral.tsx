"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCarrito } from "@/components/CarritoContext";
import { totalCarrito, cantidadTotalCarrito, detallesItem } from "@/lib/carrito";
import CerrarIcon from "@/components/CerrarIcon";
import CarritoIcon from "@/components/CarritoIcon";
import FotoProducto from "@/components/FotoProducto";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// Panel que aparece a la derecha apenas se agrega un producto (ver
// agregar() en CarritoContext.tsx) — antes la única señal era el
// texto del botón cambiando a "¡Agregado!" por 2 segundos, fácil de
// no notar. Ahora el cliente ve de una vez qué quedó en el carrito,
// con foto y controles de cantidad a la mano, sin salir de la página
// donde estaba comprando.
export default function CarritoLateral() {
  const { items, abierto, cerrarCarrito, actualizarCantidad, quitar } =
    useCarrito();
  const subtotal = totalCarrito(items);
  const cantidadTotal = cantidadTotalCarrito(items);

  useEffect(() => {
    if (!abierto) return;
    document.body.style.overflow = "hidden";
    function alPresionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") cerrarCarrito();
    }
    window.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto, cerrarCarrito]);

  return (
    <>
      <div
        onClick={cerrarCarrito}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Carrito"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-ember/10 to-transparent px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember text-on-ember">
              <CarritoIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-serif text-lg leading-tight text-foreground">
                Tu carrito
              </h2>
              {cantidadTotal > 0 && (
                <p
                  key={cantidadTotal}
                  className="animar-entrada-carrito text-xs text-muted"
                >
                  {cantidadTotal}{" "}
                  {cantidadTotal === 1 ? "producto" : "productos"}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={cerrarCarrito}
            aria-label="Cerrar carrito"
            className="p-1 text-muted transition-colors hover:text-foreground"
          >
            <CerrarIcon className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-ember/40">
              <CarritoIcon className="h-8 w-8" />
            </span>
            <div>
              <p className="font-medium text-foreground">
                Tu carrito está vacío
              </p>
              <p className="mt-1 text-sm text-muted">
                Descubre nuestras velas artesanales y arma tu pedido.
              </p>
            </div>
            <Link
              href="/catalogo"
              onClick={cerrarCarrito}
              className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-5 py-4">
            {items.map((item, indice) => {
              const detalles = detallesItem(item);
              return (
                <li
                  key={item.clave}
                  style={{ animationDelay: `${indice * 40}ms` }}
                  className="animar-entrada-carrito flex items-start gap-3 border-b border-border py-3 first:pt-0 last:border-0"
                >
                  <div className="h-14 w-14 shrink-0">
                    <FotoProducto
                      fotoUrl={item.fotoUrl ?? null}
                      alt={item.nombre}
                      sizes="56px"
                      marcoClassName="rounded-lg bg-background"
                      iconClassName="h-4 w-4 text-ember/40"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.nombre}
                    </p>
                    {detalles && (
                      <p className="truncate text-xs text-muted">
                        {detalles}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border bg-background px-0.5 py-0.5">
                        <button
                          type="button"
                          disabled={item.cantidad <= 1}
                          onClick={() =>
                            actualizarCantidad(item.clave, item.cantidad - 1)
                          }
                          aria-label={`Quitar una unidad de ${item.nombre}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-xs font-medium text-foreground">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            actualizarCantidad(item.clave, item.cantidad + 1)
                          }
                          aria-label={`Agregar una unidad de ${item.nombre}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                        >
                          +
                        </button>
                      </div>
                      <span
                        key={item.cantidad}
                        className="animar-entrada-carrito text-sm font-semibold text-foreground"
                      >
                        {formatoCOP.format(item.precioUnitario * item.cantidad)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => quitar(item.clave)}
                    aria-label={`Quitar ${item.nombre} del carrito`}
                    className="shrink-0 p-1 text-muted/50 transition-colors hover:text-danger"
                  >
                    <CerrarIcon className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="flex items-center justify-between rounded-xl bg-ember/10 px-4 py-3">
              <span className="text-sm font-medium text-foreground">
                Subtotal
              </span>
              <span
                key={subtotal}
                className="animar-entrada-carrito text-lg font-semibold text-ember"
              >
                {formatoCOP.format(subtotal)}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/carrito"
                onClick={cerrarCarrito}
                className="rounded-lg bg-ember px-4 py-2.5 text-center text-sm font-semibold text-on-ember shadow-sm transition-all hover:-translate-y-0.5 hover:bg-ember-hover hover:shadow-md"
              >
                Ver carrito y pagar
              </Link>
              <button
                type="button"
                onClick={cerrarCarrito}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
