// Le da al cliente "la experiencia" del aroma que va eligiendo en el
// desplegable — cambia de texto en cuanto cambia la selección, sin
// recargar nada (ver AgregarAlCarrito.tsx / PersonalizarVela.tsx, que
// le pasan la descripción del aroma actualmente elegido).
//
// Si el aroma elegido todavía no tiene descripción guardada desde el
// panel de administración, no se muestra nada — no tiene sentido un
// espacio vacío o un aviso de "falta descripción" de cara al cliente.
export default function DescripcionAroma({
  descripcion,
}: {
  descripcion: string | undefined;
}) {
  if (!descripcion) return null;

  return (
    <p className="max-w-xs rounded-lg border border-border bg-background/60 p-3 text-sm text-muted italic">
      {descripcion}
    </p>
  );
}
