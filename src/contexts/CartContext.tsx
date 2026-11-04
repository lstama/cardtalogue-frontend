import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface CartItem {
  id: number
  code: string
  name: string
  quantity: number
  price: number
  priceMultiplier: number
  maxQuantity: number
}

interface CartContextType {
  cart: CartItem[]
  getQuantity: (id: number) => number
  addToCart: (
    id: number,
    code: string,
    name: string,
    price: number,
    priceMultiplier: number,
    maxQuantity: number
  ) => void
  removeFromCart: (id: number) => void
  fixQuantity: (id: number, maxQuantity: number) => void
  deleteFromCart: (id: number) => void
  clearCart: () => void
  getSimplifiedCart: () => string
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const STORAGE_KEY = "offline_cart"

const readCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(readCart)

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const getQuantity = (id: number) =>
    cart.find((c) => c.id === id)?.quantity || 0

  const addToCart = (
    id: number,
    code: string,
    name: string,
    price: number,
    priceMultiplier: number,
    maxQuantity: number
  ) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id)
      if (existing) {
        return prev.map((c) =>
          c.id === id
            ? { ...c, maxQuantity: maxQuantity, quantity: Math.min(existing.quantity + 1, maxQuantity) }
            : c
        )
      }
      return [...prev, { id, code, name, price, priceMultiplier, maxQuantity, quantity: 1 }]
    })
  }

  // Remove price, priceMultiplier, and maxQuantity
  const getSimplifiedCart = () => {
     return JSON.stringify(cart.map(({price, priceMultiplier, maxQuantity,  ...simplified}) => simplified))
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id)
      if (!existing) return prev
      if (existing.quantity <= 1) {
        return prev.filter((c) => c.id !== id)
      }
      return prev.map((c) =>
        c.id === id ? { ...c, quantity: existing.quantity - 1 } : c
      )
    })
  }

  const fixQuantity = (id: number, maxQuantity: number) => {
    setCart((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, quantity: Math.min(c.quantity, maxQuantity) }
          : c
      )
    )
  }

  const deleteFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider
      value={{ cart, getQuantity, addToCart, removeFromCart, fixQuantity, deleteFromCart, clearCart, getSimplifiedCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider")
  }
  return ctx
}
