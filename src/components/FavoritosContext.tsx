"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const CLAVE_LOCALSTORAGE = "fuego-favoritos";

// A diferencia del carrito (que guarda una "foto" del pedido: precio,
// aroma, cantidad elegidos en ese momento), acá solo se guardan los
// ids — un favorito debe reflejar el producto tal cual está HOY
// (precio, disponibilidad, foto), no como estaba cuando se marcó. La
// página de favoritos cruza estos ids contra el catálogo real en cada
// visita (ver FavoritosCliente.tsx).
type ContextoFavoritos = {
  favoritos: number[];
  esFavorito: (productoId: number) => boolean;
  alternarFavorito: (productoId: number) => void;
};

const FavoritosContext = createContext<ContextoFavoritos | null>(null);

export function FavoritosProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
      if (guardado) setFavoritos(JSON.parse(guardado));
    } catch {
      // seguimos sin favoritos guardados para esta visita
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return; // evita pisar lo guardado con [] antes de cargarlo
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(favoritos));
    } catch {
      // los favoritos siguen funcionando en memoria para esta visita
    }
  }, [favoritos, cargado]);

  const esFavorito = useCallback(
    (productoId: number) => favoritos.includes(productoId),
    [favoritos]
  );

  const alternarFavorito = useCallback((productoId: number) => {
    setFavoritos((actuales) =>
      actuales.includes(productoId)
        ? actuales.filter((id) => id !== productoId)
        : [...actuales, productoId]
    );
  }, []);

  return (
    <FavoritosContext.Provider
      value={{ favoritos, esFavorito, alternarFavorito }}
    >
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos(): ContextoFavoritos {
  const contexto = useContext(FavoritosContext);
  if (!contexto) {
    throw new Error("useFavoritos debe usarse dentro de <FavoritosProvider>");
  }
  return contexto;
}
