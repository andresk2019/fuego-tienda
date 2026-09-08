import FlameIcon from "@/components/FlameIcon";

// Layout propio de /admin — a propósito NO incluye el header/footer
// público (SiteHeader/SiteFooter, con el menú Inicio/Catálogo/etc.):
// antes, al hacer clic en esos links desde el panel, se salía de
// /admin sin darse cuenta y parecía que "el admin desaparecía". Aquí
// solo hay una marca simple, sin navegación que saque del panel.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-border px-6 py-4">
        <FlameIcon className="h-5 w-5 text-ember" />
        <span className="font-serif text-lg text-foreground">
          Panel de Fuego
        </span>
      </header>
      {children}
    </div>
  );
}
