'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { claveItem, type ItemCarrito } from '@/lib/carrito';

const CLAVE_LOCALSTORAGE = 'fuego-carrito';

type ContextoCarrito = {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, 'clave'>) => void;
  quitar: (clave: string) => void;
  actualizarCantidad: (clave: string, cantidad: number) => void;
  vaciar: () => void;
  // Carrito lateral (ver CarritoLateral.tsx): se abre solo al agregar
  // un producto, para confirmarle al cliente que sí quedó adentro sin
  // sacarlo de la página donde estaba comprando. También se puede
  // abrir a mano desde el botón flotante (ver CarritoFlotante.tsx),
  // para verlo en cualquier momento sin haber agregado nada nuevo.
  abierto: boolean;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
};

const CarritoContext = createContext<ContextoCarrito | null>(null);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [cargado, setCargado] = useState(false);
  const [abierto, setAbierto] = useState(false);

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

    // Abre el carrito lateral para confirmar que sí quedó agregado —
    // reemplaza el "¡Agregado!" que antes solo cambiaba el texto del
    // botón (fácil de no notar); ahora se ve el producto en el panel.
    setAbierto(true);

    // Único lugar donde de verdad se agrega algo al carrito (lo usan
    // tanto AgregarAlCarrito.tsx como PersonalizarVela.tsx) — evento
    // estándar de GA4 para poder armar el embudo completo (ver
    // producto → agregar al carrito → empezar a pagar →
    // continuar_whatsapp) y así ver dónde se cae la gente, no solo
    // cuánta compra.
    sendGAEvent('event', 'add_to_cart', {
      currency: 'COP',
      value: nuevo.precioUnitario * nuevo.cantidad,
      items: [
        {
          item_id: String(nuevo.productoId),
          item_name: nuevo.nombre,
          price: nuevo.precioUnitario,
          quantity: nuevo.cantidad,
        },
      ],
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
  const abrirCarrito = useCallback(() => setAbierto(true), []);
  const cerrarCarrito = useCallback(() => setAbierto(false), []);

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregar,
        quitar,
        actualizarCantidad,
        vaciar,
        abierto,
        abrirCarrito,
        cerrarCarrito,
      }}
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
