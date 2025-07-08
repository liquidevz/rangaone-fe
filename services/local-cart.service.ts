import { Cart, CartItem, BundleCartItem } from "./cart.service";

export interface LocalCartItem {
  portfolioId: string;
  bundleId?: string;
  quantity: number;
  subscriptionType: "monthly" | "quarterly" | "yearly";
  itemType: "portfolio" | "bundle";
  addedAt: string;
  // Store minimal item data for offline display
  itemData: {
    name: string;
    category?: string;
    monthlyPrice?: number;
    quarterlyPrice?: number;
    yearlyPrice?: number;
    description?: Array<{
      key: string;
      value: string;
    }>;
    subscriptionFee?: Array<{
      type: "monthly" | "quarterly" | "yearly";
      price: number;
    }>;
  };
}

export interface LocalCart {
  items: LocalCartItem[];
  lastUpdated: string;
}

const CART_STORAGE_KEY = "rangaone_local_cart";

export class LocalCartService {
  private static instance: LocalCartService;
  
  public static getInstance(): LocalCartService {
    if (!LocalCartService.instance) {
      LocalCartService.instance = new LocalCartService();
    }
    return LocalCartService.instance;
  }

  private constructor() {
    // Private constructor for singleton
  }

  // Check if we're in a browser environment
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  // Get local cart from localStorage
  getLocalCart(): LocalCart {
    if (!this.isBrowser()) {
      return { items: [], lastUpdated: new Date().toISOString() };
    }

    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      if (!cartData) {
        return { items: [], lastUpdated: new Date().toISOString() };
      }
      return JSON.parse(cartData);
    } catch (error) {
      console.error("Failed to parse local cart data:", error);
      this.clearLocalCart();
      return { items: [], lastUpdated: new Date().toISOString() };
    }
  }

  // Save local cart to localStorage
  private saveLocalCart(cart: LocalCart): void {
    if (!this.isBrowser()) return;

    try {
      cart.lastUpdated = new Date().toISOString();
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save local cart:", error);
    }
  }

  // Add portfolio to local cart
  addPortfolioToLocalCart(
    portfolioId: string, 
    quantity: number = 1,
    subscriptionType: "monthly" | "quarterly" | "yearly" = "monthly",
    itemData: LocalCartItem["itemData"]
  ): LocalCart {
    const cart = this.getLocalCart();
    const existingItemIndex = cart.items.findIndex(
      item => item.portfolioId === portfolioId && item.itemType === "portfolio"
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].subscriptionType = subscriptionType;
    } else {
      // Add new item
      const newItem: LocalCartItem = {
        portfolioId,
        quantity,
        subscriptionType,
        itemType: "portfolio",
        addedAt: new Date().toISOString(),
        itemData
      };
      cart.items.push(newItem);
    }

    this.saveLocalCart(cart);
    return cart;
  }

  // Add bundle to local cart
  addBundleToLocalCart(
    bundleId: string,
    subscriptionType: "monthly" | "quarterly" | "yearly" = "monthly",
    itemData: LocalCartItem["itemData"]
  ): LocalCart {
    const cart = this.getLocalCart();
    const existingItemIndex = cart.items.findIndex(
      item => item.bundleId === bundleId && item.itemType === "bundle"
    );

    if (existingItemIndex >= 0) {
      // Update existing bundle subscription type
      cart.items[existingItemIndex].subscriptionType = subscriptionType;
    } else {
      // Add new bundle (quantity is always 1 for bundles)
      const newItem: LocalCartItem = {
        portfolioId: bundleId, // Using portfolioId for consistency
        bundleId,
        quantity: 1,
        subscriptionType,
        itemType: "bundle",
        addedAt: new Date().toISOString(),
        itemData
      };
      cart.items.push(newItem);
    }

    this.saveLocalCart(cart);
    return cart;
  }

  // Remove item from local cart
  removeFromLocalCart(itemId: string): LocalCart {
    const cart = this.getLocalCart();
    cart.items = cart.items.filter(
      item => item.portfolioId !== itemId && item.bundleId !== itemId
    );
    this.saveLocalCart(cart);
    return cart;
  }

  // Update item quantity in local cart
  updateLocalCartQuantity(itemId: string, newQuantity: number): LocalCart {
    const cart = this.getLocalCart();
    const itemIndex = cart.items.findIndex(
      item => item.portfolioId === itemId || item.bundleId === itemId
    );

    if (itemIndex >= 0) {
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = newQuantity;
      }
    }

    this.saveLocalCart(cart);
    return cart;
  }

  // Clear local cart
  clearLocalCart(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  // Get local cart item count
  getLocalCartItemCount(): number {
    const cart = this.getLocalCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Check if item is in local cart
  isInLocalCart(itemId: string): boolean {
    const cart = this.getLocalCart();
    return cart.items.some(
      item => item.portfolioId === itemId || item.bundleId === itemId
    );
  }

  // Get item quantity from local cart
  getLocalItemQuantity(itemId: string): number {
    const cart = this.getLocalCart();
    const item = cart.items.find(
      item => item.portfolioId === itemId || item.bundleId === itemId
    );
    return item?.quantity || 0;
  }

  // Calculate local cart total for a subscription type
  calculateLocalCartTotal(subscriptionType: "monthly" | "quarterly" | "yearly"): number {
    const cart = this.getLocalCart();
    return cart.items.reduce((total, item) => {
      let price = 0;
      
      if (item.itemType === "bundle") {
        // Bundle pricing
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
      } else {
        // Portfolio pricing
        const fee = item.itemData.subscriptionFee?.find(f => f.type === subscriptionType);
        price = fee?.price || 0;
      }
      
      return total + (price * item.quantity);
    }, 0);
  }

  // Convert local cart to server cart format for syncing
  convertToServerCartFormat(): Array<{
    portfolioId: string;
    quantity: number;
    itemType?: string;
    subscriptionType?: string;
  }> {
    const cart = this.getLocalCart();
    return cart.items.map(item => ({
      portfolioId: item.bundleId || item.portfolioId,
      quantity: item.quantity,
      itemType: item.itemType,
      subscriptionType: item.subscriptionType
    }));
  }

  // Check if local cart has any items
  hasItems(): boolean {
    const cart = this.getLocalCart();
    return cart.items.length > 0;
  }

  // Get local cart summary for display
  getCartSummary(): {
    itemCount: number;
    totalValue: number;
    items: Array<{
      id: string;
      name: string;
      type: "portfolio" | "bundle";
      quantity: number;
    }>;
  } {
    const cart = this.getLocalCart();
    const itemCount = this.getLocalCartItemCount();
    const totalValue = this.calculateLocalCartTotal("monthly"); // Default to monthly for summary
    
    const items = cart.items.map(item => ({
      id: item.bundleId || item.portfolioId,
      name: item.itemData.name,
      type: item.itemType,
      quantity: item.quantity
    }));

    return { itemCount, totalValue, items };
  }
}

// Export singleton instance
export const localCartService = LocalCartService.getInstance(); 