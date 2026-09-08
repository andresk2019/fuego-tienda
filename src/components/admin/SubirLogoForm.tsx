'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { subirLogo } from '@/app/admin/actions';
import Hero from '@/components/Hero';
import FlameIcon from '@/components/FlameIcon';

export default function SubirLogoForm({ logoUrl }: { logoUrl: string | null }) {
  const [estado, accion, subiendo] = useActionState(subirLogo, undefined);

  // Igual que en las fotos de producto: vista previa local del
  // archivo elegido antes de confirmarlo, mostrada dentro del Hero
  // real de la portada. El espejo completo (antes/después) solo
  // aparece mientras haya un archivo elegido sin confirmar — el resto
  // del tiempo queda solo la miniatura, para no ocupar tanto espacio.
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
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo de Fuego"
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <FlameIcon className="h-5 w-5 text-ember/30" />
          )}
        </div>

        <div className="min-w-[100px] flex-1">
          <p className="text-sm font-medium text-foreground">
            Logo de la tienda
          </p>
          <p className="text-xs text-muted">
            Aparece en la portada ("Bienvenido a Fuego")
          </p>
        </div>

        <form
          action={accion}
          className="flex items-center gap-2"
        >
          <input
            ref={inputArchivoRef}
            type="file"
            name="logo"
            accept="image/*"
            required
            onChange={manejarSeleccionArchivo}
            className="w-36 text-xs text-muted file:mr-1 file:rounded-lg file:border-0 file:bg-ember file:px-2 file:py-1 file:text-xs file:font-semibold file:text-on-ember"
          />
          <button
            type="submit"
            disabled={subiendo || !vistaPrevia}
            className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
          >
            {subiendo ? '...' : 'Subir'}
          </button>
        </form>
      </div>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && <p className="text-xs text-ember">¡Logo actualizado!</p>}

      {/* Espejo completo del Hero — solo mientras haya un archivo
          elegido sin confirmar. */}
      {vistaPrevia && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <p className="border-b border-border bg-background/60 px-3 py-1.5 text-[10px] font-medium tracking-wide whitespace-nowrap text-muted uppercase">
              Ahora en producción
            </p>
            <div className="pointer-events-none">
              <Hero logoUrl={logoUrl} />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-ember/40">
            <p className="border-b border-ember/40 bg-background/60 px-3 py-1.5 text-[10px] font-medium tracking-wide whitespace-nowrap text-ember uppercase">
              Con el cambio (sin guardar)
            </p>
            <div className="pointer-events-none">
              <Hero logoUrl={vistaPrevia} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
