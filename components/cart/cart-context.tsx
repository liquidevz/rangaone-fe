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
  error: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (portfolioId: string, quantity?: number) => Promise<void>;
  addBundleToCart: (bundleId: string, subscriptionType?: "monthly" | "quarterly" | "yearly", planCategory?: "basic" | "premium") => Promise<void>;
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
  clearError: () => void;
  forceCleanupInvalidItems: () => Promise<void>;
  debugCart: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Enhanced error handling
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Cart ${operation} error:`, error);
    
    let errorMessage = `Failed to ${operation}`;
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    
    // Show toast for user feedback
    toast({
      title: "Cart Error",
      description: errorMessage,
      variant: "destructive",
    });
  }, [toast]);

  // Load local cart on mount with error handling
  useEffect(() => {
    try {
      const localCartData = localCartService.getLocalCart();
      setLocalCart(localCartData);
      console.log("Local cart loaded:", localCartData);
    } catch (error) {
      console.error("Failed to load local cart:", error);
      handleError(error, "load local cart");
    }
  }, [handleError]);

  // Validate server cart item
  const isValidServerCartItem = useCallback((item: any) => {
    try {
      // Basic validation - require portfolio and quantity
      return item && 
             item.portfolio && 
             item.portfolio._id && 
             item.quantity;
    } catch (error) {
      console.error("Error validating server cart item:", error, item);
      return false;
    }
  }, []);

  // Validate local cart item  
  const isValidLocalCartItem = useCallback((item: any) => {
    return item && 
           item.portfolioId && 
           item.itemData && 
           item.itemData.name && 
           typeof item.quantity === 'number' && 
           item.quantity > 0 && 
           item.itemType;
  }, []);

  // Clean up invalid items from local storage
  const cleanupInvalidLocalItems = useCallback(() => {
    try {
      const currentLocalCart = localCartService.getLocalCart();
      const validItems = currentLocalCart.items.filter(isValidLocalCartItem);
      
      if (validItems.length !== currentLocalCart.items.length) {
        console.log(`Cleaning up ${currentLocalCart.items.length - validItems.length} invalid items from local cart`);
        const cleanedCart = { ...currentLocalCart, items: validItems };
        localCartService.clearLocalCart();
        validItems.forEach(item => {
          if (item.itemType === "bundle") {
            localCartService.addBundleToLocalCart(item.bundleId!, item.subscriptionType, item.itemData, item.planCategory);
          } else {
            localCartService.addPortfolioToLocalCart(item.portfolioId, item.quantity, item.subscriptionType, item.itemData, item.planCategory);
          }
        });
        setLocalCart(cleanedCart);
      }
    } catch (error) {
      console.error("Error cleaning up invalid items:", error);
    }
  }, [isValidLocalCartItem]);

  // Get effective cart (server cart if authenticated, local cart if not)
  const getEffectiveCart = useCallback(() => {
    try {
      if (isAuthenticated && cart) {
        // Return all cart items without filtering
        return {
          items: cart.items,
          itemCount: cart.items.reduce((total, item) => total + (item.quantity || 1), 0)
        };
      } else {
        // Filter out invalid local cart items
        const validLocalItems = localCart.items.filter(isValidLocalCartItem);
        
        // If we found invalid items, clean them up
        if (validLocalItems.length !== localCart.items.length) {
          cleanupInvalidLocalItems();
        }
        
        // Convert valid local cart items to display format
        const items = validLocalItems.map(localItem => ({
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
          itemCount: validLocalItems.reduce((total, item) => total + item.quantity, 0)
        };
      }
    } catch (error) {
      console.error("Error getting effective cart:", error);
      return { items: [], itemCount: 0 };
    }
  }, [isAuthenticated, cart, localCart, isValidLocalCartItem, cleanupInvalidLocalItems]);

  const cartItemCount = getEffectiveCart().itemCount;

  // Enhanced cart refresh with better error handling
  const refreshCart = useCallback(async () => {
    if (authLoading) return; // Don't refresh while auth is loading
    
    // Rate limiting to prevent infinite loops
    const now = Date.now();
    if (now - lastRefreshTime < 500) { // Prevent refresh more than once every 0.5 seconds
      console.log("Cart refresh rate limited");
      return;
    }
    setLastRefreshTime(now);
    
    if (!isAuthenticated) {
      try {
        const localCartData = localCartService.getLocalCart();
        setLocalCart(localCartData);
        console.log("Refreshed local cart");
      } catch (error) {
        console.error("Failed to refresh local cart:", error);
        handleError(error, "refresh local cart");
      }
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const cartData = await cartService.getCart();
      console.log("Server cart fetched:", cartData);
      
      // Accept all items from the server - don't filter them
      // This prevents valid items from being incorrectly filtered out
      
      // Enrich cart items with full portfolio data if description is missing
      if (cartData.items && cartData.items.length > 0) {
        try {
          const { userPortfolioService } = await import("@/services/user-portfolio.service");
          const allPortfolios = await userPortfolioService.getAll();
          
          const enrichedItems = cartData.items.map(item => {
            try {
              // Check if item has valid portfolio (double check after cleanup)
              if (!item || !item.portfolio || !item.portfolio._id) {
                console.warn("Invalid cart item found after cleanup:", item);
                return item;
              }
              
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
          } catch (itemError) {
            console.error("Error enriching cart item:", itemError, item);
            return item;
          }
        });
          
          cartData.items = enrichedItems;
        } catch (portfolioError) {
          console.warn("Failed to enrich portfolio data:", portfolioError);
          // Continue with cart data without enrichment
        }
      }
      
      setCart(cartData);
      console.log("Cart refreshed successfully");
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      handleError(error, "refresh cart");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, handleError, lastRefreshTime]);

  // Enhanced sync with better error handling and recovery
  const syncLocalCartToServer = useCallback(async () => {
    if (!isAuthenticated || syncing || authLoading) return;
    
    const localCartData = localCartService.getLocalCart();
    if (localCartData.items.length === 0) return;

    try {
      setSyncing(true);
      setError(null);
      console.log("Starting cart sync...", localCartData);

      let successCount = 0;
      let failureCount = 0;

      // Add each local cart item to server cart
      for (const localItem of localCartData.items) {
        try {
          if (localItem.itemType === "bundle") {
            await cartService.addBundleToCart(localItem.bundleId!, localItem.subscriptionType, localItem.planCategory);
          } else {
            await cartService.addToCart({ 
              portfolioId: localItem.portfolioId, 
              quantity: localItem.quantity 
            });
          }
          successCount++;
        } catch (error) {
          console.error("Failed to sync item:", localItem, error);
          failureCount++;
        }
      }

      // Clear local cart only if all items were successfully synced
      if (failureCount === 0) {
        localCartService.clearLocalCart();
        setLocalCart({ items: [], lastUpdated: new Date().toISOString() });
        console.log("Local cart cleared after successful sync");
      }
      
      // Refresh server cart
      await refreshCart();
      
      // Show appropriate toast message
      if (successCount > 0) {
        toast({
          title: "Cart Synced",
          description: `${successCount} item(s) transferred to your account${failureCount > 0 ? `. ${failureCount} item(s) failed to sync.` : '.'}`,
        });
      }
      
      if (failureCount > 0) {
        toast({
          title: "Partial Sync",
          description: `${failureCount} item(s) failed to sync. Please try adding them manually.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to sync local cart:", error);
      handleError(error, "sync cart");
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, syncing, authLoading, refreshCart, toast, handleError]);

  // Enhanced auth state change handling
  useEffect(() => {
    if (authLoading) return; // Don't run while auth is loading
    
    const handleAuthChange = async () => {
      if (isAuthenticated && user && !authInitialized) {
        console.log("User authenticated, initializing cart...");
        setAuthInitialized(true);
        
        // Check if there are items in local cart to sync
        if (localCartService.hasItems()) {
          await syncLocalCartToServer();
        } else {
          await refreshCart();
        }
      } else if (!isAuthenticated && authInitialized) {
        console.log("User logged out, clearing server cart...");
        setCart(null);
        setAuthInitialized(false);
        await refreshCart(); // This will refresh local cart
      }
    };

    handleAuthChange();
  }, [isAuthenticated, user, authLoading, authInitialized, syncLocalCartToServer, refreshCart]);

  // Enhanced add to cart with subscription check
  const addToCart = async (portfolioId: string, quantity: number = 1) => {
    try {
      if (!portfolioId || typeof portfolioId !== 'string' || portfolioId.trim() === '') {
        console.error("Cannot add to cart: Invalid portfolio ID", portfolioId);
        toast({
          title: "Error",
          description: "Invalid portfolio ID",
          variant: "destructive",
        });
        return;
      }
      
      setError(null);
      console.log(`Cart context: Adding portfolio ${portfolioId} with quantity ${quantity}`);
      
      // Check if user has already purchased this portfolio
      if (isAuthenticated) {
        try {
          const { subscriptionService } = await import("@/services/subscription.service");
          const hasAccess = await subscriptionService.hasPortfolioAccess(portfolioId);
          
          if (hasAccess) {
            const errorMessage = "You already have access to this portfolio. No need to purchase again.";
            setError(errorMessage);
            toast({
              title: "Already Purchased",
              description: errorMessage,
              variant: "destructive",
            });
            return;
          }
        } catch (subscriptionError) {
          console.warn("Failed to check subscription status:", subscriptionError);
          // Continue with adding to cart if subscription check fails
        }
        
        try {
          // Add to server cart
          console.log("Sending addToCart request with:", { portfolioId, quantity });
          const updatedCart = await cartService.addToCart({ portfolioId, quantity });
          console.log("Server returned cart:", updatedCart);
          
          if (updatedCart) {
            setCart(updatedCart);
            console.log("Added to server cart:", portfolioId, quantity);
            
            // Force a refresh to ensure we have the latest cart data
            setTimeout(() => refreshCart(), 500);
          } else {
            console.error("Server returned empty cart");
            await refreshCart();
          }
        } catch (cartError) {
          console.error("Error adding to server cart:", cartError);
          // Try to refresh the cart to get the latest state
          await refreshCart();
          throw cartError;
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
          console.log("Added to local cart:", portfolioId, quantity);
        } catch (portfolioError) {
          console.error("Failed to get portfolio data:", portfolioError);
          // Add with minimal data as fallback
          const itemData = {
            name: `Portfolio ${portfolioId.slice(-6)}`,
            description: [],
            subscriptionFee: [
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
          console.log("Added to local cart with fallback data:", portfolioId, quantity);
        }
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      handleError(error, "add to cart");
      throw error;
    }
  };

  // Enhanced add bundle to cart with subscription check
  const addBundleToCart = async (bundleId: string, subscriptionType: "monthly" | "quarterly" | "yearly" = "monthly", planCategory?: "basic" | "premium") => {
    try {
      setError(null);
      
      // Check if user has already purchased this bundle
      if (isAuthenticated) {
        try {
          const { subscriptionService } = await import("@/services/subscription.service");
          const access = await subscriptionService.getSubscriptionAccess();
          
          // Check if user already has premium access (for premium bundles) or basic access (for basic bundles)
          const isPremiumBundle = bundleId.includes("premium");
          const isBasicBundle = bundleId.includes("basic");
          
          if ((isPremiumBundle && access.hasPremium) || (isBasicBundle && access.hasBasic)) {
            const bundleType = isPremiumBundle ? "premium" : "basic";
            const errorMessage = `You already have ${bundleType} access. No need to purchase again.`;
            setError(errorMessage);
            toast({
              title: "Already Purchased",
              description: errorMessage,
              variant: "destructive",
            });
            return;
          }
        } catch (subscriptionError) {
          console.warn("Failed to check subscription status:", subscriptionError);
          // Continue with adding to cart if subscription check fails
        }
        
        // Add to server cart
        const updatedCart = await cartService.addBundleToCart(bundleId, subscriptionType, planCategory);
        setCart(updatedCart);
        console.log("Added bundle to server cart:", bundleId, subscriptionType);
      } else {
        // Add to local cart
        const itemData = {
          name: bundleId.includes("premium") ? "Premium Subscription" : "Basic Subscription",
          category: bundleId.includes("premium") ? "premium" : "basic",
          monthlyPrice: bundleId.includes("premium") ? 1999 : 999,
          quarterlyPrice: bundleId.includes("premium") ? 5997 : 2997,
          yearlyPrice: bundleId.includes("premium") ? 19999 : 9999,
          description: []
        };
        
        const updatedLocalCart = localCartService.addBundleToLocalCart(
          bundleId,
          subscriptionType,
          itemData,
          planCategory
        );
        setLocalCart(updatedLocalCart);
        console.log("Added bundle to local cart:", bundleId, subscriptionType);
      }
    } catch (error) {
      console.error("Failed to add bundle to cart:", error);
      handleError(error, "add bundle to cart");
      throw error;
    }
  };

  // Enhanced update quantity
  const updateQuantity = async (portfolioId: string, newQuantity: number) => {
    try {
      setError(null);
      
      if (isAuthenticated) {
        // Update server cart
        // Optimistically update the UI
        if (cart) {
          const optimisticCart = { ...cart };
          const itemIndex = optimisticCart.items.findIndex(item => {
            try {
              return item && item.portfolio && item.portfolio._id === portfolioId;
            } catch (error) {
              console.error("Error finding item in cart:", error, item);
              return false;
            }
          });
          
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
        console.log("Updated server cart quantity:", portfolioId, newQuantity);
      } else {
        // Update local cart
        const updatedLocalCart = localCartService.updateLocalCartQuantity(portfolioId, newQuantity);
        setLocalCart(updatedLocalCart);
        console.log("Updated local cart quantity:", portfolioId, newQuantity);
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      await refreshCart(); // Refresh to get correct state
      handleError(error, "update quantity");
      throw error;
    }
  };

  // Enhanced set quantity
  const setQuantity = async (portfolioId: string, exactQuantity: number) => {
    try {
      setError(null);
      
      if (isAuthenticated) {
        // Update server cart
        const updatedCart = await cartService.setQuantity(portfolioId, exactQuantity);
        setCart(updatedCart);
        console.log("Set server cart quantity:", portfolioId, exactQuantity);
      } else {
        // Update local cart
        const updatedLocalCart = localCartService.updateLocalCartQuantity(portfolioId, exactQuantity);
        setLocalCart(updatedLocalCart);
        console.log("Set local cart quantity:", portfolioId, exactQuantity);
      }
    } catch (error) {
      console.error("Failed to set quantity:", error);
      await refreshCart();
      handleError(error, "set quantity");
      throw error;
    }
  };

  // Enhanced remove from cart
  const removeFromCart = async (portfolioId: string) => {
    try {
      setError(null);
      
      if (!portfolioId) {
        console.error("Cannot remove from cart: Invalid portfolio ID");
        toast({
          title: "Error",
          description: "Invalid portfolio ID",
          variant: "destructive",
        });
        return;
      }
      
      if (isAuthenticated) {
        // Remove from server cart
        if (cart) {
          const optimisticCart = { ...cart };
          optimisticCart.items = optimisticCart.items.filter(item => {
            try {
              return item && item.portfolio && item.portfolio._id !== portfolioId;
            } catch (error) {
              console.error("Error filtering cart item during removal:", error, item);
              return false;
            }
          });
          setCart(optimisticCart);
        }

        try {
          const updatedCart = await cartService.removeFromCart(portfolioId);
          setCart(updatedCart);
          console.log("Removed from server cart:", portfolioId);
        } catch (removeError) {
          console.error("Failed to remove item, trying to refresh cart:", removeError);
          await refreshCart();
        }
      } else {
        // Remove from local cart
        const updatedLocalCart = localCartService.removeFromLocalCart(portfolioId);
        setLocalCart(updatedLocalCart);
        console.log("Removed from local cart:", portfolioId);
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      await refreshCart();
      handleError(error, "remove from cart");
      throw error;
    }
  };

  // Enhanced clear cart with validation cleanup
  const clearCart = async () => {
    try {
      setError(null);
      
      if (isAuthenticated) {
        // Clear server cart
        const result = await cartService.clearCart();
        setCart(result.cart);
        console.log("Cleared server cart");
      } else {
        // Clear local cart
        localCartService.clearLocalCart();
        setLocalCart({ items: [], lastUpdated: new Date().toISOString() });
        console.log("Cleared local cart");
      }
      
      // Force cleanup of any remaining invalid items
      cleanupInvalidLocalItems();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      await refreshCart();
      handleError(error, "clear cart");
      throw error;
    }
  };

  // Simple cart refresh function
  const forceCleanupInvalidItems = useCallback(async () => {
    try {
      await refreshCart();
      toast({
        title: "Cart Refreshed",
        description: "Your cart has been refreshed.",
      });
    } catch (error) {
      console.error("Failed to refresh cart:", error);
      handleError(error, "refresh cart");
    }
  }, [refreshCart, toast, handleError]);

  // Debug cart functionality
  const debugCart = useCallback(async () => {
    try {
      console.log("=== CART CONTEXT DEBUG ===");
      console.log("Authentication state:", { isAuthenticated, user: !!user, authLoading });
      console.log("Cart state:", { cart, localCart, cartItemCount, loading, syncing, error });
      
      // Debug local cart
      console.log("Local cart items:", localCart.items);
      console.log("Local cart valid items:", localCart.items.filter(isValidLocalCartItem));
      
      // Debug server cart if authenticated
      if (isAuthenticated) {
        console.log("Server cart items:", cart?.items || []);
        console.log("Server cart valid items:", cart?.items.filter(isValidServerCartItem) || []);
        
        // Call cart service debug
        await cartService.debugCart();
      }
      
      // Debug effective cart
      const effectiveCart = getEffectiveCart();
      console.log("Effective cart:", effectiveCart);
      
      console.log("=== END CART CONTEXT DEBUG ===");
      
      toast({
        title: "Cart Debug",
        description: "Debug information logged to console. Check browser console for details.",
      });
    } catch (error) {
      console.error("Cart debug failed:", error);
      handleError(error, "debug cart");
    }
  }, [isAuthenticated, user, authLoading, cart, localCart, cartItemCount, loading, syncing, error, isValidLocalCartItem, isValidServerCartItem, getEffectiveCart, toast, handleError]);

  // Enhanced get item quantity using validated items
  const getItemQuantity = (portfolioId: string): number => {
    try {
      const effectiveCart = getEffectiveCart();
      
      if (isAuthenticated && cart) {
        const item = effectiveCart.items.find(item => {
          try {
            return item && item.portfolio && item.portfolio._id === portfolioId;
          } catch (error) {
            console.error("Error finding item quantity:", error, item);
            return false;
          }
        });
        return item?.quantity || 0;
      } else {
        // Find item in validated local cart items
        const validLocalItems = localCart.items.filter(isValidLocalCartItem);
        const item = validLocalItems.find(item => item.portfolioId === portfolioId);
        return item?.quantity || 0;
      }
    } catch (error) {
      console.error("Failed to get item quantity:", error);
      return 0;
    }
  };

  // Enhanced calculate total using validated items
  const calculateTotal = (subscriptionType: "monthly" | "quarterly" | "yearly"): number => {
    try {
      const effectiveCart = getEffectiveCart();
      
      if (isAuthenticated && cart) {
        // Use validated items from effective cart
        const validatedCart = { ...cart, items: effectiveCart.items };
        return cartService.calculateCartTotal(validatedCart, subscriptionType);
      } else {
        // Calculate total from valid local cart items
        const validLocalItems = localCart.items.filter(isValidLocalCartItem);
        let total = 0;
        
        validLocalItems.forEach(item => {
          if (item.itemType === "bundle") {
            // Bundle pricing logic
            let price = 0;
            if (item.itemData.subscriptionFee) {
              const fee = item.itemData.subscriptionFee.find(f => f.type === subscriptionType);
              price = fee?.price || 0;
            } else {
              // Fallback to direct pricing
              switch (subscriptionType) {
                case "yearly":
                  price = item.itemData.yearlyPrice || 0;
                  break;
                case "quarterly":
                  price = item.itemData.quarterlyPrice || 0;
                  break;
                default:
                  price = item.itemData.monthlyPrice || 0;
                  break;
              }
            }
            total += price * item.quantity;
          } else {
            // Portfolio pricing logic
            if (item.itemData.subscriptionFee) {
              const fee = item.itemData.subscriptionFee.find(f => f.type === subscriptionType);
              const price = fee?.price || 0;
              total += price * item.quantity;
            }
          }
        });
        
        return total;
      }
    } catch (error) {
      console.error("Failed to calculate total:", error);
      return 0;
    }
  };

  // Enhanced is in cart using validated items
  const isInCart = (itemId: string): boolean => {
    try {
      const effectiveCart = getEffectiveCart();
      
      if (isAuthenticated && cart) {
        return effectiveCart.items.some(item => {
          try {
            return item && item.portfolio && item.portfolio._id === itemId;
          } catch (error) {
            console.error("Error checking if item is in cart:", error, item);
            return false;
          }
        });
      } else {
        // Check in validated local cart items
        const validLocalItems = localCart.items.filter(isValidLocalCartItem);
        return validLocalItems.some(item => item.portfolioId === itemId);
      }
    } catch (error) {
      console.error("Failed to check if item is in cart:", error);
      return false;
    }
  };

  // Enhanced has bundle
  const hasBundle = (bundleId: string): boolean => {
    try {
      if (isAuthenticated && cart) {
        return cart.items.some(item => {
          try {
            return item && item.portfolio && cartService.isBundle(item) && item.portfolio._id === bundleId;
          } catch (error) {
            console.error("Error checking if bundle is in cart:", error, item);
            return false;
          }
        });
      } else {
        return localCartService.isInLocalCart(bundleId);
      }
    } catch (error) {
      console.error("Failed to check if bundle is in cart:", error);
      return false;
    }
  };

  const value: CartContextType = {
    cart,
    localCart,
    cartItemCount,
    loading,
    syncing,
    error,
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
    clearError,
    forceCleanupInvalidItems,
    debugCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};