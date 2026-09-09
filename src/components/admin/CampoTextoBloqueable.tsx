'use client';

import { useActionState, useEffect, useRef, useState } from 'react';

type EstadoCampo = { error?: string; ok?: boolean } | undefined;

// Seguro contra ediciones accidentales en los campos de texto del
// admin (descripciones de producto, de aroma, texto de "Quiénes
// somos"): el campo arranca bloqueado, mostrando de solo lectura lo
// último guardado — hay que pedir "Editar" a propósito para poder
// escribir. Al guardar, se vuelve a bloquear solo y confirma que
// quedó guardado, así nunca queda un campo abierto y editable por
// accidente mientras se navega la lista o se hace scroll.
export default function CampoTextoBloqueable({
  etiqueta,
  valorInicial,
  accion,
  camposOcultos,
  nombreCampoTexto = 'texto',
  placeholder,
  rows = 3,
  onCambiaValorEnVivo,
}: {
  etiqueta?: string;
  valorInicial: string;
  accion: (
    estado: EstadoCampo,
    formData: FormData
  ) => Promise<EstadoCampo> | EstadoCampo;
  camposOcultos?: Record<string, string | number>;
  nombreCampoTexto?: string;
  placeholder?: string;
  rows?: number;
  onCambiaValorEnVivo?: (valor: string) => void;
}) {
  const [estado, disparar, guardando] = useActionState(accion, undefined);
  const [bloqueado, setBloqueado] = useState(true);
  const [valorEnVivo, setValorEnVivo] = useState(valorInicial);
  // Ref (no state) para la "última versión guardada": no necesita
  // volver a pintar nada por sí sola, solo sirve para comparar y
  // saber si hay cambios sin guardar.
  const valorGuardadoRef = useRef(valorInicial);

  useEffect(() => {
    if (estado?.ok) {
      valorGuardadoRef.current = valorEnVivo;
      setBloqueado(true);
    }
    // Solo debe reaccionar a un guardado nuevo (estado), no a cada
    // tecleo (valorEnVivo cambia en cada onChange).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  const hayCambio = valorEnVivo !== valorGuardadoRef.current;

  return (
    <form action={disparar} className="flex flex-col gap-2">
      {camposOcultos &&
        Object.entries(camposOcultos).map(([nombre, valor]) => (
          <input key={nombre} type="hidden" name={nombre} value={valor} />
        ))}

      {etiqueta && (
        <span className="text-sm font-medium text-foreground">
          {etiqueta}
        </span>
      )}

      <textarea
        name={nombreCampoTexto}
        value={valorEnVivo}
        onChange={(e) => {
          setValorEnVivo(e.target.value);
          onCambiaValorEnVivo?.(e.target.value);
        }}
        disabled={bloqueado}
        rows={rows}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setBloqueado(false)}
          disabled={!bloqueado}
          className="w-fit rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-40"
        >
          Editar
        </button>
        <button
          type="submit"
          disabled={bloqueado || guardando || !hayCambio}
          className="w-fit rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ember/60 disabled:opacity-40"
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {estado?.error && <p className="text-xs text-danger">{estado.error}</p>}
      {estado?.ok && (
        <p className="text-xs text-ember">¡Guardado con éxito!</p>
      )}
    </form>
  );
}
