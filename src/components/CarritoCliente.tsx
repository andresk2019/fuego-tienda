"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { useCarrito } from "@/components/CarritoContext";
import { totalCarrito, type ItemCarrito } from "@/lib/carrito";
import { determinarZonaEnvio, ZONAS_ENVIO, type ZonaEnvio } from "@/lib/pedidos";
import { UBICACIONES_COLOMBIA } from "@/lib/colombia-ubicaciones";
import type { ProblemaStock } from "@/lib/db";
import { crearPedidoDesdeCarrito } from "@/app/(tienda)/carrito/actions";
import type { ConfigEnvio } from "@/lib/admin-db";
import WhatsAppIcon from "@/components/WhatsAppIcon";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

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
  subtotal: number,
  costoEnvio: number,
  zonaEnvio: ZonaEnvio,
  nombreCliente: string,
  direccion: string,
  departamento: string,
  municipio: string,
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
  const etiquetaZona =
    ZONAS_ENVIO.find((z) => z.valor === zonaEnvio)?.etiqueta ?? "";
  const lineaEnvio =
    costoEnvio > 0 ? formatoCOP.format(costoEnvio) : "Gratis";
  return `${encabezado}\n\n${lineas.join("\n")}\n\nSubtotal: ${formatoCOP.format(subtotal)}\nEnvío (${etiquetaZona}): ${lineaEnvio}\nTotal: ${formatoCOP.format(subtotal + costoEnvio)}\n\nDirección de entrega: ${direccion}, ${municipio}, ${departamento}`;
}

// `numeroWhatsApp` llega desde el servidor (ver (tienda)/carrito/
// page.tsx) — antes esta página leía la variable de entorno
// NEXT_PUBLIC_WHATSAPP_NUMBER directo; ahora el número se puede
// cambiar desde /admin sin necesidad de un nuevo despliegue (ver
// obtenerNumeroWhatsApp en admin-db.ts).
// `configEnvio` también llega desde el servidor — 2 tarifas de
// domicilio (dentro de Medellín / resto del país, decisión del dueño,
// 2026-09-14), gratis a partir de cierto monto en cualquiera de las
// 2. La zona ya NO se elige a mano con un radio: sale sola del
// departamento y municipio que el cliente escoge (ver
// determinarZonaEnvio en pedidos.ts y el listado en
// colombia-ubicaciones.ts), así no depende de que elija bien la zona.
// Lo mostrado acá es solo para que el cliente vea el total antes de
// enviar; el que de verdad queda registrado en el pedido se vuelve a
// calcular en el servidor con la tarifa vigente en ese momento (ver
// crearPedidoDesdeCarrito), nunca confiando en lo que calculó el
// navegador.
export default function CarritoCliente({
  numeroWhatsApp,
  configEnvio,
}: {
  numeroWhatsApp: string | null;
  configEnvio: ConfigEnvio;
}) {
  const { items, actualizarCantidad, quitar, vaciar } = useCarrito();
  const subtotal = totalCarrito(items);
  const envioGratis = subtotal >= configEnvio.gratisDesde;

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [problemasStock, setProblemasStock] = useState<ProblemaStock[] | null>(
    null
  );

  const municipiosDisponibles = useMemo(
    () =>
      UBICACIONES_COLOMBIA.find((d) => d.departamento === departamento)
        ?.municipios ?? [],
    [departamento]
  );

  const zonaEnvio =
    departamento && municipio
      ? determinarZonaEnvio(departamento, municipio)
      : null;
  const costoEnvioMostrado = zonaEnvio
    ? envioGratis
      ? 0
      : zonaEnvio === "medellin"
        ? configEnvio.costoLocal
        : configEnvio.costoNacional
    : null;
  const totalMostrado =
    costoEnvioMostrado !== null ? subtotal + costoEnvioMostrado : null;

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
    if (
      !numeroWhatsApp ||
      enviando ||
      !aceptaPolitica ||
      !departamento ||
      !municipio ||
      !zonaEnvio
    )
      return;

    // Safari (sobre todo en iPhone) bloquea como "pop-up" cualquier
    // window.open que no ocurra en el mismo instante del clic. Antes,
    // la ventana se abría DESPUÉS de esperar la respuesta del
    // servidor (registrar el pedido) — esa espera de por medio hacía
    // que Safari lo bloqueara en silencio y WhatsApp nunca se abriera.
    // Por eso se abre una pestaña en blanco aquí mismo, todavía
    // dentro del clic, y más abajo solo se le asigna la URL final
    // cuando ya está lista (eso sí lo permite cualquier navegador).
    const ventanaWhatsApp = window.open("", "_blank");

    setEnviando(true);
    setProblemasStock(null);

    let numero: string | null = null;
    // Si el registro falla, el mensaje igual se arma con el envío
    // calculado acá en el navegador (ver comentario del componente) —
    // no es exacto al 100% si justo en ese instante cambió la tarifa,
    // pero es mejor que dejar al cliente sin poder pedir.
    let costoEnvio = costoEnvioMostrado ?? 0;
    try {
      const resultado = await crearPedidoDesdeCarrito({
        clienteNombre: nombre,
        clienteTelefono: telefono,
        clienteDireccion: direccion,
        clienteDepartamento: departamento,
        clienteMunicipio: municipio,
        aceptaTratamientoDatos: aceptaPolitica,
        items,
      });
      if (resultado.problemasStock && resultado.problemasStock.length > 0) {
        setEnviando(false);
        setProblemasStock(resultado.problemasStock);
        ventanaWhatsApp?.close();
        return;
      }
      numero = resultado.numero ?? null;
      if (resultado.costoEnvio !== undefined) costoEnvio = resultado.costoEnvio;
    } catch {
      // seguimos sin número — ver comentario arriba
    }
    setEnviando(false);

    const mensaje = construirMensajeWhatsApp(
      items,
      subtotal,
      costoEnvio,
      zonaEnvio,
      nombre,
      direccion,
      departamento,
      municipio,
      numero
    );
    const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    if (ventanaWhatsApp) {
      ventanaWhatsApp.location.href = linkWhatsApp;
    } else {
      // El navegador bloqueó incluso la pestaña en blanco (poco
      // común) — se intenta igual, es lo mismo que pasaba antes de
      // este arreglo.
      window.open(linkWhatsApp, "_blank", "noopener,noreferrer");
    }

    // Esta tienda no tiene "compra" dentro del sitio (se cierra por
    // WhatsApp) — este es el evento que de verdad importa medir en
    // Analytics: no cuántos visitan, sino cuántos llegan hasta acá.
    // `value`/`currency` siguen la convención de GA4 para eventos de
    // conversión con valor monetario.
    sendGAEvent("event", "continuar_whatsapp", {
      value: subtotal + costoEnvio,
      currency: "COP",
    });

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

      <div className="mt-6 flex flex-col gap-1.5 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>Subtotal</span>
          <span>{formatoCOP.format(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted">
          <span>Envío a domicilio</span>
          <span>
            {costoEnvioMostrado === null
              ? "Elige tu departamento y municipio"
              : costoEnvioMostrado > 0
                ? formatoCOP.format(costoEnvioMostrado)
                : "Gratis"}
          </span>
        </div>
        {envioGratis && (
          <p className="text-xs text-muted">
            Envío gratis por superar {formatoCOP.format(configEnvio.gratisDesde)}
            .
          </p>
        )}
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
          <span className="font-medium text-foreground">Total</span>
          <span className="text-lg font-semibold text-foreground">
            {totalMostrado !== null ? formatoCOP.format(totalMostrado) : "—"}
          </span>
        </div>
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

      {numeroWhatsApp ? (
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

          <div className="flex flex-wrap gap-3">
            <label className="flex min-w-[140px] flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-foreground">
                Departamento
              </span>
              <select
                required
                value={departamento}
                onChange={(e) => {
                  setDepartamento(e.target.value);
                  setMunicipio("");
                }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="" disabled>
                  Selecciona...
                </option>
                {UBICACIONES_COLOMBIA.map((d) => (
                  <option key={d.departamento} value={d.departamento}>
                    {d.departamento}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[140px] flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-foreground">
                Municipio
              </span>
              <select
                required
                disabled={!departamento}
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
              >
                <option value="" disabled>
                  {departamento ? "Selecciona..." : "Elige un departamento"}
                </option>
                {municipiosDisponibles.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-foreground">
              Dirección exacta
            </span>
            <textarea
              required
              rows={2}
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle, número, barrio y algún punto de referencia"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
            />
          </label>

          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              required
              checked={aceptaPolitica}
              onChange={(e) => setAceptaPolitica(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-ember"
            />
            <span>
              He leído y acepto la{" "}
              <Link
                href="/politica-de-datos"
                target="_blank"
                className="font-medium text-ember transition-colors hover:text-ember-hover"
              >
                Política de tratamiento de datos personales
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={
              enviando || !aceptaPolitica || !departamento || !municipio
            }
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
