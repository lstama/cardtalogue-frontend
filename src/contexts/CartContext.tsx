import { createContext, useContext, type ReactNode } from 'react';
import { CartItem } from '../types';
import { useCartLocalStorage } from '../hooks/useCartLocalStorage';

interface CartContextType {
  cart: CartItem[];
  getQuantity: (id: number) => number;
  addToCart: (
    id: number,
    code: string,
    name: string,
    price: number,
    priceMultiplier: number,
    maxQuantity: number
  ) => void;
  removeFromCart: (id: number) => void;
  fixQuantity: (id: number, maxQuantity: number) => void;
  deleteFromCart: (id: number) => void;
  clearCart: () => void;
  getSimplifiedCart: () => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { cart, setCart } = useCartLocalStorage();

  const getQuantity = (id: number): number =>
    cart.find((c) => c.id === id)?.quantity || 0;

  const addToCart = (
    id: number,
    code: string,
    name: string,
    price: number,
    priceMultiplier: number,
    maxQuantity: number
  ): void => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) {
        return prev.map((c) =>
          c.id === id
            ? { ...c, maxQuantity, quantity: Math.min(existing.quantity + 1, maxQuantity) }
            : c
        );
      }
      return [...prev, { id, code, name, price, priceMultiplier, maxQuantity, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number): void => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((c) => c.id !== id);
      }
      return prev.map((c) =>
        c.id === id ? { ...c, quantity: existing.quantity - 1 } : c
      );
    });
  };

  const fixQuantity = (id: number, maxQuantity: number): void => {
    setCart((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, quantity: Math.min(c.quantity, maxQuantity) } : c
      )
    );
  };

  const deleteFromCart = (id: number): void => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = (): void => {
    setCart([]);
  };

  const getSimplifiedCart = (): string => {
    const simplified = cart.map(({ price, priceMultiplier, maxQuantity, ...rest }) => rest);
    return JSON.stringify(simplified);
  };

  const contextValue: CartContextType = {
    cart,
    getQuantity,
    addToCart,
    removeFromCart,
    fixQuantity,
    deleteFromCart,
    clearCart,
    getSimplifiedCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
