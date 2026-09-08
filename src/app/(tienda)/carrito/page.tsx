"use client";

import { useState } from "react";
import Link from "next/link";
import { useCarrito } from "@/components/CarritoContext";
import { totalCarrito, type ItemCarrito } from "@/lib/carrito";
import type { ProblemaStock } from "@/lib/db";
import { crearPedidoDesdeCarrito } from "./actions";
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
    item.color && `Color: ${item.color}`,
    item.nombreSecreto && `Nombre secreto: "${item.nombreSecreto}"`,
  ]
    .filter(Boolean)
    .join(" · ");
}

// `numero` puede venir vacío si el pedido no se alcanzó a registrar
// (ver manejarContinuar) — el mensaje sigue armándose igual, solo sin
// el número, para no dejar al cliente sin poder pedir por un problema
// que es nuestro, no suyo.
function construirMensajeWhatsApp(
  items: ItemCarrito[],
  total: number,
  nombreCliente: string,
  numero: string | null
): string {
  const lineas = items.map((item) => {
    const detalles = detallesItem(item);
    return `- ${item.cantidad}x ${item.nombre}${
      detalles ? ` (${detalles})` : ""
    } — ${formatoCOP.format(item.precioUnitario * item.cantidad)}`;
  });
  const encabezado = numero
    ? `Hola, soy ${nombreCliente}. Quiero hacer este pedido (#${numero}):`
    : `Hola, soy ${nombreCliente}. Quiero hacer este pedido:`;
  return `${encabezado}\n\n${lineas.join("\n")}\n\nTotal: ${formatoCOP.format(total)}`;
}

export default function CarritoPage() {
  const { items, actualizarCantidad, quitar, vaciar } = useCarrito();
  const total = totalCarrito(items);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [problemasStock, setProblemasStock] = useState<ProblemaStock[] | null>(
    null
  );

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

  // Registra el pedido (para que quede con número y estado en el
  // panel de administración) y luego abre WhatsApp con el mensaje.
  // Antes de eso, valida el stock real: el catálogo se cargó al
  // entrar a la tienda, pero mientras el cliente arma el carrito el
  // stock puede cambiar por una venta de mostrador en Contabilidad
  // Lady. Si algo ya no alcanza, se detiene aquí — no se le deja
  // llegar a WhatsApp a pedir algo que no se le puede cumplir.
  //
  // Distinto es si el registro del pedido falla por un problema
  // técnico nuestro (ej. la base de datos no responde): eso NO le
  // impide al cliente seguir — igual se abre WhatsApp, solo que sin
  // el número de pedido.
  async function manejarContinuar(e: React.FormEvent) {
    e.preventDefault();
    if (!NUMERO_WHATSAPP || enviando) return;

    setEnviando(true);
    setProblemasStock(null);

    let numero: string | null = null;
    try {
      const resultado = await crearPedidoDesdeCarrito({
        clienteNombre: nombre,
        clienteTelefono: telefono,
        items,
        total,
      });
      if (resultado.problemasStock && resultado.problemasStock.length > 0) {
        setEnviando(false);
        setProblemasStock(resultado.problemasStock);
        return;
      }
      numero = resultado.numero ?? null;
    } catch {
      // seguimos sin número — ver comentario arriba
    }
    setEnviando(false);

    const mensaje = construirMensajeWhatsApp(items, total, nombre, numero);
    window.open(
      `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
      "noopener,noreferrer"
    );
    vaciar();
  }

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

      {problemasStock && (
        <div className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          <p className="font-medium">
            Algo cambió de stock mientras armabas el pedido:
          </p>
          <ul className="mt-1 list-inside list-disc">
            {problemasStock.map((p) => (
              <li key={p.productoId}>
                {p.nombre}: quedan {p.cantidadDisponible}, pediste{" "}
                {p.cantidadPedida}
              </li>
            ))}
          </ul>
          <p className="mt-1">
            Ajusta la cantidad arriba (o quita el producto) e intenta de
            nuevo.
          </p>
        </div>
      )}

      {NUMERO_WHATSAPP ? (
        <form
          onSubmit={manejarContinuar}
          className="mt-6 flex flex-col gap-3 border-t border-border pt-6"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-foreground">
              Tu nombre
            </span>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="¿Cómo te llamas?"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-foreground">
              Tu número de WhatsApp
            </span>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 3001234567"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
            />
          </label>

          <button
            type="submit"
            disabled={enviando}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-whatsapp px-4 py-3 text-sm font-semibold text-on-ember transition-colors hover:bg-whatsapp-hover disabled:opacity-60"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {enviando ? "Un momento..." : "Continuar por WhatsApp"}
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-danger">
          Falta configurar el número de WhatsApp de la tienda.
        </p>
      )}
    </main>
  );
}
