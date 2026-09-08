"use client";

import Link from "next/link";
import { useCarrito } from "@/components/CarritoContext";
import { totalCarrito, type ItemCarrito } from "@/lib/carrito";
import WhatsAppIcon from "@/components/WhatsAppIcon";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const NUMERO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

function detallesItem(item: ItemCarrito): string {
  return [
    item.aroma && `Aroma: ${item.aroma}`,
    item.nombreSecreto && `Nombre secreto: "${item.nombreSecreto}"`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function construirMensajeWhatsApp(items: ItemCarrito[], total: number): string {
  const lineas = items.map((item) => {
    const detalles = detallesItem(item);
    return `- ${item.cantidad}x ${item.nombre}${
      detalles ? ` (${detalles})` : ""
    } — ${formatoCOP.format(item.precioUnitario * item.cantidad)}`;
  });
  return `Hola, quiero hacer este pedido:\n\n${lineas.join("\n")}\n\nTotal: ${formatoCOP.format(total)}`;
}

export default function CarritoPage() {
  const { items, actualizarCantidad, quitar } = useCarrito();
  const total = totalCarrito(items);

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-foreground">
          Tu carrito está vacío
        </h1>
        <Link
          href="/catalogo"
          className="text-sm font-medium text-ember transition-colors hover:text-ember-hover"
        >
          ← Ver el catálogo
        </Link>
      </main>
    );
  }

  const mensaje = construirMensajeWhatsApp(items, total);
  const linkWhatsApp = NUMERO_WHATSAPP
    ? `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`
    : null;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="font-serif text-2xl text-foreground">Tu carrito</h1>

      <ul className="mt-6 flex flex-col gap-3">
        {items.map((item) => {
          const detalles = detallesItem(item);
          return (
            <li
              key={item.clave}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {item.nombre}
                </p>
                {detalles && (
                  <p className="text-xs text-muted">{detalles}</p>
                )}
                <p className="text-sm text-muted">
                  {formatoCOP.format(item.precioUnitario)} c/u
                </p>
              </div>
              <input
                type="number"
                min={1}
                value={item.cantidad}
                onChange={(e) =>
                  actualizarCantidad(
                    item.clave,
                    Math.max(1, Number(e.target.value) || 1)
                  )
                }
                aria-label={`Cantidad de ${item.nombre}`}
                className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-foreground"
              />
              <button
                type="button"
                onClick={() => quitar(item.clave)}
                className="text-xs text-muted transition-colors hover:text-danger"
              >
                Quitar
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="font-medium text-foreground">Total</span>
        <span className="text-lg font-semibold text-foreground">
          {formatoCOP.format(total)}
        </span>
      </div>

      {linkWhatsApp ? (
        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-whatsapp px-4 py-3 text-sm font-semibold text-on-ember transition-colors hover:bg-whatsapp-hover"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Continuar por WhatsApp
        </a>
      ) : (
        <p className="mt-6 text-sm text-danger">
          Falta configurar el número de WhatsApp de la tienda.
        </p>
      )}
    </main>
  );
}
