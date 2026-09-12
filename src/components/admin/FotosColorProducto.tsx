'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  subirFotoColorProducto,
  quitarFotoColorProducto,
} from '@/app/admin/actions';
import { COLORES_DISPONIBLES } from '@/lib/personalizacion';
import FlameIcon from '@/components/FlameIcon';

function FilaColor({
  productoId,
  color,
  fotoUrl,
}: {
  productoId: number;
  color: string;
  fotoUrl: string | null;
}) {
  const [estadoSubida, accionSubida, subiendo] = useActionState(
    subirFotoColorProducto,
    undefined
  );
  const [, accionQuitar] = useActionState(quitarFotoColorProducto, undefined);

  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function manejarSeleccion(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    setVistaPrevia((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return archivo ? URL.createObjectURL(archivo) : null;
    });
  }

  useEffect(() => {
    if (estadoSubida?.ok) {
      setVistaPrevia((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return null;
      });
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [estadoSubida]);

  const mostrar = vistaPrevia ?? fotoUrl;

  return (
    <li className="flex flex-wrap items-center gap-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
        {mostrar ? (
          <Image
            src={mostrar}
            alt={color}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <FlameIcon className="h-4 w-4 text-ember/30" />
        )}
      </div>

      <span className="w-16 shrink-0 text-xs font-medium text-foreground">
        {color}
      </span>

      <form action={accionSubida} className="flex items-center gap-1.5">
        <input type="hidden" name="productoId" value={productoId} />
        <input type="hidden" name="color" value={color} />
        <input
          ref={inputRef}
          type="file"
          name="foto"
          accept="image/*"
          required
          onChange={manejarSeleccion}
          className="w-28 text-[11px] text-muted file:mr-1 file:rounded-lg file:border-0 file:bg-ember file:px-1.5 file:py-1 file:text-[11px] file:font-semibold file:text-on-ember"
        />
        <button
          type="submit"
          disabled={subiendo || !vistaPrevia}
          className="shrink-0 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
        >
          {subiendo ? '...' : 'Subir'}
        </button>
      </form>

      {fotoUrl && (
        <form action={accionQuitar}>
          <input type="hidden" name="productoId" value={productoId} />
          <input type="hidden" name="color" value={color} />
          <button
            type="submit"
            className="text-[11px] text-muted transition-colors hover:text-danger"
          >
            Quitar
          </button>
        </form>
      )}

      {estadoSubida?.error && (
        <span className="w-full text-[11px] text-danger">
          {estadoSubida.error}
        </span>
      )}
    </li>
  );
}

// Solo se muestra para las velas personalizables (ver esPersonalizable
// en personalizacion.ts) — el cliente elige un color solo en esas, así
// que solo ahí tiene sentido dejar una foto por color. Si un color no
// tiene foto propia, la vela sigue mostrando la foto principal de
// siempre en la tienda (ver GaleriaYPersonalizacion.tsx).
export default function FotosColorProducto({
  productoId,
  fotosPorColor,
}: {
  productoId: number;
  fotosPorColor: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <p className="text-xs font-medium text-foreground">Fotos por color</p>
      <p className="text-xs text-muted">
        Se muestran cuando el cliente personaliza esta vela y elige un
        color. Si un color no tiene foto, se sigue mostrando la foto
        principal de arriba.
      </p>
      <ul className="flex flex-col gap-2">
        {COLORES_DISPONIBLES.map((color) => (
          <FilaColor
            key={color}
            productoId={productoId}
            color={color}
            fotoUrl={fotosPorColor[color] ?? null}
          />
        ))}
      </ul>
    </div>
  );
}
