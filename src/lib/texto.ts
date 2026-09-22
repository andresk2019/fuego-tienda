// Utilidades de texto puras — sin dependencias del servidor ni de
// React, para poder usarlas tanto en componentes de servidor como de
// cliente.

// Convierte el nombre de un producto (tal como viene de Contabilidad
// Lady — a veces todo en minúsculas, a veces solo con la inicial en
// minúscula, sin ningún criterio fijo) al formato que se le muestra
// al cliente: cada palabra con su inicial en mayúscula ("vela
// chispa" -> "Vela Chispa", "EDICION MADRES" -> "Edicion Madres").
//
// Esto es puramente cosmético para la tienda pública — nunca se
// vuelve a guardar así en la base de datos. Contabilidad Lady sigue
// siendo la única fuente real del nombre (ver filaAProducto en
// db.ts, que es el único lugar donde se aplica).
//
// Separa palabras por espacio, "+", "/" o "-" (no solo espacio) para
// que algo como "Trenza+Vela" quede "Trenza+Vela" y no
// "Trenza+vela" — sin tocar números o símbolos como "#1", que quedan
// tal cual porque no tienen mayúscula/minúscula.
export function formatearNombreProducto(nombre: string): string {
  return nombre
    .toLowerCase()
    .replace(
      /(^|[\s+/-])([a-záéíóúñü])/gi,
      (_coincidencia, separador, letra) => separador + letra.toUpperCase()
    );
}
