"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Lista desplegable propia, en lugar del <select> nativo: la lista del
// navegador se dibuja con el estilo del sistema operativo, queda
// angosta (del ancho del campo, a veces ~100px) y corta o deforma los
// nombres largos. Esta se ve igual en todos los navegadores, tiene el
// ancho que necesite el contenido (con tope) y hace scroll si es larga.
//
// Se comporta como un campo de formulario normal: lleva un <input
// type="hidden"> con `name`, así que funciona igual dentro de un
// <form action={...}>. `enviarAlElegir` envía el formulario apenas se
// elige una opción (como hacía onChange + requestSubmit con el select).
//
// La lista se pinta con un portal en <body> y posición fija: así no la
// recortan contenedores con overflow ni quedan tapados por otros.
export type OpcionDesplegable = {
  valor: string;
  etiqueta: string;
  // Opciones consecutivas con el mismo grupo se muestran bajo un mismo
  // título (el equivalente de <optgroup>).
  grupo?: string;
};

type Posicion = { top?: number; bottom?: number; left: number; minWidth: number; maxHeight: number };

export default function Desplegable({
  opciones,
  name,
  defaultValue,
  value,
  onChange,
  enviarAlElegir = false,
  className = "",
  ariaLabel,
  title,
  disabled = false,
}: {
  opciones: OpcionDesplegable[];
  name?: string;
  // No controlado (como defaultValue de un select)…
  defaultValue?: string;
  // …o controlado (value + onChange).
  value?: string;
  onChange?: (valor: string) => void;
  enviarAlElegir?: boolean;
  // Estilo del botón que se ve cerrado (borde, fondo, texto…).
  className?: string;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [interno, setInterno] = useState(defaultValue ?? opciones[0]?.valor ?? "");
  const actual = value ?? interno;
  const [abierto, setAbierto] = useState(false);
  const [resaltada, setResaltada] = useState(0);
  const [posicion, setPosicion] = useState<Posicion | null>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const entradaRef = useRef<HTMLInputElement>(null);
  const enviarPendiente = useRef(false);

  const indiceActual = Math.max(
    0,
    opciones.findIndex((o) => o.valor === actual)
  );
  const etiquetaActual = opciones[indiceActual]?.etiqueta ?? "";

  const calcularPosicion = useCallback(() => {
    const boton = botonRef.current;
    if (!boton) return;
    const r = boton.getBoundingClientRect();
    const margen = 8;
    const abajo = window.innerHeight - r.bottom - margen;
    const arriba = r.top - margen;
    // Abre hacia abajo, salvo que no quepa y haya más lugar arriba.
    const haciaArriba = abajo < 180 && arriba > abajo;
    const ancho = Math.min(r.width, window.innerWidth - margen * 2);
    const left = Math.max(margen, Math.min(r.left, window.innerWidth - margen - ancho));
    setPosicion(
      haciaArriba
        ? { bottom: window.innerHeight - r.top + 4, left, minWidth: r.width, maxHeight: Math.min(288, arriba - 4) }
        : { top: r.bottom + 4, left, minWidth: r.width, maxHeight: Math.min(288, abajo - 4) }
    );
  }, []);

  useLayoutEffect(() => {
    if (abierto) calcularPosicion();
  }, [abierto, calcularPosicion]);

  useEffect(() => {
    if (!abierto) return;
    function fuera(e: MouseEvent | TouchEvent) {
      const objetivo = e.target as Node;
      if (listaRef.current?.contains(objetivo) || botonRef.current?.contains(objetivo)) return;
      setAbierto(false);
    }
    function alDesplazar(e: Event) {
      // Si se desplaza la propia lista no se cierra.
      if (listaRef.current?.contains(e.target as Node)) return;
      setAbierto(false);
    }
    document.addEventListener("mousedown", fuera);
    document.addEventListener("touchstart", fuera);
    window.addEventListener("scroll", alDesplazar, true);
    window.addEventListener("resize", calcularPosicion);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("touchstart", fuera);
      window.removeEventListener("scroll", alDesplazar, true);
      window.removeEventListener("resize", calcularPosicion);
    };
  }, [abierto, calcularPosicion]);

  // Mantiene la opción resaltada a la vista al navegar con el teclado.
  useEffect(() => {
    if (!abierto) return;
    document.getElementById(`${id}-op-${resaltada}`)?.scrollIntoView({ block: "nearest" });
  }, [abierto, resaltada, id]);

  // Envía el formulario DESPUÉS de que el <input hidden> ya tenga el
  // valor nuevo (el estado se aplica en el siguiente render).
  useEffect(() => {
    if (enviarPendiente.current) {
      enviarPendiente.current = false;
      entradaRef.current?.form?.requestSubmit();
    }
  }, [actual]);

  function abrir() {
    if (disabled) return;
    setResaltada(indiceActual);
    setAbierto(true);
  }

  function elegir(indice: number) {
    const opcion = opciones[indice];
    if (!opcion) return;
    setAbierto(false);
    botonRef.current?.focus();
    if (opcion.valor === actual) return;
    if (enviarAlElegir) enviarPendiente.current = true;
    setInterno(opcion.valor);
    onChange?.(opcion.valor);
  }

  function alPulsarTecla(e: React.KeyboardEvent) {
    if (!abierto) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setResaltada((i) => Math.min(opciones.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setResaltada((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setResaltada(0);
        break;
      case "End":
        e.preventDefault();
        setResaltada(opciones.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        elegir(resaltada);
        break;
      case "Escape":
        e.preventDefault();
        setAbierto(false);
        break;
      case "Tab":
        setAbierto(false);
        break;
    }
  }

  return (
    <>
      {name && <input ref={entradaRef} type="hidden" name={name} value={actual} />}
      <button
        ref={botonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={`${id}-lista`}
        aria-label={ariaLabel}
        title={title}
        disabled={disabled}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onKeyDown={alPulsarTecla}
        className={`inline-flex max-w-full cursor-pointer items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <span className="truncate">{etiquetaActual}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform ${abierto ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {abierto &&
        posicion &&
        createPortal(
          <ul
            ref={listaRef}
            id={`${id}-lista`}
            role="listbox"
            aria-label={ariaLabel}
            aria-activedescendant={`${id}-op-${resaltada}`}
            style={{
              position: "fixed",
              top: posicion.top,
              bottom: posicion.bottom,
              left: posicion.left,
              minWidth: posicion.minWidth,
              maxHeight: posicion.maxHeight,
            }}
            className="z-[80] w-max max-w-[min(22rem,calc(100vw-1rem))] overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface py-1 text-sm text-foreground shadow-xl"
          >
            {opciones.map((o, i) => {
              const tituloGrupo =
                o.grupo && o.grupo !== opciones[i - 1]?.grupo ? o.grupo : null;
              const seleccionada = o.valor === actual;
              return (
                <li key={o.valor} role="presentation">
                  {tituloGrupo && (
                    <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
                      {tituloGrupo}
                    </p>
                  )}
                  <div
                    id={`${id}-op-${i}`}
                    role="option"
                    aria-selected={seleccionada}
                    onMouseEnter={() => setResaltada(i)}
                    onClick={() => elegir(i)}
                    className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 ${
                      i === resaltada ? "bg-surface-hover" : ""
                    } ${seleccionada ? "font-semibold text-ember" : ""}`}
                  >
                    <span className="break-words">{o.etiqueta}</span>
                    {seleccionada && <span aria-hidden="true">✓</span>}
                  </div>
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}
