"use client";

import { useState } from "react";
import Image from "next/image";
import ImagenProducto from "@/components/ImagenProducto";

// Foto grande + miniaturas de un producto — para CUALQUIER producto,
// no solo los personalizables (decisión del dueño, 2026-09-11): antes
// esto solo existía para elegir un color; ahora es una galería simple
// de fotos, sin relación con la personalización. El cliente hace clic
// en una miniatura y esa pasa a ser la foto grande.
//
// La foto principal (la que sube el admin desde el bloque de arriba
// en /admin) siempre es la primera miniatura y la que se ve por
// defecto. Si el producto no tiene ninguna foto adicional, no se
// muestra ninguna fila de miniaturas — se ve exactamente igual que
// antes de este cambio.
export default function GaleriaFotosProducto({
  fotoPrincipal,
  fotosGaleria,
  alt,
}: {
  fotoPrincipal: string | null;
  fotosGaleria: string[];
  alt: string;
}) {
  const miniaturas = [
    ...(fotoPrincipal ? [fotoPrincipal] : []),
    ...fotosGaleria,
  ];
  const [seleccionada, setSeleccionada] = useState<string | null>(
    fotoPrincipal
  );

  return (
    <div className="flex flex-col gap-3">
      <ImagenProducto fotoUrl={seleccionada} alt={alt} />

      {miniaturas.length > 1 && (
        <ul className="flex flex-wrap gap-2">
          {miniaturas.map((foto, indice) => (
            <li key={foto}>
              <button
                type="button"
                onClick={() => setSeleccionada(foto)}
                aria-label={`Ver foto ${indice + 1}`}
                aria-pressed={seleccionada === foto}
                className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-2 transition-colors ${
                  seleccionada === foto
                    ? "border-ember"
                    : "border-transparent hover:border-border"
                }`}
              >
                <Image
                  src={foto}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
