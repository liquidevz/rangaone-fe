import { authService } from "./auth.service";
import { get, post } from "@/lib/axios";
import { bundleService } from "./bundle.service";

// Interface definitions
interface UserSubscription {
  _id: string;
  user: string | { _id: string; username: string; email: string; [key: string]: any };
  productType: 'Portfolio' | 'Bundle';
  productId: string | { _id: string; name: string; category?: string; [key: string]: any };
  portfolio?: string | { _id: string; name: string; [key: string]: any };
  bundle?: { _id: string; name: string; category?: string };
  planType?: "monthly" | "quarterly" | "yearly";
  subscriptionType?: "regular" | "yearlyEmandate";
  eMandateId?: string;
  bundleId?: string;
  lastPaidAt?: string | null;
  isActive: boolean;
  expiryDate?: string;
  commitmentEndDate?: string;
  monthlyAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionAccess {
  hasBasic: boolean;
  hasPremium: boolean;
  portfolioAccess: string[];
  subscriptionType: 'none' | 'basic' | 'premium' | 'individual';
}

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  planType: string;
}

interface CreateEmandateResponse {
  success: boolean;
  commitmentEndDate: string;
  setupUrl: string;
  subscriptionId: string;
  amount: number;
  yearlyAmount: number;
  customerId: string;
  currency: string;
  nextSteps: string;
  status: string;
}

interface VerifyEmandateResponse {
  success: boolean;
  message: string;
  subscriptionStatus?: string;
  activatedSubscriptions?: number;
  nextSteps?: string;
}

// Service implementation
export const subscriptionService = {
  _subscriptionCache: null as UserSubscription[] | null,
  _accessCache: null as SubscriptionAccess | null,
  _cacheExpiry: 0,
  _currentEmandateId: null as string | null,

  clearCache() {
    this._subscriptionCache = null;
    this._accessCache = null;
    this._cacheExpiry = 0;
  },

  setCurrentEmandateId(emandateId: string) {
    this._currentEmandateId = emandateId;
    localStorage.setItem('currentEmandateId', emandateId);
  },

  getCurrentEmandateId(): string | null {
    return this._currentEmandateId || localStorage.getItem('currentEmandateId');
  },

  clearCurrentEmandateId() {
    this._currentEmandateId = null;
    localStorage.removeItem('currentEmandateId');
  },

  async forceRefresh(): Promise<SubscriptionAccess> {
    this.clearCache();
    return this.getSubscriptionAccess();
  },

  async createOrder(productType: string, productId: string, planType: string = "monthly"): Promise<CreateOrderResponse> {
    const token = authService.getAccessToken();
    if (!token) throw new Error("Authentication required");
    
    try {
      return await post<CreateOrderResponse>("/api/subscriptions/order", {
        productType, productId, planType
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      console.error("Order creation failed", error);
      throw error;
    }
  },

  async createEmandate(productType: string, productId: string): Promise<CreateEmandateResponse> {
    const token = authService.getAccessToken();
    if (!token) throw new Error("Authentication required");
    this.clearCurrentEmandateId();

    try {
      const response = await post<CreateEmandateResponse>("/api/subscriptions/emandate", {
        productType, productId
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (response.subscriptionId) {
        this.setCurrentEmandateId(response.subscriptionId);
      }

      this.clearCache();
      return response;
    } catch (error) {
      console.error("eMandate creation failed", error);
      throw error;
    }
  },

  verifyEmandate: async (
    subscriptionId?: string,
    polling: boolean = true
  ): Promise<VerifyEmandateResponse> => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const idToVerify = subscriptionId || subscriptionService.getCurrentEmandateId();
      if (!idToVerify) throw new Error("No subscription ID available for verification");

      // Configuration
      const POLL_INTERVAL = 5000; // 5 seconds
      const MAX_POLL_DURATION = 300000; // 5 minutes
      const MAX_ATTEMPTS = MAX_POLL_DURATION / POLL_INTERVAL;

      let attempts = 0;
      let response: VerifyEmandateResponse;

      const makeVerificationRequest = async (): Promise<VerifyEmandateResponse> => {
        return await post<VerifyEmandateResponse>("/api/subscriptions/emandate/verify", {
          subscription_id: idToVerify
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      };

      // Initial request
      response = await makeVerificationRequest();

      // Polling logic
      if (polling && response.subscriptionStatus === "pending" || 
          response.subscriptionStatus === "created") {
        
        const poll = async (): Promise<VerifyEmandateResponse> => {
          while (attempts < MAX_ATTEMPTS) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
            
            try {
              response = await makeVerificationRequest();
              
              // Exit conditions
              if (response.subscriptionStatus === "active" || 
                  response.subscriptionStatus === "authenticated") {
                return response;
              }
            } catch (error) {
              console.warn(`Polling attempt ${attempts} failed, retrying...`, error);
            }
          }
          
          // Timeout handling
          return {
            success: false,
            message: "Verification timed out",
            subscriptionStatus: "timeout"
          };
        };

        return await poll();
      }

      return response;
    } catch (error) {
      console.error("eMandate verification failed:", error);
      throw error;
    }
  },

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<any> {
    const token = authService.getAccessToken();
    if (!token) throw new Error("Authentication required");

    try {
      const response = await post("/api/subscriptions/verify", {
        paymentId, orderId, signature
      }, { headers: { Authorization: `Bearer ${token}` } });

      this.clearCache();
      return response;
    } catch (error) {
      console.error("Payment verification failed", error);
      throw error;
    }
  },

  async cleanupOrphanedSubscriptions(): Promise<any> {
    const token = authService.getAccessToken();
    if (!token) throw new Error("Authentication required");

    try {
      const response = await post("/api/subscriptions/cleanup-orphaned", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.clearCache();
      return response;
    } catch (error) {
      console.error("Cleanup failed", error);
      throw error;
    }
  },

  async getUserSubscriptions(forceRefresh = false): Promise<UserSubscription[]> {
    const token = authService.getAccessToken();
    if (!token) return [];

    const now = Date.now();
    if (!forceRefresh && this._subscriptionCache && now < this._cacheExpiry) {
      return this._subscriptionCache;
    }

    try {
      let response: any;
      try {
        response = await get("/api/user/subscriptions", {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        // Fallback to alternative endpoint
        response = await get("/api/subscriptions/user-subscriptions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        response = response.bundleSubscriptions 
          ? [...response.bundleSubscriptions, ...response.individualSubscriptions] 
          : response;
      }

      // Normalize response to array
      const subscriptions = Array.isArray(response) ? response : [];
      
      this._subscriptionCache = subscriptions;
      this._cacheExpiry = now + 60000; // 1 minute cache
      return subscriptions;
    } catch (error) {
      console.error("Failed to fetch subscriptions", error);
      return [];
    }
  },

  async getSubscriptionAccess(forceRefresh = false): Promise<SubscriptionAccess> {
    const now = Date.now();
    if (!forceRefresh && this._accessCache && now < this._cacheExpiry) {
      return this._accessCache;
    }

    const subscriptions = await this.getUserSubscriptions(forceRefresh);
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);

    let hasBasic = false;
    let hasPremium = false;
    const portfolioAccess: string[] = [];

    for (const sub of activeSubscriptions) {
      console.log('🔍 Processing subscription:', sub);
      
      // Check if this is an eMandate subscription (premium by default)
      if (sub.subscriptionType === 'yearlyEmandate' || sub.eMandateId) {
        console.log('✅ Found eMandate subscription - granting premium access');
        hasPremium = true;
        continue;
      }
      
      if (sub.productType === 'Bundle') {
        let category = (sub as any).bundleCategory;
        
        if (!category && typeof sub.productId === 'object') {
          category = (sub.productId as any).category;
        }
        
        if (!category) {
          const bundleId = typeof sub.productId === 'string' 
            ? sub.productId 
            : (sub.productId as any)?._id;
          if (bundleId) {
            try {
              const bundle = await bundleService.getById(bundleId);
              category = bundle?.category;
            } catch (error) {
              console.error(`Bundle fetch failed: ${bundleId}`, error);
            }
          }
        }
        
        console.log('📦 Bundle category:', category);
        if (category === 'basic') hasBasic = true;
        else if (category === 'premium') hasPremium = true;
        else hasPremium = true; // Default to premium
      } 
      else if (sub.productType === 'Portfolio') {
        let portfolioId: string | undefined;  
        if (typeof sub.portfolio === 'string') portfolioId = sub.portfolio;
        else if (typeof sub.portfolio === 'object') portfolioId = (sub.portfolio as any)?._id;
        else if (typeof sub.productId === 'string') portfolioId = sub.productId;
        else if (typeof sub.productId === 'object') portfolioId = (sub.productId as any)?._id;
        
        if (portfolioId) portfolioAccess.push(portfolioId);
      }
    }

    const subscriptionType: 'none' | 'basic' | 'premium' | 'individual' = 
      hasPremium ? 'premium' :
      hasBasic ? 'basic' :
      portfolioAccess.length ? 'individual' : 'none';

    const accessData: SubscriptionAccess = {
      hasBasic,
      hasPremium,
      portfolioAccess: Array.from(new Set(portfolioAccess)),
      subscriptionType
    };

    console.log('🎯 Final access data:', accessData);
    this._accessCache = accessData;
    return accessData;
  },

  async hasPortfolioAccess(portfolioId: string): Promise<boolean> {
    const access = await this.getSubscriptionAccess();
    return access.hasPremium || access.portfolioAccess.includes(portfolioId);
  },

  async hasBasicAccess(): Promise<boolean> {
    const access = await this.getSubscriptionAccess();
    return access.hasBasic || access.hasPremium;
  },

  async hasPremiumAccess(): Promise<boolean> {
    const access = await this.getSubscriptionAccess();
    return access.hasPremium;
  },

  // Check if user can access tips (requires premium subscription)
  async canAccessTips(): Promise<boolean> {
    return await this.hasPremiumAccess();
  },

  // Debug method to check subscription status and tips access
  async debugSubscriptionAccess(): Promise<{
    subscriptions: UserSubscription[];
    access: SubscriptionAccess;
    canAccessTips: boolean;
    canAccessPremiumTips: boolean;
  }> {
    const subscriptions = await this.getUserSubscriptions(true);
    const access = await this.getSubscriptionAccess(true);
    const canAccessTips = await this.canAccessTips();
    const canAccessPremiumTips = await this.hasPremiumAccess();
    
    console.log('🔍 Subscription Debug Info:', {
      subscriptions,
      access,
      canAccessTips,
      canAccessPremiumTips
    });
    
    return {
      subscriptions,
      access,
      canAccessTips,
      canAccessPremiumTips
    };
  },

  // Force refresh subscription data after payment
  async refreshAfterPayment(): Promise<void> {
    console.log('🔄 Refreshing subscription data after payment...');
    this.clearCache();
    // Force fresh fetch
    await this.getUserSubscriptions(true);
    await this.getSubscriptionAccess(true);
    console.log('✅ Subscription data refreshed');
  }
};

