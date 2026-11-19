'use client';

import { useActionState, useCallback, useEffect, useState } from 'react';
import { prepararInputImagen } from '@/lib/preparar-imagen';
import Image from 'next/image';
import {
  agregarPromocion,
  editarPromocion,
  actualizarActiva,
  borrarPromocion,
} from '@/app/admin/promociones/actions';
import {
  DESCUENTO_MAXIMO,
  DESCUENTO_MINIMO,
  ESTILOS_PROMOCION,
  FONDOS_PROMOCION,
  LONGITUD_MAXIMA_SELLO,
  ETIQUETA_ESTADO,
  LONGITUD_MAXIMA_TEXTO,
  LONGITUD_MAXIMA_TITULO,
  type EstadoPromocion,
  type Promocion,
} from '@/lib/promociones';

const CLASES_ESTADO: Record<EstadoPromocion, string> = {
  vigente: 'bg-ember/15 text-ember',
  programada: 'bg-gold/15 text-gold',
  vencida: 'bg-surface-hover text-muted',
  desactivada: 'bg-surface-hover text-muted',
};

const CLASE_CAMPO =
  'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60';

// "2026-11-27" -> "27 nov 2026", sin pasar por Date (que lo leería
// como UTC y podría mostrar el día anterior según la zona horaria).
function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${dia} ${meses[mes - 1]} ${anio}`;
}

function describirFechas(p: Promocion): string {
  if (p.inicio && p.fin) return `Del ${formatearFecha(p.inicio)} al ${formatearFecha(p.fin)}`;
  if (p.inicio) return `Desde el ${formatearFecha(p.inicio)}, sin fecha de fin`;
  if (p.fin) return `Hasta el ${formatearFecha(p.fin)}`;
  return 'Sin fechas (se muestra mientras esté activa)';
}

type ProductoSelector = { id: number; nombre: string; conFoto: boolean };

// Los campos de una promoción — los comparten crear y editar. Con
// `promocion` (editar) arranca con sus valores; sin ella (crear), vacío.
function FormularioPromocion({
  productos,
  promocion,
  accion,
  guardando,
  error,
  textoBoton,
  alCancelar,
}: {
  productos: ProductoSelector[];
  promocion?: Promocion;
  accion: (formData: FormData) => void;
  guardando: boolean;
  error?: string;
  textoBoton: string;
  alCancelar?: () => void;
}) {
  const [conDescuento, setConDescuento] = useState(
    promocion?.descuentoPorcentaje != null
  );
  const [estilo, setEstilo] = useState<string>(promocion?.estilo ?? 'normal');
  // Las fotos de celular pesan más de lo que Vercel deja pasar (~4.5MB
  // por petición): se reducen aquí, en el navegador, antes de subirlas
  // (ver preparar-imagen.ts).
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);

  async function alElegirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    setErrorImagen(null);
    setPreparando(true);
    const error = await prepararInputImagen(e.currentTarget);
    setPreparando(false);
    if (error) setErrorImagen(error);
  }

  return (
    <form
      action={accion}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      {promocion && <input type="hidden" name="promocionId" value={promocion.id} />}
      <input
        type="text"
        name="titulo"
        required
        maxLength={LONGITUD_MAXIMA_TITULO}
        defaultValue={promocion?.titulo}
        placeholder="Título (ej. Black Friday: 20% en toda la tienda)"
        className={CLASE_CAMPO}
      />
      <textarea
        name="texto"
        rows={2}
        maxLength={LONGITUD_MAXIMA_TEXTO}
        defaultValue={promocion?.texto}
        placeholder="Texto corto (opcional, ej. Solo este fin de semana)"
        className={CLASE_CAMPO}
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Estilo</span>
          <select
            name="estilo"
            value={estilo}
            onChange={(e) => setEstilo(e.target.value)}
            className={CLASE_CAMPO}
          >
            {ESTILOS_PROMOCION.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.nombre}
              </option>
            ))}
          </select>
        </label>
        {/* Oculto (no desmontado) fuera del estilo aniversario, para no
            perder lo escrito si se cambia de estilo y se vuelve. El
            servidor lo ignora si el estilo no es aniversario. */}
        <label
          className={estilo === 'aniversario' ? 'flex flex-col gap-1 text-sm' : 'hidden'}
        >
          <span className="font-medium text-foreground">Sello (opcional)</span>
          <input
            type="text"
            name="sello"
            maxLength={LONGITUD_MAXIMA_SELLO}
            defaultValue={promocion?.sello ?? ''}
            placeholder="Ej. 5 años"
            className={`w-36 ${CLASE_CAMPO}`}
          />
        </label>
      </div>
      {estilo === 'aniversario' && (
        <p className="-mt-1 text-xs text-muted">
          Fondo oscuro con dorado, confeti que cae, título con brillo y un
          sello redondo (ej. &ldquo;5 años&rdquo;) en la franja, los banners
          y el pop-up. Se ve igual en el celular y no usa video. Con
          &ldquo;Banners&rdquo; marcado, el banner reemplaza el logo del
          encabezado en todas las páginas, para que el cliente no tenga que
          bajar tanto.
        </p>
      )}

      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-1 font-medium text-foreground">Fondo del banner</legend>
        <p className="text-xs text-muted">
          Elige uno de los fondos listos, o pon una foto más abajo (la de un
          producto o una tuya). Si pones una foto, esa se usa en vez del fondo.
        </p>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="fondo"
              value=""
              defaultChecked={!promocion?.fondo}
              className="peer sr-only"
            />
            <span className="flex h-14 w-24 items-center justify-center rounded-lg border-2 border-border bg-background text-center text-[11px] leading-tight text-muted peer-checked:border-ember peer-checked:ring-2 peer-checked:ring-ember/40 peer-focus-visible:ring-2 peer-focus-visible:ring-ember">
              Por defecto
            </span>
          </label>
          {FONDOS_PROMOCION.map((f) => (
            <label key={f.valor} className="cursor-pointer">
              <input
                type="radio"
                name="fondo"
                value={f.valor}
                defaultChecked={promocion?.fondo === f.valor}
                className="peer sr-only"
              />
              <span
                style={{ backgroundImage: f.css }}
                className="flex h-14 w-24 items-end rounded-lg border-2 border-transparent p-1.5 text-[11px] font-medium text-[#fff3c4] peer-checked:border-ember peer-checked:ring-2 peer-checked:ring-ember/40 peer-focus-visible:ring-2 peer-focus-visible:ring-ember"
              >
                {f.nombre}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2 text-sm">
        {promocion?.imagenUrl && (
          <div className="flex flex-wrap items-center gap-3">
            <Image
              src={promocion.imagenUrl}
              alt="Imagen actual del banner"
              width={96}
              height={64}
              className="h-16 w-24 shrink-0 rounded-lg border border-border object-cover"
            />
            <label className="flex items-center gap-2 text-foreground">
              <input
                type="checkbox"
                name="quitarImagen"
                className="h-4 w-4 rounded border-border accent-ember"
              />
              Quitar la imagen actual
            </label>
          </div>
        )}
        <label className="flex flex-col gap-1">
          <span className="font-medium text-foreground">
            Usar la foto de un producto (opcional)
          </span>
          <select
            name="imagenProductoId"
            defaultValue=""
            className={CLASE_CAMPO}
          >
            <option value="">— Ninguno —</option>
            {productos
              .filter((p) => p.conFoto)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-medium text-foreground">
            {promocion?.imagenUrl
              ? 'O sube otra imagen (opcional)'
              : 'O sube una imagen tuya (opcional)'}
          </span>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            onChange={alElegirImagen}
            className="text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-ember file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-ember"
          />
          <span className="text-xs text-muted">
            Mejor si es ancha (ej. 1200 × 400). Una imagen subida manda sobre
            la foto de un producto.
          </span>
          {preparando && <span className="text-xs text-muted">Preparando imagen...</span>}
          {errorImagen && <span className="text-xs text-danger">{errorImagen}</span>}
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-foreground">Enlace (opcional)</span>
        <input
          type="text"
          name="enlace"
          defaultValue={promocion?.enlace ?? ''}
          placeholder="/catalogo"
          className={CLASE_CAMPO}
        />
        <span className="text-xs text-muted">
          A dónde lleva al hacer clic. Una ruta de la tienda (ej. /catalogo)
          o una dirección que empiece por https://
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Empieza (opcional)</span>
          <input
            type="date"
            name="inicio"
            defaultValue={promocion?.inicio ?? ''}
            className={CLASE_CAMPO}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Termina (opcional)</span>
          <input
            type="date"
            name="fin"
            defaultValue={promocion?.fin ?? ''}
            className={CLASE_CAMPO}
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-background/50 p-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">
            Descuento en productos, % (opcional)
          </span>
          <input
            type="number"
            name="descuento"
            min={DESCUENTO_MINIMO}
            max={DESCUENTO_MAXIMO}
            step={1}
            inputMode="numeric"
            defaultValue={promocion?.descuentoPorcentaje ?? ''}
            placeholder="Ej. 20"
            onChange={(e) => setConDescuento(e.target.value.trim() !== '')}
            className={`w-32 ${CLASE_CAMPO}`}
          />
          <span className="text-xs text-muted">
            Si lo llenas, ese porcentaje se rebaja de verdad del precio de
            todos los productos mientras la promo esté vigente (con el
            precio normal tachado). Vacío = la promo solo anuncia, no cambia
            precios. No incluye el envío.
          </span>
        </label>

        {/* Oculto (no desmontado) cuando no hay descuento, para no
            perder las exclusiones marcadas si se borra y se vuelve a
            escribir el porcentaje. El servidor las ignora sin descuento. */}
        <details
          open={promocion?.productosExcluidos.length ? true : undefined}
          className={conDescuento ? 'text-sm' : 'hidden'}
        >
          <summary className="cursor-pointer font-medium text-foreground">
            Productos que NO entran en el descuento (opcional)
          </summary>
          <ul className="mt-2 grid max-h-48 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
            {productos.map((p) => (
              <li key={p.id}>
                <label className="flex items-center gap-2 text-foreground">
                  <input
                    type="checkbox"
                    name="productosExcluidos"
                    value={p.id}
                    defaultChecked={promocion?.productosExcluidos.includes(p.id)}
                    className="h-4 w-4 rounded border-border accent-ember"
                  />
                  {p.nombre}
                </label>
              </li>
            ))}
          </ul>
        </details>
      </div>

      <fieldset className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground">
        <legend className="mb-1 font-medium">Dónde se muestra</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enFranja"
            defaultChecked={promocion ? promocion.enFranja : true}
            className="h-4 w-4 rounded border-border accent-ember"
          />
          Franja superior (en todas las páginas)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enPortada"
            defaultChecked={promocion ? promocion.enPortada : true}
            className="h-4 w-4 rounded border-border accent-ember"
          />
          Banners (portada, catálogo y carrito)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enPopup"
            defaultChecked={promocion ? promocion.enPopup : false}
            className="h-4 w-4 rounded border-border accent-ember"
          />
          Pop-up al entrar (una vez por visita)
        </label>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={guardando || preparando}
          className="w-fit rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-on-ember transition-colors hover:bg-ember-hover disabled:opacity-60"
        >
          {guardando ? 'Guardando...' : textoBoton}
        </button>
        {alCancelar && (
          <button
            type="button"
            onClick={alCancelar}
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Cancelar
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}

function FormularioNuevaPromocion({ productos }: { productos: ProductoSelector[] }) {
  const [estado, accion, guardando] = useActionState(agregarPromocion, undefined);
  // Al crear con éxito, el formulario se vuelve a montar desde cero
  // (vacío, incluido el campo de archivo) cambiando su `key`.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (estado?.ok) setVersion((v) => v + 1);
  }, [estado]);

  return (
    <div className="flex flex-col gap-2">
      <FormularioPromocion
        key={version}
        productos={productos}
        accion={accion}
        guardando={guardando}
        error={estado?.error}
        textoBoton="Crear promoción"
      />
      {estado?.ok && <p className="text-xs text-ember">¡Promoción creada!</p>}
    </div>
  );
}

function FormularioEditarPromocion({
  promocion,
  productos,
  alCerrar,
}: {
  promocion: Promocion;
  productos: ProductoSelector[];
  alCerrar: () => void;
}) {
  const [estado, accion, guardando] = useActionState(editarPromocion, undefined);

  useEffect(() => {
    if (estado?.ok) alCerrar();
  }, [estado, alCerrar]);

  return (
    <FormularioPromocion
      productos={productos}
      promocion={promocion}
      accion={accion}
      guardando={guardando}
      error={estado?.error}
      textoBoton="Guardar cambios"
      alCancelar={alCerrar}
    />
  );
}

function FilaPromocion({
  promocion,
  productos,
}: {
  promocion: Promocion;
  productos: ProductoSelector[];
}) {
  const nombrePorId = new Map(productos.map((p) => [p.id, p.nombre]));
  const excluidos = promocion.productosExcluidos.map(
    (id) => nombrePorId.get(id) ?? `#${id}`
  );
  const [estado, accionActiva] = useActionState(actualizarActiva, undefined);
  // Borrar es irreversible — se confirma con un segundo paso propio,
  // igual que en las reseñas (ver ListaResenas.tsx).
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false);
  const [editando, setEditando] = useState(false);
  const cerrarEdicion = useCallback(() => setEditando(false), []);

  if (editando) {
    return (
      <li>
        <FormularioEditarPromocion
          promocion={promocion}
          productos={productos}
          alCerrar={cerrarEdicion}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          {promocion.imagenUrl && (
            <Image
              src={promocion.imagenUrl}
              alt=""
              width={96}
              height={64}
              className="h-16 w-24 shrink-0 rounded-lg border border-border object-cover"
            />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{promocion.titulo}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${CLASES_ESTADO[promocion.estado]}`}
              >
                {ETIQUETA_ESTADO[promocion.estado]}
              </span>
            </div>
            {promocion.texto && (
              <p className="mt-0.5 text-sm text-muted">{promocion.texto}</p>
            )}
            <p className="mt-1 text-xs text-muted">{describirFechas(promocion)}</p>
            {promocion.descuentoPorcentaje !== null && (
              <p className="mt-0.5 text-xs font-semibold text-ember">
                Descuento: {promocion.descuentoPorcentaje}% en los productos
                {excluidos.length > 0 && (
                  <span className="font-normal text-muted">
                    {' '}
                    (excepto {excluidos.join(', ')})
                  </span>
                )}
              </p>
            )}
            <p className="mt-0.5 text-xs text-muted">
              {[
                promocion.enFranja && 'Franja superior',
                promocion.enPortada && 'Banners',
                promocion.enPopup && 'Pop-up',
                promocion.estilo === 'aniversario' && 'Estilo aniversario',
              ]
                .filter(Boolean)
                .join(' · ')}
              {promocion.enlace && ` · Enlace: ${promocion.enlace}`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <form action={accionActiva} className="contents">
            <input type="hidden" name="promocionId" value={promocion.id} />
            <label className="flex items-center gap-1.5 text-xs whitespace-nowrap text-foreground">
              <input
                type="checkbox"
                name="activa"
                defaultChecked={promocion.activa}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                className="h-4 w-4 rounded border-border accent-ember"
              />
              Activa
            </label>
          </form>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-xs font-medium text-foreground transition-colors hover:text-ember"
          >
            Editar
          </button>
          {confirmandoBorrar ? (
            <div className="flex items-center gap-2 text-xs whitespace-nowrap">
              <span className="text-danger">¿Borrar?</span>
              <form action={borrarPromocion}>
                <input type="hidden" name="promocionId" value={promocion.id} />
                <button type="submit" className="font-semibold text-danger hover:underline">
                  Sí, borrar
                </button>
              </form>
              <button
                type="button"
                onClick={() => setConfirmandoBorrar(false)}
                className="text-muted hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmandoBorrar(true)}
              className="text-xs text-muted transition-colors hover:text-danger"
            >
              Borrar
            </button>
          )}
        </div>
      </div>
      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
    </li>
  );
}

export default function ListaPromociones({
  promociones,
  productos,
}: {
  promociones: Promocion[];
  productos: ProductoSelector[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <FormularioNuevaPromocion productos={productos} />

      {promociones.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay promociones creadas.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {promociones.map((promocion) => (
            <FilaPromocion
              key={promocion.id}
              promocion={promocion}
              productos={productos}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
