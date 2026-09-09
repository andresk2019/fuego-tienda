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
}: {
  opciones: readonly string[];
  valor: string;
  onCambiar: (valor: string) => void;
  placeholder?: string;
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
        value={texto}
        placeholder={placeholder}
        onFocus={() => setAbierto(true)}
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
        className="w-full rounded-lg border border-border bg-background py-2 pr-9 pl-3 text-foreground placeholder:text-muted/60"
      />

      {/* Flecha, para que se note que es un desplegable y no un campo
          de texto cualquiera. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted transition-transform ${
          abierto ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>

      {abierto && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
          {filtradas.length > 0 ? (
            filtradas.map((opcion, i) => (
              <li key={opcion}>
                <button
                  type="button"
                  // Evita que el input pierda el foco (y se cierre la
                  // lista) antes de que el clic llegue a registrarse.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegir(opcion)}
                  className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
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
            <li className="px-3 py-2 text-sm text-muted">
              Ningún aroma empieza así.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
