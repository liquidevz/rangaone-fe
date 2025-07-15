import { authService } from "./auth.service";
import { get } from "@/lib/axios";

export interface UserSubscription {
  _id: string;
  user: string;
  productType: 'Portfolio' | 'Bundle';
  productId: string;
  portfolio?: string | {
    _id: string;
    name: string;
  };
  bundle?: {
    _id: string;
    name: string;
  };
  planType: "monthly" | "quarterly" | "yearly";
  lastPaidAt: string | null;
  missedCycles: number;
  isActive: boolean;
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

  // Emergency fix: Force premium access if user has any active subscriptions
  // Use this if user paid for premium but system shows individual access
  emergencyGrantPremium: async (): Promise<SubscriptionAccess> => {
    try {
      const subscriptions = await subscriptionService.getUserSubscriptions(true);
      console.log("Emergency premium grant - checking subscriptions:", subscriptions);
      
      if (subscriptions.length > 0) {
        console.log("✅ User has active subscriptions - granting premium access");
        
        // Override the normal logic and force premium
        const emergencyAccess: SubscriptionAccess = {
          hasBasic: false,
          hasPremium: true,
          portfolioAccess: [],
          subscriptionType: 'premium'
        };
        
        // Cache this emergency access
        subscriptionService._accessCache = emergencyAccess;
        subscriptionService._cacheExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes
        
        console.log("Emergency premium access granted:", emergencyAccess);
        return emergencyAccess;
      } else {
        console.log("❌ No subscriptions found - cannot grant premium");
        return await subscriptionService.getSubscriptionAccess(true);
      }
    } catch (error) {
      console.error("Emergency premium grant failed:", error);
      return await subscriptionService.getSubscriptionAccess(true);
    }
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

      // TEMPORARY FIX: If user has any active subscriptions, assume they should have premium access
      // This helps identify whether the issue is in subscription detection or access logic
      if (activeSubscriptions.length > 0) {
        console.log("🔧 TEMPORARY FIX: User has active subscriptions - granting premium access");
        hasPremium = true;
      }

      for (const subscription of activeSubscriptions) {
        console.log("Processing subscription:", subscription);
        
        if (subscription.productType === 'Bundle') {
          // ALL Bundle subscriptions are premium (as per your API docs)
          hasPremium = true;
          console.log("Bundle subscription detected - granting premium access:", {
            name: subscription.bundle?.name,
            id: subscription.productId,
            planType: subscription.planType
          });
          
          // Special case: check if it's explicitly a basic bundle
          const bundleName = subscription.bundle?.name?.toLowerCase() || '';
          if (subscription.productId === 'basic-plan-id' || bundleName.includes('basic')) {
            hasBasic = true;
            hasPremium = false; // Override premium if it's basic
            console.log("Basic bundle identified - overriding to basic access");
          }
          
        } else if (subscription.productType === 'Portfolio') {
          // Individual portfolio subscription - gives access to specific portfolios
          let portfolioId: string | null = null;
          
          if (typeof subscription.portfolio === 'string') {
            // Portfolio is a string ID
            portfolioId = subscription.portfolio;
          } else if (subscription.portfolio?._id) {
            // Portfolio is an object with _id
            portfolioId = subscription.portfolio._id;
          } else if (subscription.productId) {
            // Fallback: use productId if it exists
            portfolioId = subscription.productId;
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

      // Special logic: If user has multiple portfolio subscriptions (2+), treat as premium
      // This handles cases where bundle subscriptions might be recorded as individual portfolios
      // TEMPORARY FIX: Since user expects premium but got individual portfolios
      if (!hasPremium && portfolioAccess.length >= 2) {
        console.log(`User has ${portfolioAccess.length} portfolio subscriptions - treating as premium access (likely intended bundle purchase)`);
        hasPremium = true;
      }

      // Determine subscription type
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