'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { subirLogo } from '@/app/admin/actions';
import Hero from '@/components/Hero';

export default function SubirLogoForm({ logoUrl }: { logoUrl: string | null }) {
  const [estado, accion, subiendo] = useActionState(subirLogo, undefined);

  // Igual que en las fotos de producto: vista previa local del
  // archivo elegido antes de confirmarlo, mostrada dentro del Hero
  // real de la portada — así se ve exactamente cómo quedaría, sin que
  // el cambio ya esté en producción.
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  function manejarSeleccionArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    setVistaPrevia((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return archivo ? URL.createObjectURL(archivo) : null;
    });
  }

  useEffect(() => {
    if (estado?.ok) {
      setVistaPrevia((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return null;
      });
      if (inputArchivoRef.current) inputArchivoRef.current.value = '';
    }
  }, [estado]);

  return (
    <div className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-foreground">
        Logo de la tienda
      </h2>
      <p className="text-xs text-muted">
        Aparece en la portada, en el mensaje de "Bienvenido a Fuego".
      </p>

      <div
        className={`grid grid-cols-1 gap-4 ${vistaPrevia ? 'md:grid-cols-2' : ''}`}
      >
        <div className="overflow-hidden rounded-xl border border-border">
          <p className="border-b border-border bg-background/60 px-3 py-1.5 text-[10px] font-medium tracking-wide whitespace-nowrap text-muted uppercase">
            Ahora en producción
          </p>
          <div className="pointer-events-none">
            <Hero logoUrl={logoUrl} />
          </div>
        </div>
        {vistaPrevia && (
          <div className="overflow-hidden rounded-xl border border-ember/40">
            <p className="border-b border-ember/40 bg-background/60 px-3 py-1.5 text-[10px] font-medium tracking-wide whitespace-nowrap text-ember uppercase">
              Con el cambio (sin guardar)
            </p>
            <div className="pointer-events-none">
              <Hero logoUrl={vistaPrevia} />
            </div>
          </div>
        )}
      </div>

      <form
        action={accion}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
      >
        <input
          ref={inputArchivoRef}
          type="file"
          name="logo"
          accept="image/*"
          required
          onChange={manejarSeleccionArchivo}
          className="text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-ember file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-ember"
        />
        <button
          type="submit"
          disabled={subiendo || !vistaPrevia}
          className="w-fit rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
        >
          {subiendo ? 'Subiendo...' : 'Confirmar y subir'}
        </button>
      </form>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && <p className="text-xs text-ember">¡Logo actualizado!</p>}
    </div>
  );
}
