"use client";

import { useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";

// La ficha de producto (productos/[id]/page.tsx) es un Server
// Component — no puede llamar a Analytics directo, así que este
// componente aparte, sin nada visible, solo dispara el evento cuando
// se monta. Evento estándar de GA4 (view_item), primer escalón del
// embudo: ver producto → agregar al carrito → empezar a pagar →
// continuar_whatsapp.
export default function RegistrarVistaProducto({
  productoId,
  nombre,
  precioVenta,
}: {
  productoId: number;
  nombre: string;
  precioVenta: number;
}) {
  useEffect(() => {
    sendGAEvent("event", "view_item", {
      currency: "COP",
      value: precioVenta,
      items: [
        {
          item_id: String(productoId),
          item_name: nombre,
          price: precioVenta,
        },
      ],
    });
  }, [productoId, nombre, precioVenta]);

  return null;
}
