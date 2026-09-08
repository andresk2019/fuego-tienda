// Tipos y funciones puras del carrito — sin React, para poder
// reusarlas tanto en el contexto del carrito como en la página que
// arma el mensaje de WhatsApp.
export type ItemCarrito = {
  clave: string;
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  aroma?: string;
  color?: string;
  nombreSecreto?: string;
};

// Dos líneas del mismo producto con las mismas opciones se combinan
// en una sola (sumando cantidad); con opciones distintas (otro aroma,
// otro color, otro nombre secreto) quedan como líneas separadas.
export function claveItem(
  productoId: number,
  opciones?: { aroma?: string; color?: string; nombreSecreto?: string }
): string {
  return [
    productoId,
    opciones?.aroma ?? '',
    opciones?.color ?? '',
    opciones?.nombreSecreto ?? '',
  ].join('|');
}

export function totalCarrito(items: ItemCarrito[]): number {
  return items.reduce((suma, item) => suma + item.precioUnitario * item.cantidad, 0);
}

export function cantidadTotalCarrito(items: ItemCarrito[]): number {
  return items.reduce((suma, item) => suma + item.cantidad, 0);
}
