'use client';

import { useActionState, useMemo, useState } from 'react';
import { actualizarEstado } from '@/app/admin/pedidos/actions';
import { ESTADOS_PEDIDO, ZONAS_ENVIO, type Pedido } from '@/lib/pedidos';

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
          {(pedido.clienteDireccion || pedido.clienteMunicipio) && (
            <p className="text-sm text-muted">
              📍 {pedido.clienteDireccion}
              {pedido.clienteDireccion && pedido.clienteMunicipio && ", "}
              {pedido.clienteMunicipio &&
                `${pedido.clienteMunicipio}, ${pedido.clienteDepartamento}`}
            </p>
          )}
          <p className="text-xs text-muted">
            {formatoFecha.format(new Date(pedido.creadoEn))}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="font-semibold text-foreground">
              {formatoCOP.format(pedido.total)}
            </p>
            {pedido.costoEnvio !== null && (
              <p className="text-xs text-muted">
                Incluye envío
                {pedido.zonaEnvio &&
                  ` a ${ZONAS_ENVIO.find((z) => z.valor === pedido.zonaEnvio)?.etiqueta}`}
                :{" "}
                {pedido.costoEnvio > 0
                  ? formatoCOP.format(pedido.costoEnvio)
                  : "Gratis"}
              </p>
            )}
          </div>
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
  const [busqueda, setBusqueda] = useState('');

  // Busca por número de pedido, nombre/teléfono del cliente, o el
  // nombre de algún producto del pedido — así sirve tanto para "¿qué
  // pidió Andrés?" como para "¿quién pidió una Bomba #1?".
  const pedidosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return pedidos;
    return pedidos.filter(
      (p) =>
        p.numero.toLowerCase().includes(termino) ||
        p.clienteNombre.toLowerCase().includes(termino) ||
        p.clienteTelefono.toLowerCase().includes(termino) ||
        p.items.some((item) => item.nombre.toLowerCase().includes(termino))
    );
  }, [pedidos, busqueda]);

  if (pedidos.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted">
        Todavía no hay pedidos registrados.
      </p>
    );
  }

  return (
    <div>
      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por número, cliente, teléfono o producto..."
        className="mt-6 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
      />

      {pedidosFiltrados.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No hay pedidos que coincidan con &quot;{busqueda}&quot;.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {pedidosFiltrados.map((pedido) => (
            <FilaPedido key={pedido.id} pedido={pedido} />
          ))}
        </ul>
      )}
    </div>
  );
}
