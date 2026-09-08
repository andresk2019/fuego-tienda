'use client';

import { useActionState } from 'react';
import { actualizarEstado } from '@/app/admin/pedidos/actions';
import { ESTADOS_PEDIDO, type Pedido } from '@/lib/pedidos';

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

// Colores por estado — nada saturado, apenas lo suficiente para
// distinguir "pendiente" (necesita atención) de "cancelado" (ya no)
// de un vistazo, sin salirse de la paleta cálida del resto del sitio.
const ESTILO_ESTADO: Record<Pedido['estado'], string> = {
  pendiente: 'border-gold/40 bg-gold/10 text-gold',
  confirmado: 'border-ember/40 bg-ember/10 text-ember',
  enviado: 'border-ember/40 bg-ember/10 text-ember',
  entregado: 'border-border bg-surface-hover text-muted',
  cancelado: 'border-danger/40 bg-danger/10 text-danger',
};

function FilaPedido({ pedido }: { pedido: Pedido }) {
  const [estado, accion] = useActionState(actualizarEstado, undefined);

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{pedido.numero}</p>
          <p className="text-sm text-muted">
            {pedido.clienteNombre} · {pedido.clienteTelefono}
          </p>
          <p className="text-xs text-muted">
            {formatoFecha.format(new Date(pedido.creadoEn))}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className="font-semibold text-foreground">
            {formatoCOP.format(pedido.total)}
          </p>
          <form action={accion} className="contents">
            <input type="hidden" name="pedidoId" value={pedido.id} />
            <select
              // `key` fuerza a remontar el <select> cuando el estado
              // real cambia (ej. tras guardar) — si no, al ser
              // "no controlado" (defaultValue), React lo deja tal
              // cual quedó en el DOM y no refleja el nuevo valor
              // aunque la base de datos sí se haya actualizado bien.
              key={pedido.estado}
              name="estado"
              defaultValue={pedido.estado}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${ESTILO_ESTADO[pedido.estado]}`}
            >
              {ESTADOS_PEDIDO.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.etiqueta}
                </option>
              ))}
            </select>
          </form>
        </div>
      </div>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}

      <ul className="border-t border-border pt-3 text-sm text-muted">
        {pedido.items.map((item, i) => (
          <li key={i}>
            {item.cantidad}x {item.nombre}
            {item.aroma && ` · Aroma: ${item.aroma}`}
            {item.color && ` · Color: ${item.color}`}
            {item.nombreSecreto && ` · Nombre secreto: "${item.nombreSecreto}"`}
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function ListaPedidos({ pedidos }: { pedidos: Pedido[] }) {
  if (pedidos.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted">
        Todavía no hay pedidos registrados.
      </p>
    );
  }

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {pedidos.map((pedido) => (
        <FilaPedido key={pedido.id} pedido={pedido} />
      ))}
    </ul>
  );
}
