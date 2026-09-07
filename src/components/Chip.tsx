"use client";

export default function Chip({
  activo,
  onClick,
  size = "md",
  children,
}: {
  activo: boolean;
  onClick: () => void;
  size?: "md" | "lg";
  children: React.ReactNode;
}) {
  const tamano =
    size === "lg" ? "px-5 py-2 text-sm" : "px-4 py-1.5 text-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-full border font-medium transition-colors ${tamano} ${
        activo
          ? "border-ember bg-ember text-on-ember"
          : "border-border text-muted hover:border-ember/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
