// components/cart/cart-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { cartService, Cart } from "@/services/cart.service";
import { useAuth } from "@/components/auth/auth-context";

interface CartContextType {
  cart: Cart | null;
  cartItemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (portfolioId: string, quantity?: number) => Promise<void>;
  removeFromCart: (portfolioId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (portfolioId: string, quantity: number = 1) => {
    try {
      const updatedCart = await cartService.addToCart({ portfolioId, quantity });
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (portfolioId: string) => {
    try {
      const updatedCart = await cartService.removeFromCart(portfolioId);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const result = await cartService.clearCart();
      setCart(result.cart);
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  };

  const value: CartContextType = {
    cart,
    cartItemCount,
    loading,
    refreshCart,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};