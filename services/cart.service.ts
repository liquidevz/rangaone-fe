// services/cart.service.ts
import { get, post, del } from "@/lib/axios";
import { authService } from "./auth.service";

export interface CartItem {
  _id: string;
  portfolio: {
    _id: string;
    name: string;
    description: Array<{
      key: string;
      value: string;
    }>;
    subscriptionFee: Array<{
      type: "monthly" | "quarterly" | "yearly";
      price: number;
    }>;
    minInvestment: number;
    durationMonths: number;
  };
  quantity: number;
  addedAt: string;
}

// New bundle cart item interface
export interface BundleCartItem {
  _id: string;
  bundle: {
    _id: string;
    name: string;
    description: string;
    category: string;
    monthlyPrice: number;
    quarterlyPrice: number;
    yearlyPrice: number;
    discountPercentage: number;
  };
  quantity: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// Enhanced cart interface for mixed items (portfolios + bundles)
export interface EnhancedCart {
  _id: string;
  user: string;
  portfolioItems: CartItem[];
  bundleItems: BundleCartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartPayload {
  portfolioId: string;
  quantity?: number;
}

// New bundle cart payload
export interface AddBundleToCartPayload {
  bundleId: string;
  quantity?: number;
}

export interface UpdateQuantityPayload {
  portfolioId: string;
  quantity: number;
}

export const cartService = {
  // Get user's cart
  getCart: async (): Promise<Cart> => {
    const token = authService.getAccessToken();
    return await get<Cart>("/api/user/cart", {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Add portfolio to cart (or update quantity if it exists)
  addToCart: async (payload: AddToCartPayload): Promise<Cart> => {
    const token = authService.getAccessToken();
    try {
      console.log("Adding to cart with payload:", payload);
      const result = await post<Cart>("/api/user/cart", payload, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Cart API response:", result);
      return result;
    } catch (error) {
      console.error("Error in addToCart:", error);
      // If the API fails, try to get the current cart state
      try {
        return await cartService.getCart();
      } catch (fallbackError) {
        console.error("Failed to get cart after error:", fallbackError);
        throw error; // Throw the original error
      }
    }
  },

  // Add subscription bundle to cart - treating bundles as special portfolios
  addBundleToCart: async (bundleId: string, subscriptionType: "monthly" | "quarterly" | "yearly" = "monthly", planCategory?: "basic" | "premium"): Promise<Cart> => {
    const token = authService.getAccessToken();
    
    // For bundles, we'll use a special payload format that the backend can handle
    // If your backend has a separate endpoint for bundles, modify this accordingly
    const payload = {
      portfolioId: bundleId, // Using portfolioId field but with bundle ID
      quantity: 1,
      itemType: "bundle", // Adding type indicator
      subscriptionType,
      ...(planCategory && { planCategory }),
    };

    return await post<Cart>("/api/user/cart", payload, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Update quantity of existing item in cart
  updateQuantity: async (portfolioId: string, newQuantity: number): Promise<Cart> => {
    const token = authService.getAccessToken();
    
    if (newQuantity <= 0) {
      // If quantity is 0 or less, remove the item
      return await cartService.removeFromCart(portfolioId);
    }

    try {
      // First, get the current cart to determine current quantity
      const currentCart = await cartService.getCart();
      const existingItem = currentCart.items.find(item => item.portfolio._id === portfolioId);
      
      if (!existingItem) {
        // Item doesn't exist, add it with the specified quantity
        return await cartService.addToCart({ portfolioId, quantity: newQuantity });
      }

      const currentQuantity = existingItem.quantity;
      
      if (newQuantity === currentQuantity) {
        // No change needed
        return currentCart;
      }

      if (newQuantity > currentQuantity) {
        // Increase quantity: add the difference
        const quantityToAdd = newQuantity - currentQuantity;
        return await cartService.addToCart({ portfolioId, quantity: quantityToAdd });
      } else {
        // Decrease quantity: remove and re-add with correct quantity
        // This is a workaround since the API doesn't have a direct update endpoint
        await cartService.removeFromCart(portfolioId);
        return await cartService.addToCart({ portfolioId, quantity: newQuantity });
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      throw error;
    }
  },

  // Set exact quantity for an item (more efficient for direct quantity changes)
  setQuantity: async (portfolioId: string, exactQuantity: number): Promise<Cart> => {
    const token = authService.getAccessToken();
    
    if (exactQuantity <= 0) {
      return await cartService.removeFromCart(portfolioId);
    }

    try {
      // Remove the item completely first
      await cartService.removeFromCart(portfolioId);
      // Then add it back with the exact quantity
      return await cartService.addToCart({ portfolioId, quantity: exactQuantity });
    } catch (error) {
      // If removal fails (item might not exist), just try to add
      return await cartService.addToCart({ portfolioId, quantity: exactQuantity });
    }
  },

  // Remove item from cart
  removeFromCart: async (portfolioId: string): Promise<Cart> => {
    const token = authService.getAccessToken();
    try {
      console.log(`Removing item from cart: ${portfolioId}`);
      return await del<Cart>(`/api/user/cart/${portfolioId}`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error(`Error removing item ${portfolioId} from cart:`, error);
      // If the specific item removal fails, try clearing the entire cart as fallback
      console.log("Attempting to refresh cart after removal error");
      return await cartService.getCart();
    }
  },

  // Clear cart
  clearCart: async (): Promise<{ message: string; cart: Cart }> => {
    const token = authService.getAccessToken();
    return await del<{ message: string; cart: Cart }>("/api/user/cart", {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get cart item count
  getCartItemCount: async (): Promise<number> => {
    try {
      const cart = await cartService.getCart();
      return cart.items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error("Failed to get cart count:", error);
      return 0;
    }
  },

  // Helper function to get item quantity by portfolio ID
  getItemQuantity: async (portfolioId: string): Promise<number> => {
    try {
      const cart = await cartService.getCart();
      const item = cart.items.find(item => item.portfolio._id === portfolioId);
      return item?.quantity || 0;
    } catch (error) {
      console.error("Failed to get item quantity:", error);
      return 0;
    }
  },

  // Calculate cart total for a specific subscription type
  calculateCartTotal: (cart: Cart, subscriptionType: "monthly" | "quarterly" | "yearly"): number => {
    return cart.items.reduce((total, item) => {
      const fee = item.portfolio.subscriptionFee.find(f => f.type === subscriptionType);
      const price = fee?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  },

  // Calculate bundle cart total for a specific subscription type  
  calculateBundleTotal: (bundleItems: BundleCartItem[], subscriptionType: "monthly" | "quarterly" | "yearly"): number => {
    return bundleItems.reduce((total, item) => {
      let price = 0;
      switch (subscriptionType) {
        case "yearly":
          price = item.bundle.yearlyPrice;
          break;
        case "quarterly":
          price = item.bundle.quarterlyPrice;
          break;
        default:
          price = item.bundle.monthlyPrice;
          break;
      }
      return total + (price * item.quantity);
    }, 0);
  },

  // Utility to identify if an item is a bundle or portfolio
  isBundle: (item: any): boolean => {
    // Check if the item has bundle-specific properties
    return item && item.portfolio && (
      item.portfolio.category === "basic" || 
      item.portfolio.category === "premium" ||
      (item.portfolio.name && item.portfolio.name.toLowerCase().includes("subscription")) ||
      (item.portfolio.name && item.portfolio.name.toLowerCase().includes("bundle"))
    );
  },

  // Utility to get bundle pricing
  getBundlePrice: (bundle: any, subscriptionType: "monthly" | "quarterly" | "yearly"): number => {
    if (!bundle) return 0;
    
    switch (subscriptionType) {
      case "yearly":
        return bundle.yearlyPrice || 0;
      case "quarterly":
        return bundle.quarterlyPrice || 0;
      default:
        return bundle.monthlyPrice || 0;
    }
  },

  // Validate cart items (check if portfolios still exist and are valid)
  validateCart: async (): Promise<{ isValid: boolean; invalidItems: string[] }> => {
    try {
      const cart = await cartService.getCart();
      const invalidItems: string[] = [];

      // This would need to be implemented with a portfolio validation endpoint
      // For now, we'll assume all items are valid
      
      return {
        isValid: invalidItems.length === 0,
        invalidItems,
      };
    } catch (error) {
      console.error("Failed to validate cart:", error);
      return { isValid: false, invalidItems: [] };
    }
  },

  // Clean up invalid cart items (items with null portfolios)
  cleanupInvalidItems: async (): Promise<Cart> => {
    try {
      // Instead of trying to remove individual invalid items, clear the cart and start fresh
      const result = await cartService.clearCart();
      console.log("Cart cleared to remove invalid items");
      return result.cart;
    } catch (error) {
      console.error("Failed to cleanup invalid items:", error);
      throw error;
    }
  },

  // Debug cart function
  debugCart: async (): Promise<void> => {
    try {
      const cart = await cartService.getCart();
      console.log("=== CART SERVICE DEBUG ===");
      console.log("Cart:", cart);
      console.log("Items count:", cart.items.length);
      console.log("Items:", cart.items);
      console.log("=== END CART SERVICE DEBUG ===");
    } catch (error) {
      console.error("Cart service debug failed:", error);
    }
  },
  

};