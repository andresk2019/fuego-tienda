'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  subirFotoProducto,
  guardarDescripcion,
  guardarDestacado,
} from '@/app/admin/actions';
import type { CategoriaSlug } from '@/lib/categorias';
import FlameIcon from '@/components/FlameIcon';
import TarjetaProducto from '@/components/TarjetaProducto';
import FichaProducto from '@/components/FichaProducto';
import CampoTextoBloqueable from './CampoTextoBloqueable';

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function SubirFotoForm({
  productoId,
  nombre,
  precioVenta,
  categoria,
  disponible,
  pocasUnidades,
  personalizable,
  fotoUrl,
  descripcion,
  destacado,
}: {
  productoId: number;
  nombre: string;
  precioVenta: number;
  categoria: CategoriaSlug;
  disponible: boolean;
  pocasUnidades: boolean;
  personalizable: boolean;
  fotoUrl: string | null;
  descripcion: string;
  destacado: boolean;
}) {
  const [estadoFoto, accionFoto, subiendoFoto] = useActionState(
    subirFotoProducto,
    undefined
  );
  const [estadoDestacado, accionDestacado] = useActionState(
    guardarDestacado,
    undefined
  );

  // Vista previa del archivo elegido, ANTES de subirlo de verdad — así
  // se puede ver cómo quedaría la tarjeta del catálogo sin que el
  // cambio ya esté en producción. Se genera localmente en el
  // navegador (URL.createObjectURL), no toca el servidor todavía. El
  // espejo completo (antes/después) solo aparece mientras haya una
  // vista previa pendiente — el resto del tiempo la fila queda
  // compacta, para no obligar a hacer scroll por todos los productos.
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
    if (estadoFoto?.ok) {
      setVistaPrevia((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return null;
      });
      if (inputArchivoRef.current) inputArchivoRef.current.value = '';
    }
  }, [estadoFoto]);

  // La descripción queda colapsada por defecto (es lo que más ocupa) —
  // se abre solo si el admin quiere editarla.
  const [descripcionAbierta, setDescripcionAbierta] = useState(false);
  const [descripcionEnVivo, setDescripcionEnVivo] = useState(descripcion);
  const hayCambioDescripcion = descripcionEnVivo !== descripcion;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
      {/* Fila compacta, siempre visible */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
          {fotoUrl ? (
            <Image
              src={fotoUrl}
              alt={nombre}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <FlameIcon className="h-5 w-5 text-ember/30" />
          )}
        </div>

        <div className="min-w-[100px] flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {nombre}
          </p>
          <p className="text-xs text-muted">{formatoCOP.format(precioVenta)}</p>
        </div>

        <form action={accionFoto} className="flex items-center gap-2">
          <input type="hidden" name="productoId" value={productoId} />
          <input
            ref={inputArchivoRef}
            type="file"
            name="foto"
            accept="image/*"
            required
            onChange={manejarSeleccionArchivo}
            className="w-36 text-xs text-muted file:mr-1 file:rounded-lg file:border-0 file:bg-ember file:px-2 file:py-1 file:text-xs file:font-semibold file:text-on-ember"
          />
          <button
            type="submit"
            disabled={subiendoFoto || !vistaPrevia}
            className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-60"
          >
            {subiendoFoto ? '...' : 'Subir'}
          </button>
        </form>

        {/* className="contents": el <form> no afecta el layout, el
            <label> de adentro se acomoda como si estuviera directo en
            la fila flex de arriba. */}
        <form action={accionDestacado} className="contents">
          <input type="hidden" name="productoId" value={productoId} />
          <label className="flex items-center gap-1.5 text-xs whitespace-nowrap text-foreground">
            <input
              type="checkbox"
              name="destacado"
              defaultChecked={destacado}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="h-4 w-4 rounded border-border accent-ember"
            />
            Destacar
          </label>
        </form>

        <button
          type="button"
          onClick={() => setDescripcionAbierta((v) => !v)}
          className="text-xs whitespace-nowrap text-muted underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          {descripcionAbierta ? 'Ocultar descripción' : 'Editar descripción'}
        </button>
      </div>

      {estadoFoto?.error && <p className="text-xs text-danger">{estadoFoto.error}</p>}
      {estadoFoto?.ok && <p className="text-xs text-ember">¡Foto actualizada!</p>}
      {estadoDestacado?.error && (
        <p className="text-xs text-danger">{estadoDestacado.error}</p>
      )}

      {/* Espejo de la tarjeta del catálogo — solo mientras haya un
          archivo elegido sin confirmar. */}
      {vistaPrevia && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[10px] font-medium tracking-wide whitespace-nowrap text-muted uppercase">
              Ahora en producción
            </p>
            <TarjetaProducto
              nombre={nombre}
              precioVenta={precioVenta}
              fotoUrl={fotoUrl}
              disponible={disponible}
              pocasUnidades={pocasUnidades}
              personalizable={personalizable}
            />
          </div>
          <div>
            <p className="mb-2 text-[10px] font-medium tracking-wide whitespace-nowrap text-ember uppercase">
              Con el cambio (sin guardar)
            </p>
            <TarjetaProducto
              nombre={nombre}
              precioVenta={precioVenta}
              fotoUrl={vistaPrevia}
              disponible={disponible}
              pocasUnidades={pocasUnidades}
              personalizable={personalizable}
            />
          </div>
        </div>
      )}

      {/* Descripción — colapsada por defecto */}
      {descripcionAbierta && (
        <div className="border-t border-border pt-3">
          {hayCambioDescripcion && (
            <div className="mb-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-medium tracking-wide whitespace-nowrap text-muted uppercase">
                  Ahora en producción
                </p>
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <FichaProducto
                    categoria={categoria}
                    nombre={nombre}
                    precioVenta={precioVenta}
                    disponible={disponible}
                    pocasUnidades={pocasUnidades}
                    descripcion={descripcion}
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-medium tracking-wide whitespace-nowrap text-ember uppercase">
                  Con el cambio (sin guardar)
                </p>
                <div className="rounded-xl border border-ember/40 bg-background/40 p-4">
                  <FichaProducto
                    categoria={categoria}
                    nombre={nombre}
                    precioVenta={precioVenta}
                    disponible={disponible}
                    pocasUnidades={pocasUnidades}
                    descripcion={descripcionEnVivo}
                  />
                </div>
              </div>
            </div>
          )}

          <CampoTextoBloqueable
            etiqueta="Descripción"
            valorInicial={descripcion}
            accion={guardarDescripcion}
            nombreCampoTexto="descripcion"
            camposOcultos={{ productoId }}
            placeholder="Descripción para mostrar en la página del producto..."
            rows={3}
            onCambiaValorEnVivo={setDescripcionEnVivo}
          />
        </div>
      )}
    </li>
  );
}
