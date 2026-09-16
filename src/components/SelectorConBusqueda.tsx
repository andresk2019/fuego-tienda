"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Quita tildes y pasa a minúsculas, para que buscar "limon" encuentre
// "Limón" igual — el cliente no debería tener que escribir el acento
// exacto para que la búsqueda funcione.
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// Desplegable con buscador integrado: un input de texto en vez del
// <select> nativo del navegador (que se ve genérico y anticuado) —
// al escribir, filtra las opciones que EMPIEZAN por lo que se va
// tecleando (no que solo lo contengan en cualquier parte, para que el
// resultado sea predecible). Sigue siendo "una opción de una lista
// fija" de cara a quien lo usa: si cierra sin elegir una opción real
// de la lista, el texto vuelve al último valor válido — nunca queda
// un texto libre como si fuera la elección.
export default function SelectorConBusqueda({
  opciones,
  valor,
  onCambiar,
  placeholder = "Escribe para buscar...",
  etiqueta,
  compacto = false,
  deshabilitado = false,
}: {
  opciones: readonly string[];
  valor: string;
  onCambiar: (valor: string) => void;
  placeholder?: string;
  // Nombre accesible del campo — sin esto, un lector de pantalla no
  // distingue entre los ~20 campos idénticos "Buscar aroma..." que
  // aparecen a la vez en el catálogo (uno por tarjeta, ver
  // TarjetaProducto.tsx); con esto, cada uno se anuncia como "Aroma de
  // <nombre del producto>".
  etiqueta?: string;
  // Versión más chica (texto e íconos más pequeños, menos relleno) —
  // para usarlo dentro de espacios angostos como la tarjeta del
  // catálogo (ver TarjetaProducto.tsx), donde el desplegable completo
  // no cabría igual de cómodo que en un formulario de página.
  compacto?: boolean;
  // Ej. el selector de municipio antes de elegir un departamento (ver
  // CarritoCliente.tsx) — no tiene sentido dejarlo abrir una lista
  // vacía.
  deshabilitado?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState(valor);
  const [resaltado, setResaltado] = useState(0);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Si el valor "real" cambia desde afuera, el texto visible se
  // sincroniza (ej. al reabrir el formulario).
  useEffect(() => {
    setTexto(valor);
  }, [valor]);

  const filtradas = useMemo(() => {
    const termino = normalizar(texto.trim());
    if (!termino || termino === normalizar(valor)) return opciones;
    return opciones.filter((o) => normalizar(o).startsWith(termino));
  }, [opciones, texto, valor]);

  useEffect(() => {
    function alHacerClicFuera(e: MouseEvent) {
      if (!contenedorRef.current?.contains(e.target as Node)) {
        setAbierto(false);
        setTexto(valor); // cerró sin elegir — vuelve al último valor real
      }
    }
    document.addEventListener("mousedown", alHacerClicFuera);
    return () => document.removeEventListener("mousedown", alHacerClicFuera);
  }, [valor]);

  function elegir(opcion: string) {
    onCambiar(opcion);
    setTexto(opcion);
    setAbierto(false);
  }

  return (
    <div ref={contenedorRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={abierto}
        aria-autocomplete="list"
        aria-label={etiqueta}
        value={texto}
        placeholder={placeholder}
        disabled={deshabilitado}
        // Selecciona todo el texto existente al enfocar — sin esto, el
        // valor ya elegido (ej. "Frutos Rojos") se quedaba tal cual y
        // escribir para buscar uno nuevo lo agregaba al final ("Frutos
        // Rojoslav" en vez de "lav"), así que nunca encontraba nada.
        // Con el texto ya seleccionado, escribir lo reemplaza — como
        // en cualquier buscador.
        onFocus={(e) => {
          setAbierto(true);
          e.target.select();
        }}
        // `onFocus` no se repite si el campo ya estaba enfocado (ej.
        // justo después de elegir una opción, el foco se queda en el
        // input a propósito — ver el onMouseDown de abajo). Sin esto,
        // un segundo clic sobre un campo ya enfocado no volvía a abrir
        // la lista y parecía un simple campo de texto trabado.
        onClick={(e) => {
          setAbierto(true);
          e.currentTarget.select();
        }}
        onChange={(e) => {
          setTexto(e.target.value);
          setAbierto(true);
          setResaltado(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setAbierto(true);
            setResaltado((r) => Math.min(r + 1, filtradas.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setResaltado((r) => Math.max(r - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (filtradas[resaltado]) elegir(filtradas[resaltado]);
          } else if (e.key === "Escape") {
            setAbierto(false);
            setTexto(valor);
          }
        }}
        className={`w-full rounded-lg border border-border bg-background text-foreground placeholder:text-muted/60 disabled:cursor-not-allowed disabled:opacity-60 ${
          compacto ? "py-1.5 pr-7 pl-2 text-xs" : "py-2 pr-9 pl-3"
        }`}
      />

      {/* Flecha clickeable (antes solo decorativa) — al hacer clic
          abre/cierra la lista, como se espera de un desplegable. */}
      <button
        type="button"
        tabIndex={-1}
        disabled={deshabilitado}
        aria-label={abierto ? "Cerrar lista de opciones" : "Abrir lista de opciones"}
        onMouseDown={(e) => e.preventDefault()} // no le quita el foco al input
        onClick={() => setAbierto((a) => !a)}
        className={`absolute top-1/2 -translate-y-1/2 rounded text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed ${
          compacto ? "right-1 p-0.5" : "right-2 p-1"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${abierto ? "rotate-180" : ""} ${
            compacto ? "h-3 w-3" : "h-4 w-4"
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {abierto && !deshabilitado && (
        <ul
          className={`absolute z-10 mt-1 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg ${
            compacto ? "max-h-40" : "max-h-48"
          }`}
        >
          {filtradas.length > 0 ? (
            filtradas.map((opcion, i) => (
              <li key={opcion}>
                <button
                  type="button"
                  // Evita que el input pierda el foco (y se cierre la
                  // lista) antes de que el clic llegue a registrarse.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegir(opcion)}
                  className={`block w-full text-left transition-colors ${
                    compacto ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
                  } ${
                    i === resaltado
                      ? "bg-ember/10 text-ember"
                      : "text-foreground hover:bg-surface-hover"
                  }`}
                >
                  {opcion}
                </button>
              </li>
            ))
          ) : (
            <li
              className={`text-muted ${compacto ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}
            >
              Ninguna opción empieza así.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
