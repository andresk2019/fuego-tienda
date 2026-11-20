// Tipos y constantes puras de un pedido — sin `server-only`, para que
// se puedan importar tanto desde el servidor (pedidos-db.ts) como
// desde componentes de cliente (ListaPedidos.tsx). Mismo motivo que
// separa carrito.ts del resto: nada de esto toca la base de datos.
export type EstadoPedido =
  | 'pendiente'
  | 'en_preparacion'
  | 'enviado'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

export const ESTADOS_PEDIDO: { valor: EstadoPedido; etiqueta: string }[] = [
  { valor: 'pendiente', etiqueta: 'Pendiente' },
  { valor: 'en_preparacion', etiqueta: 'En preparación' },
  { valor: 'enviado', etiqueta: 'Enviado' },
  { valor: 'en_camino', etiqueta: 'En camino' },
  { valor: 'entregado', etiqueta: 'Entregado' },
  { valor: 'cancelado', etiqueta: 'Cancelado' },
];

// Lo que ve el CLIENTE en /seguimiento por cada paso del recorrido
// (el admin ve solo la etiqueta corta). "cancelado" no es un paso del
// recorrido normal: se muestra aparte.
export const PASOS_SEGUIMIENTO: {
  valor: Exclude<EstadoPedido, 'cancelado'>;
  etiqueta: string;
  descripcion: string;
}[] = [
  {
    valor: 'pendiente',
    etiqueta: 'Pedido recibido',
    descripcion: 'Recibimos tu pedido y lo vamos a confirmar contigo por WhatsApp.',
  },
  {
    valor: 'en_preparacion',
    etiqueta: 'En preparación',
    descripcion: 'Estamos elaborando y empacando tus velas con cariño.',
  },
  {
    valor: 'enviado',
    etiqueta: 'Enviado',
    descripcion: 'Tu pedido ya salió de nuestro taller.',
  },
  {
    valor: 'en_camino',
    etiqueta: 'En camino',
    descripcion: 'Tu pedido va de camino a tu dirección.',
  },
  {
    valor: 'entregado',
    etiqueta: 'Entregado',
    descripcion: '¡Tu pedido llegó! Esperamos que lo disfrutes.',
  },
];

// Los últimos 10 dígitos de un teléfono colombiano (celular sin
// indicativo). Así "+57 300 123 4567", "300-123-4567" y "3001234567"
// cuentan como el mismo número. Se usa para comprobar que quien
// consulta un pedido es quien lo hizo (ver /seguimiento).
export function normalizarTelefono(telefono: string): string {
  return telefono.replace(/\D/g, '').slice(-10);
}

// Acepta "FUEGO-000032", "fuego 32", "#32" o "32": toma el último
// bloque de dígitos. null si no hay un número razonable.
export function extraerIdPedido(texto: string): number | null {
  const coincidencia = texto.match(/(\d{1,9})\D*$/);
  if (!coincidencia) return null;
  const id = Number(coincidencia[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

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

// Enlace de WhatsApp (wa.me, gratis, sin API) para avisarle al cliente
// del estado de su pedido desde el panel de administración: abre el
// chat con el mensaje ya escrito, el dueño solo toca "enviar". Asume
// celular colombiano (10 dígitos + indicativo 57).
export function enlaceAvisoWhatsApp(
  pedido: Pick<Pedido, 'numero' | 'clienteNombre' | 'clienteTelefono' | 'estado'>,
  urlSeguimiento: string
): string | null {
  const telefono = normalizarTelefono(pedido.clienteTelefono);
  if (telefono.length !== 10) return null;
  const nombre = pedido.clienteNombre.trim().split(/\s+/)[0] ?? '';
  const frases: Record<EstadoPedido, string> = {
    pendiente: 'recibimos tu pedido y lo estamos confirmando',
    en_preparacion: 'tu pedido ya está en preparación 🕯️',
    enviado: 'tu pedido ya fue enviado 📦',
    en_camino: 'tu pedido va en camino 🚚',
    entregado: 'tu pedido fue entregado. ¡Gracias por tu compra! 🔥',
    cancelado: 'tu pedido fue cancelado',
  };
  const mensaje = `Hola ${nombre}, te escribimos de Fuego: ${frases[pedido.estado]} (#${pedido.numero}).\n\nPuedes ver su estado aquí: ${urlSeguimiento}?pedido=${encodeURIComponent(pedido.numero)}`;
  return `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;
}
