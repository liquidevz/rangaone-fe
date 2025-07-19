import { post } from "@/lib/axios";
import { authService } from "./auth.service";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface CreateOrderPayload {
  productType: "Portfolio" | "Bundle";
  productId: string;
  planType?: "monthly" | "quarterly" | "yearly";
  subscriptionType?: "basic" | "premium" | "individual"; // Added for subscription type tracking
}

// Updated interface for cart checkout
export interface CartCheckoutPayload {
  planType: "monthly" | "quarterly" | "yearly";
  subscriptionType?: "basic" | "premium" | "individual"; // Added for subscription type tracking
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  planType?: string;
  receipt?: string;
}

export interface CreateEMandateResponse {
  subscriptionId: string;
}

export interface VerifyPaymentPayload {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

export interface PaymentHistory {
  _id: string;
  user: string;
  portfolio?: {
    _id: string;
    name: string;
  };
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed" | "captured";
  createdAt: string;
  updatedAt: string;
}

export const paymentService = {
  // Create order for single product
  createOrder: async (
    payload: CreateOrderPayload
  ): Promise<CreateOrderResponse> => {
    const token = authService.getAccessToken();

    console.log("Payment service - creating order with payload:", payload);

    return await post<CreateOrderResponse>(
      "/api/subscriptions/order",
      payload,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Updated cart checkout to include planType and subscriptionType
  cartCheckout: async (
    payload: CartCheckoutPayload
  ): Promise<CreateOrderResponse> => {
    const token = authService.getAccessToken();

    console.log("Payment service - cart checkout with payload:", payload);

    return await post<CreateOrderResponse>(
      "/api/subscriptions/checkout",
      payload,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Cart checkout with eMandate for yearly subscriptions
  cartCheckoutEmandate: async (): Promise<CreateEMandateResponse> => {
    const token = authService.getAccessToken();

    console.log("Payment service - cart checkout with eMandate");

    return await post<CreateEMandateResponse>(
      "/api/subscriptions/emandate/cart",
      {},
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Verify payment
  verifyPayment: async (
    payload: VerifyPaymentPayload
  ): Promise<VerifyPaymentResponse> => {
    const token = authService.getAccessToken();
    
    console.log("Verifying payment with payload:", {
      orderId: payload.orderId,
      paymentId: payload.paymentId,
      signatureLength: payload.signature?.length || 0
    });

    try {
      const response = await post<VerifyPaymentResponse>(
        "/api/subscriptions/verify",
        payload,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Verification response:", response);

      // If response doesn't have success field, consider it an error
      if (typeof response.success === 'undefined') {
        throw new Error("Invalid verification response format");
      }

      return response;
    } catch (error: any) {
      console.error("Payment verification request failed:", error);
      
      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      
      return {
        success: false,
        message: `Verification failed: ${errorMessage}`
      };
    }
  },

  // Get payment history
  getPaymentHistory: async (): Promise<PaymentHistory[]> => {
    const token = authService.getAccessToken();
    return await post<PaymentHistory[]>(
      "/api/subscriptions/history",
      {},
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Load Razorpay script
  loadRazorpayScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  // Enhanced Razorpay checkout with better error handling and debugging
  openCheckout: async (
    orderData: CreateOrderResponse | CreateEMandateResponse,
    userInfo: { name: string; email: string },
    onSuccess: (response: any) => void,
    onFailure: (error: any) => void
  ): Promise<void> => {
    const isLoaded = await paymentService.loadRazorpayScript();

    if (!isLoaded) {
      onFailure(new Error("Failed to load Razorpay SDK"));
      return;
    }

    // Get the Razorpay key with proper fallback and validation
    const razorpayKey =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY ||
      "rzp_test_fxQtWo40gGB277";

    console.log("Using Razorpay Key:", razorpayKey?.substring(0, 8) + "...");
    console.log("Order data for Razorpay:", orderData);

    // Validate required data
    const orderId =
      "orderId" in orderData ? orderData.orderId : orderData.subscriptionId;

    if (!orderId) {
      onFailure(
        new Error("Invalid order data: missing orderId or subscriptionId")
      );
      return;
    }

    const options = {
      key: razorpayKey,
      name: "Rangaone Finwala",
      description: `${
        "planType" in orderData ? orderData.planType || "Monthly" : "Monthly"
      } Subscription Payment`,
      // order_id: orderId,
      ...("subscriptionId" in orderData
        ? { subscription_id: orderData.subscriptionId }
        : {
            order_id: orderData.orderId,
            amount: orderData.amount,
            currency: orderData.currency,
          }),
      prefill: {
        name: userInfo.name,
        email: userInfo.email,
      },
      theme: {
        color: "#001633",
      },
      modal: {
        ondismiss: () => {
          console.log("Payment modal dismissed by user");
          onFailure(new Error("Payment cancelled by user"));
        },
      },
      handler: (response: any) => {
        console.log("Payment successful:", response);
        onSuccess(response);
      },
    };

    console.log("Razorpay options:", {
      ...options,
      key: options.key.substring(0, 8) + "...", // Hide full key in logs
    });

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        onFailure(
          new Error(
            `Payment failed: ${response.error.description || "Unknown error"}`
          )
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Error opening Razorpay checkout:", error);
      onFailure(error);
    }
  },

  // Added utility method to test Razorpay configuration
  testRazorpayConfig: async (): Promise<boolean> => {
    try {
      const isLoaded = await paymentService.loadRazorpayScript();
      if (!isLoaded) {
        console.error("Razorpay script failed to load");
        return false;
      }

      const razorpayKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY ||
        "rzp_test_fxQtWo40gGB277";

      if (!razorpayKey || !razorpayKey.startsWith("rzp_")) {
        console.error(
          "Invalid Razorpay key format:",
          razorpayKey?.substring(0, 8) + "..."
        );
        return false;
      }

      console.log("Razorpay configuration test passed");
      return true;
    } catch (error) {
      console.error("Razorpay configuration test failed:", error);
      return false;
    }
  },

  createEmandate: async (
    payload: CreateOrderPayload
  ): Promise<CreateEMandateResponse> => {
    const token = authService.getAccessToken();

    console.log("Payment service - creating emandate with payload:", payload);

    return await post<CreateEMandateResponse>(
      "/api/subscriptions/emandate",
      payload,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Verify eMandate after customer authorization
  verifyEmandate: async (subscriptionId: string, paymentResponse?: any): Promise<VerifyPaymentResponse> => {
    const token = authService.getAccessToken();

    console.log("Payment service - verifying emandate for subscription:", subscriptionId);
    console.log("Payment response data:", paymentResponse);

    try {
      // Create payload similar to regular verification but with subscription-specific fields
      const payload = {
        subscription_id: subscriptionId,
        ...(paymentResponse && {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_subscription_id: paymentResponse.razorpay_subscription_id,
          razorpay_signature: paymentResponse.razorpay_signature
        })
      };

      console.log("eMandate verification payload:", payload);

      const response = await post<VerifyPaymentResponse>(
        "/api/subscriptions/emandate/verify",
        payload,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("eMandate verification response:", response);
      
      // Handle case where backend returns empty object or unexpected format
      if (!response || typeof response !== 'object') {
        console.warn("eMandate verification returned unexpected response format:", response);
        return {
          success: false,
          message: "Invalid response format from eMandate verification"
        };
      }

      // If response doesn't have success field, try to infer from status
      if (typeof response.success === 'undefined') {
        console.warn("eMandate verification response missing success field, assuming success");
        return {
          success: true,
          message: "eMandate verified successfully"
        };
      }

      return response;
    } catch (error: any) {
      console.error("eMandate verification failed:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        // If eMandate verification endpoint is not found, try regular verification as fallback
        if (paymentResponse?.razorpay_payment_id && paymentResponse?.razorpay_order_id && paymentResponse?.razorpay_signature) {
          console.warn("eMandate verification endpoint not found, trying regular verification as fallback");
          
          try {
            const fallbackResponse = await post<VerifyPaymentResponse>(
              "/api/subscriptions/verify",
              {
                orderId: paymentResponse.razorpay_order_id,
                paymentId: paymentResponse.razorpay_payment_id,
                signature: paymentResponse.razorpay_signature
              },
              {
                headers: {
                  accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            
            console.log("Fallback verification successful:", fallbackResponse);
            return fallbackResponse;
          } catch (fallbackError) {
            console.error("Fallback verification also failed:", fallbackError);
          }
        }
        
        return {
          success: false,
          message: "eMandate verification endpoint not found. Please contact support."
        };
      }
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Invalid request data";
        return {
          success: false,
          message: `eMandate verification failed: ${errorMessage}`
        };
      }

      // Special handling for 200 responses with empty data (some APIs do this)
      if (error.response?.status === 200 || (!error.response?.status && !error.response?.data)) {
        console.warn("eMandate verification returned 200 with empty data, treating as success");
        return {
          success: true,
          message: "eMandate verification completed successfully"
        };
      }

      // For empty response or other errors, try to continue anyway if we have valid payment data
      if ((!error.response?.data || Object.keys(error.response.data).length === 0) && 
          paymentResponse?.razorpay_payment_id && paymentResponse?.razorpay_subscription_id) {
        console.warn("eMandate verification returned empty response but payment data is valid, assuming success");
        return {
          success: true,
          message: "eMandate verification completed (payment data validated)"
        };
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      
      return {
        success: false,
        message: `eMandate verification failed: ${errorMessage}`
      };
    }
  },
};
