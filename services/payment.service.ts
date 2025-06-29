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
}

// Updated interface for cart checkout
export interface CartCheckoutPayload {
  planType: "monthly" | "quarterly" | "yearly";
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  planType?: string;
  receipt?: string;
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
  createOrder: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    const token = authService.getAccessToken();
    
    console.log("Payment service - creating order with payload:", payload);
    
    return await post<CreateOrderResponse>("/api/subscriptions/order", payload, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },



  // Updated cart checkout to include planType
  cartCheckout: async (planType: "monthly" | "quarterly" | "yearly" = "monthly"): Promise<CreateOrderResponse> => {
    const token = authService.getAccessToken();
    
    console.log("Payment service - cart checkout with planType:", planType);
    
    const payload: CartCheckoutPayload = {
      planType
    };
    
    return await post<CreateOrderResponse>("/api/subscriptions/checkout", payload, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Verify payment
  verifyPayment: async (payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
    const token = authService.getAccessToken();
    return await post<VerifyPaymentResponse>("/api/subscriptions/verify", payload, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get payment history
  getPaymentHistory: async (): Promise<PaymentHistory[]> => {
    const token = authService.getAccessToken();
    return await post<PaymentHistory[]>("/api/subscriptions/history", {}, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
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
    orderData: CreateOrderResponse,
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
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 
                       process.env.NEXT_PUBLIC_RAZORPAY_KEY || 
                       'rzp_test_fxQtWo40gGB277';

    console.log("Using Razorpay Key:", razorpayKey?.substring(0, 8) + '...');
    console.log("Order data for Razorpay:", orderData);

    // Validate required data
    if (!orderData.orderId || !orderData.amount) {
      onFailure(new Error("Invalid order data: missing orderId or amount"));
      return;
    }

    const options = {
      key: razorpayKey,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: "Rangaone Finwala",
      description: `${orderData.planType || 'Monthly'} Subscription Payment`,
      order_id: orderData.orderId,
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
      key: options.key.substring(0, 8) + '...' // Hide full key in logs
    });

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error);
        onFailure(new Error(`Payment failed: ${response.error.description || 'Unknown error'}`));
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

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 
                         process.env.NEXT_PUBLIC_RAZORPAY_KEY || 
                         'rzp_test_fxQtWo40gGB277';

      if (!razorpayKey || !razorpayKey.startsWith('rzp_')) {
        console.error("Invalid Razorpay key format:", razorpayKey?.substring(0, 8) + '...');
        return false;
      }

      console.log("Razorpay configuration test passed");
      return true;
    } catch (error) {
      console.error("Razorpay configuration test failed:", error);
      return false;
    }
  }
};
