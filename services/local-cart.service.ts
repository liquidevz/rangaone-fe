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
const CART_BACKUP_KEY = "rangaone_local_cart_backup";

export class LocalCartService {
  private static instance: LocalCartService;
  private fallbackCart: LocalCart = { items: [], lastUpdated: new Date().toISOString() };
  private storageAvailable: boolean = true;
  
  public static getInstance(): LocalCartService {
    if (!LocalCartService.instance) {
      LocalCartService.instance = new LocalCartService();
    }
    return LocalCartService.instance;
  }

  private constructor() {
    // Test storage availability on initialization
    this.testStorageAvailability();
  }

  // Test if localStorage is available and working
  private testStorageAvailability(): void {
    try {
      if (!this.isBrowser()) {
        this.storageAvailable = false;
        return;
      }

      const testKey = "__test_storage__";
      const testValue = "test";
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      this.storageAvailable = retrieved === testValue;
      
      if (!this.storageAvailable) {
        console.warn("localStorage is not available, cart will use memory storage");
      }
    } catch (error) {
      console.error("localStorage test failed:", error);
      this.storageAvailable = false;
    }
  }

  // Check if we're in a browser environment
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  // Get data from storage with fallback
  private getFromStorage(key: string): string | null {
    if (!this.storageAvailable || !this.isBrowser()) {
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage:`, error);
      return null;
    }
  }

  // Set data to storage with fallback
  private setToStorage(key: string, value: string): boolean {
    if (!this.storageAvailable || !this.isBrowser()) {
      return false;
    }

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Failed to set ${key} to localStorage:`, error);
      
      // Try to clear some space and retry
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn("localStorage quota exceeded, attempting to clear backup data");
        try {
          localStorage.removeItem(CART_BACKUP_KEY);
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.error("Failed to save even after clearing backup:", retryError);
        }
      }
      
      return false;
    }
  }

  // Remove data from storage
  private removeFromStorage(key: string): boolean {
    if (!this.storageAvailable || !this.isBrowser()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
      return false;
    }
  }

  // Get local cart from localStorage with enhanced error handling
  getLocalCart(): LocalCart {
    if (!this.isBrowser()) {
      console.log("Not in browser, returning empty cart");
      return { items: [], lastUpdated: new Date().toISOString() };
    }

    try {
      const cartData = this.getFromStorage(CART_STORAGE_KEY);
      
      if (!cartData) {
        console.log("No cart data found in storage");
        return { items: [], lastUpdated: new Date().toISOString() };
      }

      const parsedCart = JSON.parse(cartData);
      
      // Validate cart structure
      if (!parsedCart || typeof parsedCart !== 'object' || !Array.isArray(parsedCart.items)) {
        console.warn("Invalid cart data structure, returning empty cart");
        this.clearLocalCart();
        return { items: [], lastUpdated: new Date().toISOString() };
      }

      // Validate each item
      const validItems = parsedCart.items.filter((item: any) => {
        return item && 
               typeof item === 'object' && 
               item.portfolioId && 
               item.itemType && 
               item.quantity && 
               item.addedAt &&
               item.itemData;
      });

      if (validItems.length !== parsedCart.items.length) {
        console.warn(`Filtered out ${parsedCart.items.length - validItems.length} invalid cart items`);
      }

      const validCart = {
        items: validItems,
        lastUpdated: parsedCart.lastUpdated || new Date().toISOString()
      };

      console.log("Successfully loaded cart from storage:", validCart);
      return validCart;
    } catch (error) {
      console.error("Failed to parse local cart data:", error);
      
      // Try to load from backup
      try {
        const backupData = this.getFromStorage(CART_BACKUP_KEY);
        if (backupData) {
          const backupCart = JSON.parse(backupData);
          console.log("Loaded cart from backup");
          return backupCart;
        }
      } catch (backupError) {
        console.error("Failed to load backup cart:", backupError);
      }
      
      // Clear corrupted data
      this.clearLocalCart();
      return { items: [], lastUpdated: new Date().toISOString() };
    }
  }

  // Save local cart to localStorage with enhanced error handling
  private saveLocalCart(cart: LocalCart): void {
    if (!this.isBrowser()) {
      // Store in memory fallback
      this.fallbackCart = { ...cart };
      return;
    }

    try {
      cart.lastUpdated = new Date().toISOString();
      const cartJson = JSON.stringify(cart);
      
      // Save main cart
      const saved = this.setToStorage(CART_STORAGE_KEY, cartJson);
      
      if (saved) {
        console.log("Cart saved to localStorage successfully");
        
        // Create backup (with size limit)
        if (cartJson.length < 50000) { // ~50KB limit for backup
          this.setToStorage(CART_BACKUP_KEY, cartJson);
        }
      } else {
        console.warn("Failed to save cart to localStorage, using memory storage");
        this.fallbackCart = { ...cart };
      }
    } catch (error) {
      console.error("Failed to save local cart:", error);
      this.fallbackCart = { ...cart };
    }
  }

  // Add portfolio to local cart with enhanced error handling
  addPortfolioToLocalCart(
    portfolioId: string, 
    quantity: number = 1,
    subscriptionType: "monthly" | "quarterly" | "yearly" = "monthly",
    itemData: LocalCartItem["itemData"]
  ): LocalCart {
    try {
      if (!portfolioId || quantity <= 0) {
        throw new Error("Invalid portfolio ID or quantity");
      }

      const cart = this.getLocalCart();
      const existingItemIndex = cart.items.findIndex(
        item => item.portfolioId === portfolioId && item.itemType === "portfolio"
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].subscriptionType = subscriptionType;
        cart.items[existingItemIndex].itemData = { ...itemData }; // Update item data
        console.log(`Updated existing portfolio ${portfolioId} quantity to ${cart.items[existingItemIndex].quantity}`);
      } else {
        // Add new item
        const newItem: LocalCartItem = {
          portfolioId,
          quantity,
          subscriptionType,
          itemType: "portfolio",
          addedAt: new Date().toISOString(),
          itemData: { ...itemData }
        };
        cart.items.push(newItem);
        console.log(`Added new portfolio ${portfolioId} with quantity ${quantity}`);
      }

      this.saveLocalCart(cart);
      return cart;
    } catch (error) {
      console.error("Failed to add portfolio to local cart:", error);
      throw error;
    }
  }

  // Add bundle to local cart with enhanced error handling
  addBundleToLocalCart(
    bundleId: string,
    subscriptionType: "monthly" | "quarterly" | "yearly" = "monthly",
    itemData: LocalCartItem["itemData"]
  ): LocalCart {
    try {
      if (!bundleId) {
        throw new Error("Invalid bundle ID");
      }

      const cart = this.getLocalCart();
      const existingItemIndex = cart.items.findIndex(
        item => item.bundleId === bundleId && item.itemType === "bundle"
      );

      if (existingItemIndex >= 0) {
        // Update existing bundle subscription type
        cart.items[existingItemIndex].subscriptionType = subscriptionType;
        cart.items[existingItemIndex].itemData = { ...itemData }; // Update item data
        console.log(`Updated existing bundle ${bundleId} subscription type to ${subscriptionType}`);
      } else {
        // Add new bundle (quantity is always 1 for bundles)
        const newItem: LocalCartItem = {
          portfolioId: bundleId, // Using portfolioId for consistency
          bundleId,
          quantity: 1,
          subscriptionType,
          itemType: "bundle",
          addedAt: new Date().toISOString(),
          itemData: { ...itemData }
        };
        cart.items.push(newItem);
        console.log(`Added new bundle ${bundleId} with subscription type ${subscriptionType}`);
      }

      this.saveLocalCart(cart);
      return cart;
    } catch (error) {
      console.error("Failed to add bundle to local cart:", error);
      throw error;
    }
  }

  // Remove item from local cart with enhanced error handling
  removeFromLocalCart(itemId: string): LocalCart {
    try {
      if (!itemId) {
        throw new Error("Invalid item ID");
      }

      const cart = this.getLocalCart();
      const initialLength = cart.items.length;
      
      cart.items = cart.items.filter(
        item => item.portfolioId !== itemId && item.bundleId !== itemId
      );

      const removedCount = initialLength - cart.items.length;
      console.log(`Removed ${removedCount} item(s) with ID ${itemId}`);

      this.saveLocalCart(cart);
      return cart;
    } catch (error) {
      console.error("Failed to remove from local cart:", error);
      throw error;
    }
  }

  // Update item quantity in local cart with enhanced error handling
  updateLocalCartQuantity(itemId: string, newQuantity: number): LocalCart {
    try {
      if (!itemId) {
        throw new Error("Invalid item ID");
      }

      const cart = this.getLocalCart();
      const itemIndex = cart.items.findIndex(
        item => item.portfolioId === itemId || item.bundleId === itemId
      );

      if (itemIndex >= 0) {
        if (newQuantity <= 0) {
          // Remove item if quantity is 0 or less
          cart.items.splice(itemIndex, 1);
          console.log(`Removed item ${itemId} (quantity was ${newQuantity})`);
        } else {
          cart.items[itemIndex].quantity = newQuantity;
          console.log(`Updated item ${itemId} quantity to ${newQuantity}`);
        }
      } else {
        console.warn(`Item ${itemId} not found in cart`);
      }

      this.saveLocalCart(cart);
      return cart;
    } catch (error) {
      console.error("Failed to update local cart quantity:", error);
      throw error;
    }
  }

  // Clear local cart with enhanced error handling
  clearLocalCart(): void {
    try {
      console.log("Clearing local cart");
      
      // Clear from storage
      this.removeFromStorage(CART_STORAGE_KEY);
      this.removeFromStorage(CART_BACKUP_KEY);
      
      // Clear fallback
      this.fallbackCart = { items: [], lastUpdated: new Date().toISOString() };
      
      console.log("Local cart cleared successfully");
    } catch (error) {
      console.error("Failed to clear local cart:", error);
      // Force clear fallback even if storage fails
      this.fallbackCart = { items: [], lastUpdated: new Date().toISOString() };
    }
  }

  // Get local cart item count with error handling
  getLocalCartItemCount(): number {
    try {
      const cart = this.getLocalCart();
      return cart.items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error("Failed to get local cart item count:", error);
      return 0;
    }
  }

  // Check if item is in local cart with error handling
  isInLocalCart(itemId: string): boolean {
    try {
      if (!itemId) return false;
      
      const cart = this.getLocalCart();
      return cart.items.some(
        item => item.portfolioId === itemId || item.bundleId === itemId
      );
    } catch (error) {
      console.error("Failed to check if item is in local cart:", error);
      return false;
    }
  }

  // Get item quantity from local cart with error handling
  getLocalItemQuantity(itemId: string): number {
    try {
      if (!itemId) return 0;
      
      const cart = this.getLocalCart();
      const item = cart.items.find(
        item => item.portfolioId === itemId || item.bundleId === itemId
      );
      return item?.quantity || 0;
    } catch (error) {
      console.error("Failed to get local item quantity:", error);
      return 0;
    }
  }

  // Calculate local cart total for a subscription type with error handling
  calculateLocalCartTotal(subscriptionType: "monthly" | "quarterly" | "yearly"): number {
    try {
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
    } catch (error) {
      console.error("Failed to calculate local cart total:", error);
      return 0;
    }
  }

  // Convert local cart to server cart format for syncing
  convertToServerCartFormat(): Array<{
    portfolioId: string;
    quantity: number;
    itemType?: string;
    subscriptionType?: string;
  }> {
    try {
      const cart = this.getLocalCart();
      return cart.items.map(item => ({
        portfolioId: item.bundleId || item.portfolioId,
        quantity: item.quantity,
        itemType: item.itemType,
        subscriptionType: item.subscriptionType
      }));
    } catch (error) {
      console.error("Failed to convert local cart to server format:", error);
      return [];
    }
  }

  // Check if local cart has any items with error handling
  hasItems(): boolean {
    try {
      const cart = this.getLocalCart();
      return cart.items.length > 0;
    } catch (error) {
      console.error("Failed to check if cart has items:", error);
      return false;
    }
  }

  // Get local cart summary for display with error handling
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
    try {
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
    } catch (error) {
      console.error("Failed to get cart summary:", error);
      return { itemCount: 0, totalValue: 0, items: [] };
    }
  }

  // Get storage status information
  getStorageStatus(): {
    available: boolean;
    size: number;
    backupAvailable: boolean;
  } {
    try {
      const cartData = this.getFromStorage(CART_STORAGE_KEY);
      const backupData = this.getFromStorage(CART_BACKUP_KEY);
      
      return {
        available: this.storageAvailable,
        size: cartData ? cartData.length : 0,
        backupAvailable: !!backupData
      };
    } catch (error) {
      console.error("Failed to get storage status:", error);
      return {
        available: false,
        size: 0,
        backupAvailable: false
      };
    }
  }
}

// Export singleton instance
export const localCartService = LocalCartService.getInstance(); 