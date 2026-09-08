'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { subirLogo } from '@/app/admin/actions';
import FlameIcon from '@/components/FlameIcon';

export default function SubirLogoForm({ logoUrl }: { logoUrl: string | null }) {
  const [estado, accion, subiendo] = useActionState(subirLogo, undefined);

  // Igual que en las fotos de producto: vista previa local del
  // archivo elegido antes de confirmarlo — permite ver cómo quedaría
  // el logo sin que el cambio ya esté en producción.
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo de Fuego"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FlameIcon className="h-6 w-6 text-ember/30" />
              )}
            </div>
            <span className="text-[10px] text-muted">Actual</span>
          </div>

          {vistaPrevia && (
            <div className="flex flex-col items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vistaPrevia}
                alt="Vista previa del logo"
                className="h-16 w-16 shrink-0 rounded-lg border-2 border-ember object-cover"
              />
              <span className="text-[10px] font-medium text-ember">
                Nuevo (sin guardar)
              </span>
            </div>
          )}
        </div>

        <form
          action={accion}
          className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
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
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
          >
            {subiendo ? 'Subiendo...' : 'Confirmar y subir'}
          </button>
        </form>
      </div>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && <p className="text-xs text-ember">¡Logo actualizado!</p>}
    </div>
  );
}
