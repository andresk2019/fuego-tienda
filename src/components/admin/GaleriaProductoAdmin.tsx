'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  agregarFotoGaleriaProducto,
  quitarFotoGaleriaProducto,
} from '@/app/admin/actions';
import type { FotoGaleria } from '@/lib/admin-db';
import FlameIcon from '@/components/FlameIcon';

function FotoExistente({
  productoId,
  foto,
}: {
  productoId: number;
  foto: FotoGaleria;
}) {
  const [, accionQuitar] = useActionState(quitarFotoGaleriaProducto, undefined);

  return (
    <li className="relative">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
        <Image
          src={foto.fotoUrl}
          alt=""
          width={64}
          height={64}
          className="h-full w-full object-cover"
        />
      </div>
      <form action={accionQuitar}>
        <input type="hidden" name="productoId" value={productoId} />
        <input type="hidden" name="id" value={foto.id} />
        <button
          type="submit"
          title="Quitar esta foto"
          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-xs leading-none text-muted transition-colors hover:border-danger/60 hover:text-danger"
        >
          ×
        </button>
      </form>
    </li>
  );
}

function AgregarFoto({ productoId }: { productoId: number }) {
  const [estado, accion, subiendo] = useActionState(
    agregarFotoGaleriaProducto,
    undefined
  );
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
    if (estado?.ok) {
      setVistaPrevia((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return null;
      });
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [estado]);

  return (
    <form action={accion} className="flex flex-col gap-1.5">
      <input type="hidden" name="productoId" value={productoId} />
      <div className="flex items-center gap-2">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-background">
          {vistaPrevia ? (
            <Image
              src={vistaPrevia}
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <FlameIcon className="h-5 w-5 text-ember/30" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="file"
            name="foto"
            accept="image/*"
            required
            onChange={manejarSeleccion}
            className="w-32 text-[11px] text-muted file:mr-1 file:rounded-lg file:border-0 file:bg-ember file:px-1.5 file:py-1 file:text-[11px] file:font-semibold file:text-on-ember"
          />
          <button
            type="submit"
            disabled={subiendo || !vistaPrevia}
            className="w-fit rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
          >
            {subiendo ? 'Subiendo...' : 'Agregar foto'}
          </button>
        </div>
      </div>
      {estado?.error && <p className="text-[11px] text-danger">{estado.error}</p>}
    </form>
  );
}

// Galería de fotos adicionales, para CUALQUIER producto — el cliente
// las ve en la página del producto y puede hacer clic en una para que
// se muestre grande (ver GaleriaFotosProducto.tsx). No están
// asociadas a un color ni a nada más: son solo fotos, en el orden en
// que se agregaron.
export default function GaleriaProductoAdmin({
  productoId,
  fotos,
}: {
  productoId: number;
  fotos: FotoGaleria[];
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <p className="text-xs font-medium text-foreground">
        Galería de fotos
      </p>
      <p className="text-xs text-muted">
        Se muestran como miniaturas en la página del producto — el
        cliente hace clic en una para verla grande.
      </p>
      <ul className="flex flex-wrap gap-3">
        {fotos.map((foto) => (
          <FotoExistente key={foto.id} productoId={productoId} foto={foto} />
        ))}
        <li>
          <AgregarFoto productoId={productoId} />
        </li>
      </ul>
    </div>
  );
}
