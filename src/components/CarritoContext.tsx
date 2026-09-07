'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { claveItem, type ItemCarrito } from '@/lib/carrito';

const CLAVE_LOCALSTORAGE = 'fuego-carrito';

type ContextoCarrito = {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, 'clave'>) => void;
  quitar: (clave: string) => void;
  actualizarCantidad: (clave: string, cantidad: number) => void;
  vaciar: () => void;
};

const CarritoContext = createContext<ContextoCarrito | null>(null);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [cargado, setCargado] = useState(false);

  // Carga lo que haya guardado de una visita anterior. Puede fallar
  // (ventana privada, navegador que bloquea storage) — en ese caso
  // el carrito sigue funcionando, solo que no persiste entre visitas.
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
      if (guardado) setItems(JSON.parse(guardado));
    } catch {
      // seguimos con el carrito vacío
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return; // evita pisar lo guardado con [] antes de cargarlo
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(items));
    } catch {
      // el carrito sigue funcionando en memoria para esta visita
    }
  }, [items, cargado]);

  const agregar = useCallback((nuevo: Omit<ItemCarrito, 'clave'>) => {
    const clave = claveItem(nuevo.productoId, nuevo);
    setItems((actuales) => {
      const existente = actuales.find((i) => i.clave === clave);
      if (existente) {
        return actuales.map((i) =>
          i.clave === clave ? { ...i, cantidad: i.cantidad + nuevo.cantidad } : i
        );
      }
      return [...actuales, { ...nuevo, clave }];
    });
  }, []);

  const quitar = useCallback((clave: string) => {
    setItems((actuales) => actuales.filter((i) => i.clave !== clave));
  }, []);

  const actualizarCantidad = useCallback((clave: string, cantidad: number) => {
    setItems((actuales) =>
      cantidad <= 0
        ? actuales.filter((i) => i.clave !== clave)
        : actuales.map((i) => (i.clave === clave ? { ...i, cantidad } : i))
    );
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  return (
    <CarritoContext.Provider
      value={{ items, agregar, quitar, actualizarCantidad, vaciar }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito(): ContextoCarrito {
  const contexto = useContext(CarritoContext);
  if (!contexto) {
    throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  }
  return contexto;
}
