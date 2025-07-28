// components/cart/cart-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cartService, Cart } from "@/services/cart.service";
import { useAuth } from "@/components/auth/auth-context";

interface CartContextType {
  cart: Cart | null;
  cartItemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (portfolioId: string, quantity?: number) => Promise<void>;
  updateQuantity: (portfolioId: string, newQuantity: number) => Promise<void>;
  setQuantity: (portfolioId: string, exactQuantity: number) => Promise<void>;
  removeFromCart: (portfolioId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (portfolioId: string) => number;
  calculateTotal: (subscriptionType: "monthly" | "quarterly" | "yearly") => number;
  getEffectiveCart: () => Cart | null;
  syncing: boolean;
  error: string | null;
  clearError: () => void;
  hasBundle: (bundleId: string) => boolean;
  addBundleToCart: (bundleId: string, subscriptionType: "monthly" | "quarterly" | "yearly", category?: string) => Promise<void>;
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
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  const clearError = () => {
    setError(null);
  };

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    
    try {
      setLoading(true);
      setSyncing(true);
      setError(null);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setError("Failed to load cart. Please try again.");
      // Don't set cart to null on error, keep previous state
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user, refreshCart]);

  const addToCart = async (portfolioId: string, quantity: number = 1) => {
    try {
      const updatedCart = await cartService.addToCart({ portfolioId, quantity });
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (portfolioId: string, newQuantity: number) => {
    try {
      // Optimistically update the UI
      if (cart) {
        const optimisticCart = { ...cart };
        const itemIndex = optimisticCart.items.findIndex(item => item.portfolio._id === portfolioId);
        
        if (itemIndex >= 0) {
          if (newQuantity <= 0) {
            // Remove item
            optimisticCart.items.splice(itemIndex, 1);
          } else {
            // Update quantity
            optimisticCart.items[itemIndex] = {
              ...optimisticCart.items[itemIndex],
              quantity: newQuantity
            };
          }
          setCart(optimisticCart);
        }
      }

      // Then update on server
      const updatedCart = await cartService.updateQuantity(portfolioId, newQuantity);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      // Revert optimistic update by refreshing cart
      await refreshCart();
      throw error;
    }
  };

  const setQuantity = async (portfolioId: string, exactQuantity: number) => {
    try {
      // Optimistically update the UI
      if (cart) {
        const optimisticCart = { ...cart };
        const itemIndex = optimisticCart.items.findIndex(item => item.portfolio._id === portfolioId);
        
        if (itemIndex >= 0) {
          if (exactQuantity <= 0) {
            // Remove item
            optimisticCart.items.splice(itemIndex, 1);
          } else {
            // Update quantity
            optimisticCart.items[itemIndex] = {
              ...optimisticCart.items[itemIndex],
              quantity: exactQuantity
            };
          }
        } else if (exactQuantity > 0) {
        }
        setCart(optimisticCart);
      }

      // Then update on server
      const updatedCart = await cartService.setQuantity(portfolioId, exactQuantity);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to set quantity:", error);
      // Revert optimistic update by refreshing cart
      await refreshCart();
      throw error;
    }
  };

  const removeFromCart = async (portfolioId: string) => {
    try {
      // Optimistically update the UI
      if (cart) {
        const optimisticCart = { ...cart };
        optimisticCart.items = optimisticCart.items.filter(item => item.portfolio._id !== portfolioId);
        setCart(optimisticCart);
      }

      // Then update on server
      const updatedCart = await cartService.removeFromCart(portfolioId);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      // Revert optimistic update by refreshing cart
      await refreshCart();
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      // Optimistically update the UI
      if (cart) {
        const optimisticCart = { ...cart, items: [] };
        setCart(optimisticCart);
      }

      // Then update on server
      const result = await cartService.clearCart();
      setCart(result.cart);
    } catch (error) {
      console.error("Failed to clear cart:", error);
      // Revert optimistic update by refreshing cart
      await refreshCart();
      throw error;
    }
  };

  const getItemQuantity = (portfolioId: string): number => {
    const item = cart?.items.find(item => item.portfolio._id === portfolioId);
    return item?.quantity || 0;
  };

  const calculateTotal = (subscriptionType: "monthly" | "quarterly" | "yearly"): number => {
    if (!cart) return 0;
    return cartService.calculateCartTotal(cart, subscriptionType);
  };

  const getEffectiveCart = (): Cart | null => {
    return cart;
  };

  const hasBundle = (bundleId: string): boolean => {
    // For now, we'll check if any item in the cart has a portfolio with the bundle ID
    // This is a simplified implementation since bundles are not directly stored in cart
    return cart?.items.some(item => item.portfolio._id === bundleId) || false;
  };

  const addBundleToCart = async (bundleId: string, subscriptionType: "monthly" | "quarterly" | "yearly", category?: string) => {
    try {
      // For now, we'll add the bundle as a portfolio item
      // This is a simplified implementation - in a real app, you'd have separate bundle handling
      const updatedCart = await cartService.addToCart({ portfolioId: bundleId, quantity: 1 });
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to add bundle to cart:", error);
      throw error;
    }
  };

  const value: CartContextType = {
    cart,
    cartItemCount,
    loading,
    refreshCart,
    addToCart,
    updateQuantity,
    setQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    calculateTotal,
    getEffectiveCart,
    syncing,
    error,
    clearError,
    hasBundle,
    addBundleToCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};