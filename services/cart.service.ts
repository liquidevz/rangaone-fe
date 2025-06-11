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

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartPayload {
  portfolioId: string;
  quantity?: number;
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

  // Add item to cart
  addToCart: async (payload: AddToCartPayload): Promise<Cart> => {
    const token = authService.getAccessToken();
    return await post<Cart>("/api/user/cart", payload, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Remove item from cart
  removeFromCart: async (portfolioId: string): Promise<Cart> => {
    const token = authService.getAccessToken();
    return await del<Cart>(`/api/user/cart/${portfolioId}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
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
};