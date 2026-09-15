import { ESTADOS_PEDIDO, type Pedido } from '@/lib/pedidos';

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function esDelMesActual(pedido: Pedido, ahora: Date): boolean {
  const fecha = new Date(pedido.creadoEn);
  return (
    fecha.getFullYear() === ahora.getFullYear() &&
    fecha.getMonth() === ahora.getMonth()
  );
}

// Resumen rápido arriba de la lista — antes /admin/pedidos era una
// lista plana sin ningún total: había que contar a ojo cuántos
// pedidos faltaban por atender o cuánto se había vendido en el mes.
// Se calcula siempre sobre TODOS los pedidos (no sobre lo que quede
// filtrado por el buscador de ListaPedidos), para que el resumen no
// cambie mientras alguien busca algo puntual.
export default function ResumenPedidos({ pedidos }: { pedidos: Pedido[] }) {
  const ahora = new Date();
  // Cancelado no cuenta como venta real — si se descontara igual, el
  // total de "ventas del mes" mentiría hacia arriba.
  const pedidosDelMes = pedidos.filter(
    (p) => esDelMesActual(p, ahora) && p.estado !== 'cancelado'
  );
  const ventasDelMes = pedidosDelMes.reduce((suma, p) => suma + p.total, 0);

  const conteoPorEstado = new Map<Pedido['estado'], number>();
  for (const pedido of pedidos) {
    conteoPorEstado.set(
      pedido.estado,
      (conteoPorEstado.get(pedido.estado) ?? 0) + 1
    );
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <div className="rounded-xl border border-ember/40 bg-ember/5 px-4 py-3">
        <p className="text-xs text-muted">Ventas de este mes</p>
        <p className="text-lg font-semibold text-foreground">
          {formatoCOP.format(ventasDelMes)}
        </p>
        <p className="text-xs text-muted">
          {pedidosDelMes.length} pedido{pedidosDelMes.length === 1 ? '' : 's'}{' '}
          (sin contar cancelados)
        </p>
      </div>
      {ESTADOS_PEDIDO.map((e) => (
        <div
          key={e.valor}
          className="rounded-xl border border-border bg-surface px-4 py-3"
        >
          <p className="text-xs text-muted">{e.etiqueta}</p>
          <p className="text-lg font-semibold text-foreground">
            {conteoPorEstado.get(e.valor) ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
}
