import { authService } from "./auth.service";
import { get, post } from "@/lib/axios";
import { bundleService } from "./bundle.service";

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
    category?: string;
    PortfolioCategory?: string;
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
  subscriptionType?: "regular" | "yearlyEmandate";
  eMandateId?: string;
  bundleId?: string;
  lastPaidAt?: string | null;
  lastRenewed?: string;
  missedCycles?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
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

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  planType: string;
}

export interface CreateEmandateResponse {
  success: boolean;
  commitmentEndDate: string;
  setupUrl: string;
  subscriptionId: string;
  amount: number;
  yearlyAmount: number;
  customer_id: string;
  currency: string;
  planType: string;
  message: string;
  cleanupPerformed?: boolean;
}

export interface VerifyEmandateResponse {
  success: boolean;
  message: string;
  subscriptionStatus?: string;
  activatedSubscriptions?: number;
  currentStatus?: string;
  subscriptionsFound?: number;
  nextSteps?: string;
  subscriptionDetails?: {
    id: string;
    status: string;
    productType: string;
    productId: string;
  };
}

export const subscriptionService = {
  // Cache for subscription data
  _subscriptionCache: null as UserSubscription[] | null,
  _accessCache: null as SubscriptionAccess | null,
  _cacheExpiry: 0,
  _currentEmandateId: null as string | null,

  // Clear cache
  clearCache: () => {
    subscriptionService._subscriptionCache = null;
    subscriptionService._accessCache = null;
    subscriptionService._cacheExpiry = 0;
    console.log("Subscription cache cleared");
  },

  // Store current eMandate ID for verification
  setCurrentEmandateId: (emandateId: string) => {
    subscriptionService._currentEmandateId = emandateId;
    localStorage.setItem('currentEmandateId', emandateId);
  },

  // Get current eMandate ID
  getCurrentEmandateId: (): string | null => {
    if (subscriptionService._currentEmandateId) {
      return subscriptionService._currentEmandateId;
    }
    return localStorage.getItem('currentEmandateId');
  },

  // Clear current eMandate ID
  clearCurrentEmandateId: () => {
    subscriptionService._currentEmandateId = null;
    localStorage.removeItem('currentEmandateId');
  },

  // Force refresh subscription data
  forceRefresh: async (): Promise<SubscriptionAccess> => {
    subscriptionService.clearCache();
    return await subscriptionService.getSubscriptionAccess();
  },

  // Create regular order (one-time payment)
  createOrder: async (productType: string, productId: string, planType: string = "monthly"): Promise<CreateOrderResponse> => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error("Not authenticated");

      console.log("Creating one-time payment order:", { productType, productId, planType });

      const response = await post<CreateOrderResponse>("/api/subscriptions/order", {
        productType,
        productId,
        planType
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Order created successfully:", response);
      return response;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  // Create eMandate for yearly subscriptions (subscription-based payments)
  createEmandate: async (productType: string, productId: string): Promise<CreateEmandateResponse> => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error("Not authenticated");

      console.log("Creating eMandate:", { productType, productId });

      // Clear any existing eMandate ID before creating new one
      subscriptionService.clearCurrentEmandateId();

      const response = await post<CreateEmandateResponse>("/api/subscriptions/emandate", {
        productType,
        productId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("eMandate created successfully:", response);

      // Store the subscription ID for later verification
      if (response.subscriptionId) {
        subscriptionService.setCurrentEmandateId(response.subscriptionId);
      }

      // Clear subscription cache since new subscription might be created
      subscriptionService.clearCache();

      return response;
    } catch (error) {
      console.error("Failed to create eMandate:", error);
      throw error;
    }
  },

  // Verify eMandate authentication (subscription-based)
  verifyEmandate: async (subscriptionId?: string): Promise<VerifyEmandateResponse> => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const idToVerify = subscriptionId || subscriptionService.getCurrentEmandateId();
      if (!idToVerify) throw new Error("No subscription ID available for verification");

      console.log("Verifying eMandate:", idToVerify);

      const response = await post<VerifyEmandateResponse>("/api/subscriptions/emandate/verify", {
        subscription_id: idToVerify
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("eMandate verification response:", response);

      // If successfully authenticated, clear the stored ID and refresh cache
      if (response.success) {
        subscriptionService.clearCurrentEmandateId();
        subscriptionService.clearCache();
      }

      return response;
    } catch (error) {
      console.error("Failed to verify eMandate:", error);
      throw error;
    }
  },

  // Verify regular payment (one-time payment)
  verifyPayment: async (paymentId: string, orderId: string, signature: string): Promise<any> => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error("Not authenticated");

      console.log("Verifying one-time payment:", { paymentId, orderId });

      const response = await post("/api/subscriptions/verify", {
        paymentId,
        orderId,
        signature
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Payment verified successfully:", response);

      // Clear subscription cache to fetch updated data
      subscriptionService.clearCache();

      return response;
    } catch (error) {
      console.error("Failed to verify payment:", error);
      throw error;
    }
  },

  // Clean up orphaned subscriptions
  cleanupOrphanedSubscriptions: async (): Promise<any> => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error("Not authenticated");

      console.log("Cleaning up orphaned subscriptions");

      const response = await post("/api/subscriptions/cleanup-orphaned", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Cleanup completed:", response);

      // Clear cache after cleanup
      subscriptionService.clearCache();

      return response;
    } catch (error) {
      console.error("Failed to cleanup orphaned subscriptions:", error);
      throw error;
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
        
        // Check if there's a pending eMandate
        const currentEmandateId = subscriptionService.getCurrentEmandateId();
        if (currentEmandateId) {
          console.log("⚠️ Found pending eMandate ID:", currentEmandateId);
          console.log("- Try verifying this eMandate");
        }
        return;
      }
      
      console.log(`✅ Found ${subscriptions.length} subscription(s)`);
      
      // Analyze subscription types
      const bundleCount = subscriptions.filter(s => s.productType === 'Bundle').length;
      const portfolioCount = subscriptions.filter(s => s.productType === 'Portfolio').length;
      const emandateCount = subscriptions.filter(s => s.subscriptionType === 'yearlyEmandate').length;
      const activeCount = subscriptions.filter(s => s.isActive).length;
      
      console.log(`📊 SUBSCRIPTION BREAKDOWN:`);
      console.log(`- Bundle subscriptions: ${bundleCount}`);
      console.log(`- Portfolio subscriptions: ${portfolioCount}`);
      console.log(`- eMandate subscriptions: ${emandateCount}`);
      console.log(`- Active subscriptions: ${activeCount}`);
      
      // Check for eMandate issues
      const pendingEmandates = subscriptions.filter(s => 
        s.subscriptionType === 'yearlyEmandate' && !s.isActive
      );
      
      if (pendingEmandates.length > 0) {
        console.log("⚠️ PENDING eMANDATE SUBSCRIPTIONS FOUND:");
        pendingEmandates.forEach(sub => {
          console.log(`- ID: ${sub._id}, eMandateId: ${sub.eMandateId}, Created: ${sub.createdAt}`);
        });
        console.log("💡 Try verifying these eMandates or clean up orphaned subscriptions");
      }
      
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
        console.log("- Subscriptions are inactive");
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
      console.log("Current eMandate ID:", subscriptionService.getCurrentEmandateId());
      
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
            subscriptionType: sub.subscriptionType,
            eMandateId: sub.eMandateId,
            bundleId: sub.bundleId,
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

  // Get user's active subscriptions with better error handling
  getUserSubscriptions: async (forceRefresh = false): Promise<UserSubscription[]> => {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        console.log("No auth token - returning empty subscriptions");
        return [];
      }

      // Check cache if not forcing refresh
      const now = Date.now();
      if (!forceRefresh && subscriptionService._subscriptionCache && now < subscriptionService._cacheExpiry) {
        console.log("Using cached subscription data");
        return subscriptionService._subscriptionCache;
      }

      console.log("Fetching fresh subscription data from API");
      console.log("API endpoint: /api/user/subscriptions");
      console.log("Auth token (first 10 chars):", token.substring(0, 10) + "...");
      
      // Try the user subscriptions endpoint first
      let response: UserSubscription[] = [];
      
      try {
        response = await get<UserSubscription[]>("/api/user/subscriptions", {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (userSubError) {
        console.log("User subscriptions endpoint failed, trying alternative endpoint");
        
        // Try alternative endpoint that might return subscription data differently
        try {
          const altResponse = await get<any>("/api/subscriptions/user-subscriptions", {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
          // Handle different response formats
          if (altResponse?.bundleSubscriptions || altResponse?.individualSubscriptions) {
            response = [
              ...(altResponse.bundleSubscriptions || []),
              ...(altResponse.individualSubscriptions || [])
            ];
          } else if (Array.isArray(altResponse)) {
            response = altResponse;
          }
        } catch (altError) {
          console.error("Alternative subscription endpoint also failed:", altError);
          throw userSubError; // Throw the original error
        }
      }
      
      console.log("API response received:", {
        isArray: Array.isArray(response),
        length: Array.isArray(response) ? response.length : 'N/A',
        data: response
      });
      
      // Ensure response is an array
      const subscriptions = Array.isArray(response) ? response : [];
      
      // Cache the response for 1 minute
      subscriptionService._subscriptionCache = subscriptions;
      subscriptionService._cacheExpiry = now + (60 * 1000);
      
      return subscriptions;
    } catch (error) {
      console.error("Failed to fetch user subscriptions:", error);
      return [];
    }
  },

  // Check user's subscription access levels with enhanced logic
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
            try {
              const fullBundle = await bundleService.getById(bundleId);
              console.log("Full bundle fetched:", fullBundle);

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
                // Fallback: assume premium for unknown bundles
                hasPremium = true;
                console.log("Unknown bundle - defaulting to premium access");
              }
            } catch (bundleError) {
              console.error("Error fetching bundle details:", bundleError);
              // Fallback: assume premium for bundle subscription errors
              hasPremium = true;
              console.log("Bundle fetch error - defaulting to premium access");
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
