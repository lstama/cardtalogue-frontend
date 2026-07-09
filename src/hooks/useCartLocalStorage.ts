import { useState, useEffect } from 'react';
import { CartItem } from '../types';

/**
 * Hook to manage Cart state with localStorage persistence.
 */
export const useCartLocalStorage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return { cart, setCart };
};
