"use client";

export default function Chip({
  activo,
  onClick,
  size = "md",
  variant = "solido",
  children,
}: {
  activo: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  // "solido": se rellena de ember cuando está activo — para la
  // subcategoría (nivel 2). "contorno": nunca se rellena, solo cambia
  // el borde/texto — para filtros más livianos como la categoría por
  // ocasión (nivel 3), que no debe verse tan protagonista como la
  // subcategoría.
  variant?: "solido" | "contorno";
  children: React.ReactNode;
}) {
  const tamano =
    size === "lg"
      ? "px-5 py-2 text-sm"
      : size === "sm"
        ? "px-3 py-1 text-xs"
        : "px-4 py-1.5 text-sm";

  const estilo =
    variant === "solido"
      ? activo
        ? "border-ember bg-ember text-on-ember"
        : "border-border text-muted hover:border-ember/60 hover:text-foreground"
      : activo
        ? "border-ember bg-ember/10 text-ember"
        : "border-border text-muted hover:border-ember/60 hover:text-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-full border font-medium transition-colors ${tamano} ${estilo}`}
    >
      {children}
    </button>
  );
}
