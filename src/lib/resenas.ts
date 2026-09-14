// Tipos puros de una reseña — sin `server-only`, para que se puedan
// importar tanto desde el servidor (resenas-db.ts) como desde
// componentes de cliente (ListaResenas.tsx). Mismo motivo que separa
// pedidos.ts de pedidos-db.ts.
export type Resena = {
  id: number;
  clienteNombre: string;
  texto: string;
  calificacion: number; // 1 a 5
  visible: boolean;
  creadoEn: string;
  // Vela sobre la que es la reseña — null significa que es una
  // reseña general de la tienda, no de un producto en particular.
  productoId: number | null;
};

export const CALIFICACION_MAXIMA = 5;
