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

// Zona de envío — el costo de domicilio es distinto dentro de
// Medellín que al resto del país (decisión del dueño, 2026-09-14). Ya
// NO se elige a mano con un radio: se calcula sola a partir del
// departamento/municipio que el cliente selecciona en el carrito (ver
// determinarZonaEnvio más abajo y el selector en colombia-ubicaciones.ts),
// así no depende de que el cliente escoja bien la zona.
export type ZonaEnvio = 'medellin' | 'nacional';

export const ZONAS_ENVIO: { valor: ZonaEnvio; etiqueta: string }[] = [
  { valor: 'medellin', etiqueta: 'Medellín' },
  { valor: 'nacional', etiqueta: 'Resto del país' },
];

// Única combinación que cuenta como "Medellín" para efectos de envío.
// Si algún día el dueño quiere tratar el área metropolitana igual que
// Medellín (Envigado, Itagüí, Sabaneta, Bello...), este es el único
// lugar que hay que tocar.
export function determinarZonaEnvio(
  departamento: string,
  municipio: string
): ZonaEnvio {
  return departamento === 'Antioquia' && municipio === 'Medellín'
    ? 'medellin'
    : 'nacional';
}

export type ItemPedido = {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  aroma?: string;
  color?: string;
  nombreSecreto?: string;
};

export type Pedido = {
  id: number;
  numero: string;
  clienteNombre: string;
  clienteTelefono: string;
  // Vacío en pedidos de antes de este campo (no se pedía) Y en
  // pedidos de después de quitarlo del formulario (decisión del
  // dueño, 2026-09-16: la calle/barrio se confirma directo por
  // WhatsApp) — nunca undefined, para no tener que revisar en cada
  // pantalla si existe. El departamento/municipio quedan aparte, ver
  // abajo, y esos SÍ se siguen pidiendo.
  clienteDireccion: string;
  // null en pedidos de antes de que existiera el selector de
  // departamento/municipio (ver comentario de zonaEnvio más abajo).
  clienteDepartamento: string | null;
  clienteMunicipio: string | null;
  items: ItemPedido[];
  // `total` YA incluye el envío (ver costoEnvio) — es el valor real
  // que se le pidió pagar al cliente, no solo la suma de productos.
  total: number;
  // null en pedidos de antes de que existiera el costo de envío — a
  // diferencia de clienteDireccion, aquí sí importa distinguir "no se
  // cobró envío porque el pedido era antes de este cambio" de "el
  // envío fue gratis" (0), así que se deja sin valor por defecto.
  costoEnvio: number | null;
  // Igual que costoEnvio: null en pedidos de antes de que existieran
  // las 2 zonas.
  zonaEnvio: ZonaEnvio | null;
  estado: EstadoPedido;
  creadoEn: string;
};

// El número de pedido es solo el id de la tabla con un prefijo y
// relleno de ceros (ej. "FUEGO-000032") — no hace falta una secuencia
// aparte, el id ya es único y autoincremental.
export function formatearNumeroPedido(id: number): string {
  return `FUEGO-${String(id).padStart(6, '0')}`;
}
