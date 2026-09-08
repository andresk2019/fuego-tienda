// Tipos y constantes puras de un pedido — sin `server-only`, para que
// se puedan importar tanto desde el servidor (pedidos-db.ts) como
// desde componentes de cliente (ListaPedidos.tsx). Mismo motivo que
// separa carrito.ts del resto: nada de esto toca la base de datos.
export type EstadoPedido =
  | 'pendiente'
  | 'confirmado'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

export const ESTADOS_PEDIDO: { valor: EstadoPedido; etiqueta: string }[] = [
  { valor: 'pendiente', etiqueta: 'Pendiente' },
  { valor: 'confirmado', etiqueta: 'Confirmado' },
  { valor: 'enviado', etiqueta: 'Enviado' },
  { valor: 'entregado', etiqueta: 'Entregado' },
  { valor: 'cancelado', etiqueta: 'Cancelado' },
];

export type ItemPedido = {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  aroma?: string;
  nombreSecreto?: string;
};

export type Pedido = {
  id: number;
  numero: string;
  clienteNombre: string;
  clienteTelefono: string;
  items: ItemPedido[];
  total: number;
  estado: EstadoPedido;
  creadoEn: string;
};

// El número de pedido es solo el id de la tabla con un prefijo y
// relleno de ceros (ej. "FUEGO-000032") — no hace falta una secuencia
// aparte, el id ya es único y autoincremental.
export function formatearNumeroPedido(id: number): string {
  return `FUEGO-${String(id).padStart(6, '0')}`;
}
