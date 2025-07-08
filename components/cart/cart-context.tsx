// components/cart/cart-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cartService, Cart } from "@/services/cart.service";
import { localCartService, LocalCart, LocalCartItem } from "@/services/local-cart.service";
import { useAuth } from "@/components/auth/auth-context";
import { useToast } from "@/components/ui/use-toast";

interface CartContextType {
  cart: Cart | null;
  localCart: LocalCart;
  cartItemCount: number;
  loading: boolean;
  syncing: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (portfolioId: string, quantity?: number) => Promise<void>;
  addBundleToCart: (bundleId: string, subscriptionType?: "monthly" | "quarterly" | "yearly") => Promise<void>;
  updateQuantity: (portfolioId: string, newQuantity: number) => Promise<void>;
  setQuantity: (portfolioId: string, exactQuantity: number) => Promise<void>;
  removeFromCart: (portfolioId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (portfolioId: string) => number;
  calculateTotal: (subscriptionType: "monthly" | "quarterly" | "yearly") => number;
  isInCart: (itemId: string) => boolean;
  hasBundle: (bundleId: string) => boolean;
  syncLocalCartToServer: () => Promise<void>;
  getEffectiveCart: () => { items: any[]; itemCount: number };
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
  const [localCart, setLocalCart] = useState<LocalCart>({ items: [], lastUpdated: new Date().toISOString() });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Load local cart on mount
  useEffect(() => {
    const localCartData = localCartService.getLocalCart();
    setLocalCart(localCartData);
  }, []);

  // Get effective cart (server cart if authenticated, local cart if not)
  const getEffectiveCart = useCallback(() => {
    if (isAuthenticated && cart) {
      return {
        items: cart.items,
        itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
      };
    } else {
      // Convert local cart items to display format
      const items = localCart.items.map(localItem => ({
        _id: localItem.portfolioId,
        portfolio: {
          _id: localItem.bundleId || localItem.portfolioId,
          name: localItem.itemData.name,
          description: localItem.itemData.description || [],
          subscriptionFee: localItem.itemData.subscriptionFee || [],
          minInvestment: 0,
          durationMonths: 0,
          category: localItem.itemData.category
        },
        quantity: localItem.quantity,
        addedAt: localItem.addedAt
      }));
      
      return {
        items,
        itemCount: localCart.items.reduce((total, item) => total + item.quantity, 0)
      };
    }
  }, [isAuthenticated, cart, localCart]);

  const cartItemCount = getEffectiveCart().itemCount;

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      const localCartData = localCartService.getLocalCart();
      setLocalCart(localCartData);
      return;
    }
    
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      
      // Enrich cart items with full portfolio data if description is missing
      if (cartData.items && cartData.items.length > 0) {
        const { userPortfolioService } = await import("@/services/user-portfolio.service");
        const allPortfolios = await userPortfolioService.getAll();
        
        const enrichedItems = cartData.items.map(item => {
          // Check if description is missing or empty
          if (!item.portfolio.description || item.portfolio.description.length === 0) {
            const fullPortfolio = allPortfolios.find(p => p._id === item.portfolio._id);
            if (fullPortfolio) {
              return {
                ...item,
                portfolio: {
                  ...item.portfolio,
                  description: fullPortfolio.description || []
                }
              };
            }
          }
          return item;
        });
        
        cartData.items = enrichedItems;
      }
      
      setCart(cartData);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sync local cart to server when user authenticates
  const syncLocalCartToServer = useCallback(async () => {
    if (!isAuthenticated || syncing) return;
    
    const localCartData = localCartService.getLocalCart();
    if (localCartData.items.length === 0) return;

    try {
      setSyncing(true);
      console.log("Syncing local cart to server...", localCartData);

      // Add each local cart item to server cart
      for (const localItem of localCartData.items) {
        try {
          if (localItem.itemType === "bundle") {
            await cartService.addBundleToCart(localItem.bundleId!, localItem.subscriptionType);
          } else {
            await cartService.addToCart({ 
              portfolioId: localItem.portfolioId, 
              quantity: localItem.quantity 
            });
          }
        } catch (error) {
          console.error("Failed to sync item:", localItem, error);
        }
      }

      // Clear local cart after successful sync
      localCartService.clearLocalCart();
      setLocalCart({ items: [], lastUpdated: new Date().toISOString() });
      
      // Refresh server cart
      await refreshCart();
      
      toast({
        title: "Cart Synced",
        description: `${localCartData.items.length} item(s) transferred to your account.`,
      });
    } catch (error) {
      console.error("Failed to sync local cart:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to transfer local cart items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, syncing, refreshCart, toast]);

  // Auto-sync when user logs in
  useEffect(() => {
    if (isAuthenticated && user && localCartService.hasItems()) {
      syncLocalCartToServer();
    } else if (isAuthenticated && user) {
      refreshCart();
    }
  }, [isAuthenticated, user, syncLocalCartToServer, refreshCart]);

  const addToCart = async (portfolioId: string, quantity: number = 1) => {
    if (isAuthenticated) {
      // Add to server cart
      try {
        const updatedCart = await cartService.addToCart({ portfolioId, quantity });
        setCart(updatedCart);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        throw error;
      }
    } else {
      // Add to local cart - we need item data for offline storage
      try {
        // Import userPortfolioService to get real portfolio data
        const { userPortfolioService } = await import("@/services/user-portfolio.service");
        
        // Fetch all portfolios to find the one we're adding
        const portfolios = await userPortfolioService.getAll();
        const portfolio = portfolios.find(p => p._id === portfolioId);
        
        const itemData = {
          name: portfolio?.name || `Portfolio ${portfolioId.slice(-6)}`,
          description: portfolio?.description || [],
          subscriptionFee: portfolio?.subscriptionFee || [
            { type: "monthly" as const, price: 999 },
            { type: "quarterly" as const, price: 2997 },
            { type: "yearly" as const, price: 9999 }
          ]
        };
        
        const updatedLocalCart = localCartService.addPortfolioToLocalCart(
          portfolioId, 
          quantity, 
          "monthly", 
          itemData
        );
        setLocalCart(updatedLocalCart);
      } catch (error) {
        console.error("Failed to add to local cart:", error);
        throw error;
      }
    }
  };

  const addBundleToCart = async (bundleId: string, subscriptionType: "monthly" | "quarterly" | "yearly" = "monthly") => {
    if (isAuthenticated) {
      // Add to server cart
      try {
        const updatedCart = await cartService.addBundleToCart(bundleId, subscriptionType);
        setCart(updatedCart);
      } catch (error) {
        console.error("Failed to add bundle to cart:", error);
        throw error;
      }
    } else {
      // Add to local cart
      try {
        // Get bundle data - in a real app, you might want to fetch this from bundleService
        const itemData = {
          name: bundleId.includes("premium") ? "Premium Subscription" : "Basic Subscription",
          category: bundleId.includes("premium") ? "premium" : "basic",
          monthlyPrice: bundleId.includes("premium") ? 1999 : 999,
          quarterlyPrice: bundleId.includes("premium") ? 5997 : 2997,
          yearlyPrice: bundleId.includes("premium") ? 19999 : 9999,
          description: [] // Will be populated from real bundle/portfolio data when available
        };
        
        const updatedLocalCart = localCartService.addBundleToLocalCart(
          bundleId,
          subscriptionType,
          itemData
        );
        setLocalCart(updatedLocalCart);
      } catch (error) {
        console.error("Failed to add bundle to local cart:", error);
        throw error;
      }
    }
  };

  const updateQuantity = async (portfolioId: string, newQuantity: number) => {
    if (isAuthenticated) {
      // Update server cart
      try {
        // Optimistically update the UI
        if (cart) {
          const optimisticCart = { ...cart };
          const itemIndex = optimisticCart.items.findIndex(item => item.portfolio._id === portfolioId);
          
          if (itemIndex >= 0) {
            if (newQuantity <= 0) {
              optimisticCart.items.splice(itemIndex, 1);
            } else {
              optimisticCart.items[itemIndex] = {
                ...optimisticCart.items[itemIndex],
                quantity: newQuantity
              };
            }
            setCart(optimisticCart);
          }
        }

        const updatedCart = await cartService.updateQuantity(portfolioId, newQuantity);
        setCart(updatedCart);
      } catch (error) {
        console.error("Failed to update quantity:", error);
        await refreshCart();
        throw error;
      }
    } else {
      // Update local cart
      try {
        const updatedLocalCart = localCartService.updateLocalCartQuantity(portfolioId, newQuantity);
        setLocalCart(updatedLocalCart);
      } catch (error) {
        console.error("Failed to update local cart quantity:", error);
        throw error;
      }
    }
  };

  const setQuantity = async (portfolioId: string, exactQuantity: number) => {
    if (isAuthenticated) {
      // Update server cart
      try {
        const updatedCart = await cartService.setQuantity(portfolioId, exactQuantity);
        setCart(updatedCart);
      } catch (error) {
        console.error("Failed to set quantity:", error);
        await refreshCart();
        throw error;
      }
    } else {
      // Update local cart
      try {
        const updatedLocalCart = localCartService.updateLocalCartQuantity(portfolioId, exactQuantity);
        setLocalCart(updatedLocalCart);
      } catch (error) {
        console.error("Failed to set local cart quantity:", error);
        throw error;
      }
    }
  };

  const removeFromCart = async (portfolioId: string) => {
    if (isAuthenticated) {
      // Remove from server cart
      try {
        if (cart) {
          const optimisticCart = { ...cart };
          optimisticCart.items = optimisticCart.items.filter(item => item.portfolio._id !== portfolioId);
          setCart(optimisticCart);
        }

        const updatedCart = await cartService.removeFromCart(portfolioId);
        setCart(updatedCart);
      } catch (error) {
        console.error("Failed to remove from cart:", error);
        await refreshCart();
        throw error;
      }
    } else {
      // Remove from local cart
      try {
        const updatedLocalCart = localCartService.removeFromLocalCart(portfolioId);
        setLocalCart(updatedLocalCart);
      } catch (error) {
        console.error("Failed to remove from local cart:", error);
        throw error;
      }
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      // Clear server cart
      try {
        const result = await cartService.clearCart();
        setCart(result.cart);
      } catch (error) {
        console.error("Failed to clear cart:", error);
        await refreshCart();
        throw error;
      }
    } else {
      // Clear local cart
      try {
        localCartService.clearLocalCart();
        setLocalCart({ items: [], lastUpdated: new Date().toISOString() });
      } catch (error) {
        console.error("Failed to clear local cart:", error);
        throw error;
      }
    }
  };

  const getItemQuantity = (portfolioId: string): number => {
    if (isAuthenticated && cart) {
      const item = cart.items.find(item => item.portfolio._id === portfolioId);
      return item?.quantity || 0;
    } else {
      return localCartService.getLocalItemQuantity(portfolioId);
    }
  };

  const calculateTotal = (subscriptionType: "monthly" | "quarterly" | "yearly"): number => {
    if (isAuthenticated && cart) {
      return cartService.calculateCartTotal(cart, subscriptionType);
    } else {
      return localCartService.calculateLocalCartTotal(subscriptionType);
    }
  };

  const isInCart = (itemId: string): boolean => {
    if (isAuthenticated && cart) {
      return cart.items.some(item => item.portfolio._id === itemId);
    } else {
      return localCartService.isInLocalCart(itemId);
    }
  };

  const hasBundle = (bundleId: string): boolean => {
    if (isAuthenticated && cart) {
      return cart.items.some(item => {
        return cartService.isBundle(item) && item.portfolio._id === bundleId;
      });
    } else {
      return localCartService.isInLocalCart(bundleId);
    }
  };

  const value: CartContextType = {
    cart,
    localCart,
    cartItemCount,
    loading,
    syncing,
    refreshCart,
    addToCart,
    addBundleToCart,
    updateQuantity,
    setQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    calculateTotal,
    isInCart,
    hasBundle,
    syncLocalCartToServer,
    getEffectiveCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};