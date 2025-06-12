// components/checkout-modal.tsx - FIXED VERSION
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, CreditCard, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./auth/auth-context";
import { useCart } from "./cart/cart-context";
import { paymentService, CreateOrderResponse } from "@/services/payment.service";
import { Bundle } from "@/services/bundle.service";
import { UserPortfolio, userPortfolioService } from "@/services/user-portfolio.service";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "single" | "cart";
  bundle?: Bundle;
  portfolio?: UserPortfolio;
  subscriptionType?: "monthly" | "quarterly" | "yearly";
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  type,
  bundle,
  portfolio,
  subscriptionType = "monthly",
}) => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(null);
  const [paymentStep, setPaymentStep] = useState<"review" | "processing" | "success" | "error">("review");
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const { toast } = useToast();

  // Check if this is the basic plan (will be handled differently)
  const isBasicPlan = bundle && bundle._id === "basic-plan-id";

  // Refresh cart data when modal opens for cart checkout
  useEffect(() => {
    if (isOpen && type === "cart") {
      refreshCart(); // Use cart context refresh instead of local loading
    }
  }, [isOpen, type, refreshCart]);

  const calculateTotal = () => {
    if (type === "single") {
      if (bundle) {
        switch (subscriptionType) {
          case "yearly":
            return bundle.yearlyPrice;
          case "quarterly":
            return bundle.quarterlyPrice;
          default:
            return bundle.monthlyPrice;
        }
      }
      
      if (portfolio) {
        return userPortfolioService.getPriceByType(portfolio.subscriptionFee, subscriptionType);
      }
    }
    
    if (type === "cart" && cart) {
      return cart.items.reduce((total, item) => {
        let price = 0;
        switch (subscriptionType) {
          case "yearly":
            price = item.portfolio.subscriptionFee.find(fee => fee.type === "yearly")?.price || 0;
            break;
          case "quarterly":
            price = item.portfolio.subscriptionFee.find(fee => fee.type === "quarterly")?.price || 0;
            break;
          default:
            price = item.portfolio.subscriptionFee.find(fee => fee.type === "monthly")?.price || 0;
            break;
        }
        return total + (price * item.quantity);
      }, 0);
    }
    
    return 0;
  };

  const handleCreateOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with the purchase",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaymentStep("processing");

    try {
      let orderResponse: CreateOrderResponse;

      if (type === "single") {
        if (bundle) {
          if (isBasicPlan) {
            // Basic plan - show coming soon message
            toast({
              title: "Basic Plan Purchase",
              description: "Basic plan purchase will be available soon. Please contact support.",
              variant: "destructive",
            });
            setPaymentStep("error");
            return;
          } else {
            // Bundle purchase
            console.log("Creating bundle order with:", {
              productType: "Bundle",
              productId: bundle._id,
              planType: subscriptionType
            });
            
            orderResponse = await paymentService.createOrder({
              productType: "Bundle",
              productId: bundle._id,
              planType: subscriptionType,
            });
          }
        } else if (portfolio) {
          // Individual portfolio purchase
          console.log("Creating portfolio order with:", {
            productType: "Portfolio",
            productId: portfolio._id,
            planType: subscriptionType
          });
          
          orderResponse = await paymentService.createOrder({
            productType: "Portfolio",
            productId: portfolio._id,
            planType: subscriptionType,
          });
        } else {
          throw new Error("No product selected for purchase");
        }
      } else if (type === "cart") {
        // Cart checkout - FIXED: Pass the subscription type
        console.log("Creating cart checkout order with planType:", subscriptionType);
        orderResponse = await paymentService.cartCheckout(subscriptionType);
      } else {
        throw new Error("Invalid checkout configuration");
      }

      console.log("Order created successfully:", orderResponse);
      setOrderData(orderResponse);
      await initiatePayment(orderResponse);
    } catch (error: any) {
      console.error("Order creation failed:", error);
      setPaymentStep("error");
      
      // Improved error handling
      let errorMessage = "Failed to create order. Please try again.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Order Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (orderResponse: CreateOrderResponse) => {
    if (!user) return;

    try {
      console.log("Initiating payment with order:", orderResponse);
      
      await paymentService.openCheckout(
        orderResponse,
        {
          name: user.username,
          email: user.email,
        },
        async (response: any) => {
          console.log("Payment success response:", response);
          // Payment successful, verify it
          await handlePaymentSuccess(response);
        },
        (error: any) => {
          console.error("Payment failed:", error);
          // Payment failed or cancelled
          setPaymentStep("error");
          toast({
            title: "Payment Failed",
            description: error.message || "Payment was cancelled or failed",
            variant: "destructive",
          });
        }
      );
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      setPaymentStep("error");
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      console.log("Verifying payment:", {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        hasSignature: !!response.razorpay_signature
      });
      
      // Verify payment with backend
      await paymentService.verifyPayment({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
      });

      setPaymentStep("success");
      
      // Success message based on purchase type
      let successMessage = "Your subscription has been activated successfully.";
      
      if (type === "single") {
        if (bundle && !isBasicPlan) {
          successMessage = `Bundle subscription activated! You now have access to all ${bundle.portfolios.length} portfolios.`;
        } else if (portfolio) {
          successMessage = `${portfolio.name} subscription activated! You now have access to this portfolio.`;
        }
      } else if (type === "cart") {
        successMessage = "All portfolio subscriptions have been activated successfully.";
      }

      toast({
        title: "Payment Successful!",
        description: successMessage,
      });

      // Refresh cart if it was a cart checkout
      if (type === "cart") {
        await refreshCart(); // Use cart context refresh
      }
    } catch (error: any) {
      console.error("Payment verification failed:", error);
      setPaymentStep("error");
      toast({
        title: "Payment Verification Failed",
        description: error.message || "Payment completed but verification failed. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const resetModal = () => {
    setPaymentStep("review");
    setOrderData(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getCheckoutDescription = (portfolio: UserPortfolio) => {
    return userPortfolioService.getDescriptionByKey(portfolio.description, "checkout card");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {type === "cart" ? <ShoppingCart className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
              {paymentStep === "success" ? "Payment Successful" : "Checkout"}
            </h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {paymentStep === "review" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Order Summary</h3>
                
                {/* Debug info - Remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                    Debug: Type: {type}, Subscription: {subscriptionType}, Total: ₹{calculateTotal()}
                  </div>
                )}
                
                {/* Single Portfolio */}
                {type === "single" && portfolio && (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-900 mb-2">{portfolio.name}</h4>
                    
                    {/* Checkout Description */}
                    {getCheckoutDescription(portfolio) && (
                      <p className="text-sm text-gray-600 mb-4">
                        {getCheckoutDescription(portfolio)}
                      </p>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-white rounded border">
                      <div className="text-center">
                        <div className="text-sm font-bold text-green-600">{portfolio.CAGRSinceInception || "N/A"}%</div>
                        <div className="text-xs text-gray-500">CAGR</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-blue-600">{portfolio.oneYearGains || "N/A"}%</div>
                        <div className="text-xs text-gray-500">1Y Returns</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-purple-600">{portfolio.monthlyGains || "N/A"}%</div>
                        <div className="text-xs text-gray-500">Monthly</div>
                      </div>
                    </div>

                    {/* Portfolio Details */}
                    <div className="space-y-2 mb-4 p-3 bg-white rounded border">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Min Investment:</span>
                        <span className="font-medium">₹{portfolio.minInvestment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Time Horizon:</span>
                        <span className="font-medium">{portfolio.timeHorizon || `${portfolio.durationMonths} months`}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Rebalancing:</span>
                        <span className="font-medium">{portfolio.rebalancing || "Quarterly"}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-sm text-gray-500">
                        {subscriptionType === "yearly" ? "Yearly" : subscriptionType === "quarterly" ? "Quarterly" : "Monthly"} Subscription
                      </span>
                      <span className="font-bold text-lg text-blue-600">
                        ₹{calculateTotal()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Single Bundle */}
                {type === "single" && bundle && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium">{bundle.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{bundle.description}</p>
                    
                    {/* Show bundle portfolios if not basic plan */}
                    {!isBasicPlan && bundle.portfolios.length > 0 && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Includes {bundle.portfolios.length} Portfolio{bundle.portfolios.length > 1 ? 's' : ''}:
                        </p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {bundle.portfolios.slice(0, 3).map((portfolio, index) => (
                            <li key={index}>• {portfolio.name}</li>
                          ))}
                          {bundle.portfolios.length > 3 && (
                            <li>• And {bundle.portfolios.length - 3} more...</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-500">
                        {subscriptionType === "yearly" ? "Yearly" : subscriptionType === "quarterly" ? "Quarterly" : "Monthly"} Subscription
                      </span>
                      <span className="font-bold text-lg">
                        ₹{calculateTotal()}
                      </span>
                    </div>
                    
                    {/* Show bundle discount if applicable */}
                    {!isBasicPlan && bundle.discountPercentage > 0 && (
                      <div className="text-sm text-green-600 mt-2 flex items-center">
                        <Check className="w-4 h-4 mr-1" />
                        {bundle.discountPercentage}% bundle discount applied
                      </div>
                    )}
                  </div>
                )}

                {/* Cart Items */}
                {type === "cart" && cart && cart.items.length > 0 && (
                  <div className="space-y-3">
                    {cart.items.map((item) => {
                      let price = 0;
                      let period = "";
                      
                      switch (subscriptionType) {
                        case "yearly":
                          price = item.portfolio.subscriptionFee.find(fee => fee.type === "yearly")?.price || 0;
                          period = "Yearly";
                          break;
                        case "quarterly":
                          price = item.portfolio.subscriptionFee.find(fee => fee.type === "quarterly")?.price || 0;
                          period = "Quarterly";
                          break;
                        default:
                          price = item.portfolio.subscriptionFee.find(fee => fee.type === "monthly")?.price || 0;
                          period = "Monthly";
                          break;
                      }

                      const checkoutDesc = userPortfolioService.getDescriptionByKey(item.portfolio.description, "checkout card");
                      
                      return (
                        <div key={item._id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.portfolio.name}</h4>
                              {checkoutDesc && (
                                <p className="text-xs text-gray-600 mt-1">{checkoutDesc}</p>
                              )}
                              <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                            </div>
                            <span className="font-bold">₹{price * item.quantity}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show message if cart is empty */}
                {type === "cart" && (!cart || cart.items.length === 0) && (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                )}

                {/* Total */}
                {((type === "cart" && cart && cart.items.length > 0) || type === "single") && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-blue-600">₹{calculateTotal()}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Billed {subscriptionType === "yearly" ? "annually" : subscriptionType === "quarterly" ? "per quarter" : "monthly"}
                    </p>
                  </div>
                )}

                {/* Payment Button */}
                {((type === "cart" && cart && cart.items.length > 0) || type === "single") && (
                  <Button
                    onClick={handleCreateOrder}
                    disabled={loading || isBasicPlan}
                    className="w-full bg-[#001633] hover:bg-[#002244] text-white py-3"
                  >
                    {loading ? "Processing..." : isBasicPlan ? "Coming Soon" : `Pay ₹${calculateTotal()}`}
                  </Button>
                )}
                
                {isBasicPlan && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Basic plan payment integration coming soon. Please contact support for assistance.
                  </p>
                )}
              </div>
            )}

            {paymentStep === "processing" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                <p className="text-gray-600">Please complete the payment in the Razorpay window...</p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-green-800">Payment Successful!</h3>
                
                {/* Success message based on purchase type */}
                {type === "single" && bundle && !isBasicPlan ? (
                  <div className="text-gray-600 mb-6">
                    <p className="mb-2">Bundle subscription activated successfully!</p>
                    <p className="text-sm">You now have access to all {bundle.portfolios.length} portfolio{bundle.portfolios.length > 1 ? 's' : ''} in this bundle.</p>
                  </div>
                ) : type === "single" && portfolio ? (
                  <div className="text-gray-600 mb-6">
                    <p className="mb-2">{portfolio.name} subscription activated!</p>
                    <p className="text-sm">You now have full access to this portfolio's recommendations and insights.</p>
                  </div>
                ) : (
                  <p className="text-gray-600 mb-6">Your subscription has been activated successfully.</p>
                )}
                
                <Button
                  onClick={handleClose}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Continue to Dashboard
                </Button>
              </div>
            )}

            {paymentStep === "error" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-red-800">
                  {isBasicPlan ? "Coming Soon" : "Payment Failed"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isBasicPlan 
                    ? "Basic plan purchase is not available yet. Please contact support." 
                    : "Something went wrong with your payment. Please try again."
                  }
                </p>
                <div className="space-y-2">
                  {!isBasicPlan && (
                    <Button
                      onClick={() => setPaymentStep("review")}
                      className="w-full bg-[#001633] hover:bg-[#002244]"
                    >
                      Try Again
                    </Button>
                  )}
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="w-full"
                  >
                    {isBasicPlan ? "Contact Support" : "Cancel"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};