import { authService } from "./auth.service";
import { get } from "@/lib/axios";
import { bundleService } from "./bundle.service"; // Import bundleService

export interface UserSubscription {
  _id: string;
  user: string | {
    _id: string;
    username: string;
    email: string;
    [key: string]: any;
  };
  productType: 'Portfolio' | 'Bundle';
  productId: string | {
    _id: string;
    name: string;
    category?: string; // For bundles
    PortfolioCategory?: string; // For portfolios
    [key: string]: any;
  };
  portfolio?: string | {
    _id: string;
    name: string;
    PortfolioCategory?: string;
    [key: string]: any;
  };
  bundle?: {
    _id: string;
    name: string;
    category?: string;
  };
  planType?: "monthly" | "quarterly" | "yearly";
  lastPaidAt?: string | null;
  lastRenewed?: string;
  missedCycles?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionAccess {
  hasBasic: boolean;
  hasPremium: boolean;
  portfolioAccess: string[]; // Array of portfolio IDs
  subscriptionType: 'none' | 'basic' | 'premium' | 'individual';
}

export const subscriptionService = {
  // Cache for subscription data
  _subscriptionCache: null as UserSubscription[] | null,
  _accessCache: null as SubscriptionAccess | null,
  _cacheExpiry: 0,

  // Clear cache
  clearCache: () => {
    subscriptionService._subscriptionCache = null;
    subscriptionService._accessCache = null;
    subscriptionService._cacheExpiry = 0;
    console.log("Subscription cache cleared");
  },

  // Force refresh subscription data
  forceRefresh: async (): Promise<SubscriptionAccess> => {
    subscriptionService.clearCache();
    return await subscriptionService.getSubscriptionAccess();
  },

  // Check what type of plan the user intended to purchase vs what they got
  diagnoseSubscriptionIssue: async (): Promise<void> => {
    try {
      console.log("=== SUBSCRIPTION DIAGNOSIS ===");
      
      const subscriptions = await subscriptionService.getUserSubscriptions(true);
      const access = await subscriptionService.getSubscriptionAccess(true);
      
      console.log("Current Access Status:", access);
      console.log("Raw Subscriptions:", subscriptions);
      
      if (subscriptions.length === 0) {
        console.log("❌ NO SUBSCRIPTIONS FOUND");
        console.log("- User has no active subscriptions");
        console.log("- Check if payment was successful");
        console.log("- Check if subscription was created in backend");
        return;
      }
      
      console.log(`✅ Found ${subscriptions.length} subscription(s)`);
      
      // Analyze subscription types
      const bundleCount = subscriptions.filter(s => s.productType === 'Bundle').length;
      const portfolioCount = subscriptions.filter(s => s.productType === 'Portfolio').length;
      
      console.log(`📊 SUBSCRIPTION BREAKDOWN:`);
      console.log(`- Bundle subscriptions: ${bundleCount}`);
      console.log(`- Portfolio subscriptions: ${portfolioCount}`);
      
      if (bundleCount > 0) {
        console.log("✅ BUNDLE DETECTED - Should have premium access");
      } else if (portfolioCount >= 3) {
        console.log("⚠️ MULTIPLE PORTFOLIOS - Treating as premium");
      } else if (portfolioCount > 0) {
        console.log("ℹ️ INDIVIDUAL PORTFOLIOS - Limited access");
      }
      
      // Check for common issues
      if (access.subscriptionType === 'none' && subscriptions.length > 0) {
        console.log("🐛 BUG DETECTED: Have subscriptions but no access");
        console.log("Possible issues:");
        console.log("- Subscription data format mismatch");
        console.log("- Backend returning different format than expected");
        console.log("- Portfolio ID extraction failing");
      }
      
      if (access.subscriptionType === 'individual' && portfolioCount >= 2) {
        console.log("💡 SUGGESTION: User might expect premium but has individual access");
        console.log("- If user paid for premium plan, subscription type might be wrong");
        console.log("- Consider upgrading to premium based on number of portfolios");
      }
      
      console.log("=== END DIAGNOSIS ===");
    } catch (error) {
      console.error("Diagnosis failed:", error);
    }
  },

  // Debug function to inspect subscription data
  debugSubscriptions: async (): Promise<void> => {
    try {
      const token = authService.getAccessToken();
      console.log("=== SUBSCRIPTION DEBUG ===");
      console.log("Auth token exists:", !!token);
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
      
      if (!token) {
        console.log("No auth token found - user not authenticated");
        return;
      }

      // Test API connectivity first
      try {
        console.log("Testing API connectivity...");
        const testResponse = await get<any>("/api/user/profile", {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API connectivity test successful");
      } catch (testError) {
        console.error("API connectivity test failed:", testError);
      }

      // Make direct API call to see raw response
      console.log("Fetching subscriptions...");
      const response = await get<any>("/api/user/subscriptions", {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Raw API response:", response);
      console.log("Response type:", typeof response);
      console.log("Is array:", Array.isArray(response));
      
      if (Array.isArray(response)) {
        console.log(`Found ${response.length} subscription(s)`);
        response.forEach((sub, index) => {
          console.log(`Subscription ${index + 1}:`, {
            id: sub._id,
            productType: sub.productType,
            productId: sub.productId,
            isActive: sub.isActive,
            bundle: sub.bundle,
            portfolio: sub.portfolio,
            planType: sub.planType,
            lastPaidAt: sub.lastPaidAt,
            createdAt: sub.createdAt,
            missedCycles: sub.missedCycles
          });
        });
      } else {
        console.log("Response is not an array:", response);
      }
      
      console.log("=== END DEBUG ===");
    } catch (error) {
      console.error("Debug subscription error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    }
  },

  // Get user's active subscriptions
  getUserSubscriptions: async (forceRefresh = false): Promise<UserSubscription[]> => {
    try {
      const token = authService.getAccessToken();
      if (!token) return [];

      // Check cache if not forcing refresh
      const now = Date.now();
      if (!forceRefresh && subscriptionService._subscriptionCache && now < subscriptionService._cacheExpiry) {
        console.log("Using cached subscription data");
        return subscriptionService._subscriptionCache;
      }

      console.log("Fetching fresh subscription data from API");
      console.log("API endpoint: /api/user/subscriptions");
      console.log("Auth token (first 10 chars):", token.substring(0, 10) + "...");
      
      const response = await get<UserSubscription[]>("/api/user/subscriptions", {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("API response received:", {
        isArray: Array.isArray(response),
        length: Array.isArray(response) ? response.length : 'N/A',
        data: response
      });
      
      // Cache the response for 1 minute
      subscriptionService._subscriptionCache = response || [];
      subscriptionService._cacheExpiry = now + (60 * 1000);
      
      return response || [];
    } catch (error) {
      console.error("Failed to fetch user subscriptions:", error);
      return [];
    }
  },

  // Check user's subscription access levels
  getSubscriptionAccess: async (forceRefresh = false): Promise<SubscriptionAccess> => {
    try {
      // Check cache if not forcing refresh
      const now = Date.now();
      if (!forceRefresh && subscriptionService._accessCache && now < subscriptionService._cacheExpiry) {
        console.log("Using cached access data");
        return subscriptionService._accessCache;
      }

      const subscriptions = await subscriptionService.getUserSubscriptions(forceRefresh);
      console.log("Raw subscriptions data:", subscriptions);
      
      const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
      console.log("Active subscriptions:", activeSubscriptions);

      let hasBasic = false;
      let hasPremium = false;
      const portfolioAccess: string[] = [];

      for (const subscription of activeSubscriptions) {
        console.log("Processing subscription:", subscription);
        
        if (subscription.productType === 'Bundle') {
          // Extract bundle ID and check for category
          let bundleId: string;
          let bundleCategory: string | undefined;
          
          if (typeof subscription.productId === 'string') {
            bundleId = subscription.productId;
          } else if (subscription.productId && typeof subscription.productId === 'object') {
            bundleId = subscription.productId._id;
            bundleCategory = subscription.productId.category;
          } else {
            console.log("Invalid productId format for bundle subscription:", subscription.productId);
            continue;
          }
          
          // If we already have the category from the subscription object, use it
          if (bundleCategory) {
            if (bundleCategory === 'basic') {
              hasBasic = true;
              console.log("Basic bundle detected from subscription object - granting basic access");
            } else if (bundleCategory === 'premium') {
              hasPremium = true;
              console.log("Premium bundle detected from subscription object - granting premium access");
            }
          } else {
            // Fetch full bundle details to get the category
            const fullBundle = await bundleService.getById(bundleId);
            console.log("Full bundle fetched:", fullBundle); // Add this log

            if (fullBundle) {
              if (fullBundle.category === 'basic') {
                hasBasic = true;
                console.log("Basic bundle detected - granting basic access:", fullBundle.name);
              } else if (fullBundle.category === 'premium') {
                hasPremium = true;
                console.log("Premium bundle detected - granting premium access:", fullBundle.name);
              }
            } else {
              console.log("Could not fetch full bundle details for bundleId:", bundleId);
              // Fallback to name-based check if bundle details can't be fetched
              const bundleName = subscription.bundle?.name?.toLowerCase() || '';
              if (bundleId === 'basic-plan-id' || bundleName.includes('basic')) {
                hasBasic = true; 
                console.log("Basic bundle (fallback) detected - granting basic access");
              } else { // Assume premium if it's a bundle and not explicitly basic
                hasPremium = true;
                console.log("Premium bundle (fallback) detected - granting premium access");
              }
            }
          }
          
        } else if (subscription.productType === 'Portfolio') {
          // Individual portfolio subscription - gives access to specific portfolios
          let portfolioId: string | null = null;
          
          // Extract portfolio ID from various possible locations
          if (typeof subscription.productId === 'string') {
            portfolioId = subscription.productId;
          } else if (subscription.productId && typeof subscription.productId === 'object') {
            portfolioId = subscription.productId._id;
          } else if (typeof subscription.portfolio === 'string') {
            portfolioId = subscription.portfolio;
          } else if (subscription.portfolio?._id) {
            portfolioId = subscription.portfolio._id;
          }
          
          if (portfolioId) {
            portfolioAccess.push(portfolioId);
            console.log("Individual portfolio access added:", portfolioId);
          } else {
            console.log("Could not extract portfolio ID from subscription:", subscription);
          }
        } else {
          // Unknown subscription type - log for debugging
          console.log("Unknown subscription type:", subscription.productType, subscription);
        }
      }

      // Determine subscription type hierarchically
      let subscriptionType: 'none' | 'basic' | 'premium' | 'individual' = 'none';
      if (hasPremium) {
        subscriptionType = 'premium';
      } else if (hasBasic) {
        subscriptionType = 'basic';
      } else if (portfolioAccess.length > 0) {
        subscriptionType = 'individual';
      }

      const accessData = {
        hasBasic,
        hasPremium,
        portfolioAccess: Array.from(new Set(portfolioAccess)), // Remove duplicates
        subscriptionType
      };

      // Cache the access data
      subscriptionService._accessCache = accessData;
      console.log("Subscription access computed:", accessData);

      return accessData;
    } catch (error) {
      console.error("Failed to get subscription access:", error);
      return {
        hasBasic: false,
        hasPremium: false,
        portfolioAccess: [],
        subscriptionType: 'none'
      };
    }
  },

  // Check if user has access to a specific portfolio
  hasPortfolioAccess: async (portfolioId: string): Promise<boolean> => {
    try {
      const access = await subscriptionService.getSubscriptionAccess();
      
      // Premium users have access to all portfolios
      if (access.hasPremium) return true;
      
      // Check individual portfolio access
      return access.portfolioAccess.includes(portfolioId);
    } catch (error) {
      console.error("Failed to check portfolio access:", error);
      return false;
    }
  },

  // Check if user can access basic features
  hasBasicAccess: async (): Promise<boolean> => {
    try {
      const access = await subscriptionService.getSubscriptionAccess();
      return access.hasBasic || access.hasPremium;
    } catch (error) {
      console.error("Failed to check basic access:", error);
      return false;
    }
  },

  // Check if user can access premium features
  hasPremiumAccess: async (): Promise<boolean> => {
    try {
      const access = await subscriptionService.getSubscriptionAccess();
      return access.hasPremium;
    } catch (error) {
      console.error("Failed to check premium access:", error);
      return false;
    }
  }
};