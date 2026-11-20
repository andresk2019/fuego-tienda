'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Desplegable from '@/components/Desplegable';
import { prepararInputImagen } from '@/lib/preparar-imagen';
import Image from 'next/image';
import {
  subirFotoProducto,
  quitarFoto,
  guardarDescripcion,
  guardarDestacado,
  guardarCategoria,
  guardarSubcategoria,
  guardarDescuentoDeProducto,
} from '@/app/admin/actions';
import { CATEGORIAS, type CategoriaSlug } from '@/lib/categorias';
import { SECCIONES, type SubcategoriaSlug } from '@/lib/secciones';
import { DESCUENTO_MINIMO, DESCUENTO_MAXIMO } from '@/lib/promociones';
import type { DescuentoProductoAdmin } from '@/lib/admin-db';
import FlameIcon from '@/components/FlameIcon';
import TarjetaProducto from '@/components/TarjetaProducto';
import FichaProducto from '@/components/FichaProducto';
import CampoTextoBloqueable from './CampoTextoBloqueable';
import GaleriaProductoAdmin from './GaleriaProductoAdmin';
import type { FotoGaleria } from '@/lib/admin-db';

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

// "2026-11-30" -> "30 nov 2026", sin pasar por Date (que lo leería como
// UTC y podría mostrar el día anterior según la zona horaria).
function formatearFechaCorta(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${dia} ${meses[mes - 1]} ${anio}`;
}

export default function SubirFotoForm({
  productoId,
  nombre,
  precioVenta,
  categoria,
  subcategoria,
  disponible,
  pocasUnidades,
  personalizable,
  fotoUrl,
  descripcion,
  destacado,
  fotosGaleria,
  descuentoPropio,
}: {
  productoId: number;
  nombre: string;
  precioVenta: number;
  categoria: CategoriaSlug;
  subcategoria: SubcategoriaSlug;
  disponible: boolean;
  pocasUnidades: boolean;
  personalizable: boolean;
  fotoUrl: string | null;
  descripcion: string;
  destacado: boolean;
  fotosGaleria: FotoGaleria[];
  descuentoPropio: DescuentoProductoAdmin | null;
}) {
  const [estadoFoto, accionFoto, subiendoFoto] = useActionState(
    subirFotoProducto,
    undefined
  );
  const [estadoQuitarFoto, accionQuitarFoto, quitandoFoto] = useActionState(
    quitarFoto,
    undefined
  );
  const [estadoDestacado, accionDestacado] = useActionState(
    guardarDestacado,
    undefined
  );
  const [estadoCategoria, accionCategoria] = useActionState(
    guardarCategoria,
    undefined
  );
  const [estadoDescuento, accionDescuento] = useActionState(
    guardarDescuentoDeProducto,
    undefined
  );
  const [estadoSubcategoria, accionSubcategoria] = useActionState(
    guardarSubcategoria,
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

  // Las fotos de celular pesan más de lo que Vercel deja pasar (~4.5MB
  // por petición): se reducen aquí, en el navegador, antes de subirlas
  // (ver preparar-imagen.ts).
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);

  async function manejarSeleccionArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    setErrorImagen(null);
    setVistaPrevia((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return null;
    });
    setPreparando(true);
    const error = await prepararInputImagen(input);
    setPreparando(false);
    if (error) {
      setErrorImagen(error);
      return;
    }
    const archivo = input.files?.[0];
    setVistaPrevia(archivo ? URL.createObjectURL(archivo) : null);
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

        {/* Solo tiene sentido si ya hay una foto que quitar — antes
            solo se podía reemplazar, nunca dejar el producto sin
            foto. */}
        {fotoUrl && (
          <form action={accionQuitarFoto} className="contents">
            <input type="hidden" name="productoId" value={productoId} />
            <button
              type="submit"
              disabled={quitandoFoto}
              title="Quitar la foto principal"
              className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-danger/60 hover:text-danger disabled:opacity-60"
            >
              {quitandoFoto ? '...' : 'Quitar foto'}
            </button>
          </form>
        )}

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

        <form action={accionCategoria} className="contents">
          <input type="hidden" name="productoId" value={productoId} />
          <Desplegable
            // `key` remonta el desplegable cuando `categoria` cambia tras
            // guardar (mismo motivo que el de estado en ListaPedidos.tsx):
            // al no ser controlado, sin esto quedaría mostrando lo último
            // que se eligió en vez del valor guardado.
            key={categoria}
            name="categoria"
            defaultValue={categoria}
            title="Categoría por ocasión (Navidad, Día de la Madre...)"
            ariaLabel="Categoría por ocasión"
            enviarAlElegir
            opciones={CATEGORIAS.map((c) => ({ valor: c.slug, etiqueta: c.nombre }))}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
          />
        </form>

        {/* Sección donde aparece en la tienda — con TODAS las opciones
            (Velas, Difusores, Sales, Exfoliantes, Accesorios...). Al
            cambiarla, el producto pasa a la pestaña de su nueva sección. */}
        <form action={accionSubcategoria} className="contents">
          <input type="hidden" name="productoId" value={productoId} />
          <Desplegable
            key={subcategoria}
            name="subcategoria"
            defaultValue={subcategoria}
            ariaLabel="Sección en la tienda"
            title="Sección donde aparece en la tienda (Velas, Exfoliantes...)"
            enviarAlElegir
            opciones={SECCIONES.flatMap((seccion) =>
              seccion.subcategorias.map((sub) => ({
                valor: sub.slug,
                etiqueta: sub.nombre,
                grupo: seccion.nombre,
              }))
            )}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
          />
        </form>

        <button
          type="button"
          onClick={() => setDescripcionAbierta((v) => !v)}
          className="text-xs whitespace-nowrap text-muted underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          {descripcionAbierta
            ? 'Ocultar descripción'
            : 'Editar descripción y fotos'}
        </button>
      </div>

      {preparando && <p className="text-xs text-muted">Preparando imagen...</p>}
      {errorImagen && <p className="text-xs text-danger">{errorImagen}</p>}
      {estadoFoto?.error && <p className="text-xs text-danger">{estadoFoto.error}</p>}
      {estadoFoto?.ok && <p className="text-xs text-ember">¡Foto actualizada!</p>}
      {estadoQuitarFoto?.error && (
        <p className="text-xs text-danger">{estadoQuitarFoto.error}</p>
      )}
      {estadoDestacado?.error && (
        <p className="text-xs text-danger">{estadoDestacado.error}</p>
      )}
      {/* Descuento propio de este producto: manda siempre sobre el de una
          promo de toda la tienda (no se suman). Fecha de fin opcional. */}
      <form
        // `key` remonta los campos con lo guardado (son "no controlados").
        key={`${descuentoPropio?.porcentaje ?? ''}-${descuentoPropio?.hasta ?? ''}`}
        action={accionDescuento}
        className="flex flex-wrap items-center gap-1.5 text-xs"
      >
        <input type="hidden" name="productoId" value={productoId} />
        <span className="font-medium text-foreground">Descuento propio</span>
        <input
          type="number"
          name="porcentaje"
          min={DESCUENTO_MINIMO}
          max={DESCUENTO_MAXIMO}
          step={1}
          inputMode="numeric"
          defaultValue={descuentoPropio?.porcentaje ?? ''}
          placeholder="%"
          aria-label="Porcentaje de descuento de este producto"
          className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
        />
        <label className="flex items-center gap-1 text-muted">
          hasta
          <input
            type="date"
            name="hasta"
            defaultValue={descuentoPropio?.hasta ?? ''}
            aria-label="Fecha en que termina el descuento (opcional)"
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:border-ember/60"
        >
          {descuentoPropio ? 'Actualizar' : 'Aplicar'}
        </button>
        {descuentoPropio && (
          <button
            type="submit"
            name="quitar"
            value="1"
            formNoValidate
            className="text-xs text-muted transition-colors hover:text-danger"
          >
            Quitar
          </button>
        )}
      </form>
      {descuentoPropio && (
        <p
          className={`text-xs ${descuentoPropio.vigente ? 'text-ember' : 'text-muted'}`}
        >
          {descuentoPropio.vigente
            ? `Descuento activo: ${descuentoPropio.porcentaje}%${
                descuentoPropio.hasta
                  ? ` hasta el ${formatearFechaCorta(descuentoPropio.hasta)}`
                  : ' (sin fecha de fin)'
              }. Manda sobre cualquier promo de la tienda.`
            : `El descuento de ${descuentoPropio.porcentaje}% terminó el ${formatearFechaCorta(
                descuentoPropio.hasta ?? ''
              )} y ya no se aplica.`}
        </p>
      )}
      {estadoDescuento?.error && (
        <p className="text-xs text-danger">{estadoDescuento.error}</p>
      )}
      {estadoSubcategoria?.error && (
        <p className="text-xs text-danger">{estadoSubcategoria.error}</p>
      )}
      {estadoCategoria?.error && (
        <p className="text-xs text-danger">{estadoCategoria.error}</p>
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

          <GaleriaProductoAdmin productoId={productoId} fotos={fotosGaleria} />
        </div>
      )}
    </li>
  );
}
