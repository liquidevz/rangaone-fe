// components/checkout-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, CreditCard, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./auth/auth-context";
import { useCart } from "./cart/cart-context";
import { useRouter } from "next/navigation";
import { Bundle } from "@/services/bundle.service";
import {
  UserPortfolio,
  userPortfolioService,
} from "@/services/user-portfolio.service";

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
  const [paymentStep, setPaymentStep] = useState<
    "review" | "processing" | "success" | "error"
  >("review");
  
  const { user, isAuthenticated } = useAuth();
  const { cart, refreshCart, calculateTotal: cartCalculateTotal } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isOpen && type === "cart") {
      refreshCart();
    }
  }, [isOpen, type, refreshCart]);

  useEffect(() => {
    if (!isOpen) {
      setPaymentStep("review");
    }
  }, [isOpen]);

  const handleCreateOrder = async () => {
    if (loading) return;

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to complete your purchase",
        variant: "destructive",
      });
      onClose();
      router.push("/login");
      return;
    }

    setLoading(true);
    setPaymentStep("processing");

    try {
      // Fake payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentStep("success");
      
      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated",
      });

      setTimeout(() => {
        onClose();
        setPaymentStep("review");
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      setPaymentStep("error");
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPaymentStep("review");
    setLoading(false);
    onClose();
  };

  const getCheckoutDescription = (portfolio: UserPortfolio) => {
    return userPortfolioService.getDescriptionByKey(
      portfolio?.description,
      "checkout card"
    );
  };

  const calculateTotal = () => {
    if (type === "single") {
      if (bundle) {
        switch (subscriptionType) {
          case "yearly":
            return bundle.quarterlyPrice;
          case "quarterly":
            return bundle.quarterlyPrice;
          default:
            return bundle.monthlyPrice;
        }
      }

      if (portfolio) {
        return userPortfolioService.getPriceByType(
          portfolio.subscriptionFee,
          subscriptionType
        );
      }
    }

    if (type === "cart" && cart) {
      return cartCalculateTotal(subscriptionType);
    }

    return 0;
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
              {type === "cart" ? (
                <ShoppingCart className="h-5 w-5" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
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

                {/* Single Portfolio */}
                {type === "single" && portfolio && (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {portfolio.name}
                    </h4>

                    {getCheckoutDescription(portfolio) && (
                      <div className="mb-4">
                        <div 
                          className="checkout-description text-sm text-gray-600"
                          dangerouslySetInnerHTML={{ __html: getCheckoutDescription(portfolio) }}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-white rounded border">
                      <div className="text-center">
                        <div className="text-sm font-bold text-green-600">
                          {portfolio.CAGRSinceInception || "N/A"}%
                        </div>
                        <div className="text-xs text-gray-500">CAGR</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-blue-600">
                          {portfolio.oneYearGains || "N/A"}%
                        </div>
                        <div className="text-xs text-gray-500">1Y Returns</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-purple-600">
                          {portfolio.monthlyGains || "N/A"}%
                        </div>
                        <div className="text-xs text-gray-500">Monthly</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-sm text-gray-500">
                        {subscriptionType === "yearly"
                          ? "Yearly"
                          : subscriptionType === "quarterly"
                          ? "Quarterly"
                          : "Monthly"}{" "}
                        Subscription
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
                    <p className="text-sm text-gray-600 mt-1">
                      {bundle.description}
                    </p>

                    {bundle.portfolios.length > 0 && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Includes {bundle.portfolios.length} Portfolio
                          {bundle.portfolios.length > 1 ? "s" : ""}:
                        </p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {bundle.portfolios
                            .slice(0, 3)
                            .map((portfolio, index) => (
                              <li key={index}>• {portfolio.name}</li>
                            ))}
                          {bundle.portfolios.length > 3 && (
                            <li>
                              • And {bundle.portfolios.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-500">
                        {subscriptionType === "yearly"
                          ? "Yearly"
                          : subscriptionType === "quarterly"
                          ? "Quarterly"
                          : "Monthly"}{" "}
                        Subscription
                      </span>
                      <span className="font-bold text-lg">
                        ₹{calculateTotal()}
                      </span>
                    </div>

                    {bundle.discountPercentage > 0 && (
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

                      switch (subscriptionType) {
                        case "yearly":
                          price =
                            item.portfolio.subscriptionFee.find(
                              (fee) => fee.type === "yearly"
                            )?.price || 0;
                          break;
                        case "quarterly":
                          price =
                            item.portfolio.subscriptionFee.find(
                              (fee) => fee.type === "quarterly"
                            )?.price || 0;
                          break;
                        default:
                          price =
                            item.portfolio.subscriptionFee.find(
                              (fee) => fee.type === "monthly"
                            )?.price || 0;
                          break;
                      }

                      const checkoutDesc =
                        userPortfolioService.getDescriptionByKey(
                          item.portfolio?.description,
                          "checkout card"
                        );

                      return (
                        <div
                          key={item._id}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {item.portfolio.name}
                              </h4>
                              {checkoutDesc && (
                                <div className="mt-1">
                                  <div 
                                    className="checkout-description text-xs text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: checkoutDesc }}
                                  />
                                </div>
                              )}
                              <p className="text-sm text-gray-600 mt-1">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <span className="font-bold">
                              ₹{price * item.quantity}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Empty cart */}
                {type === "cart" && (!cart || cart.items.length === 0) && (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                )}

                {/* Total */}
                {((type === "cart" && cart && cart.items.length > 0) ||
                  type === "single") && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-blue-600">₹{calculateTotal()}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Billed{" "}
                      {subscriptionType === "yearly"
                        ? "annually"
                        : subscriptionType === "quarterly"
                        ? "per quarter"
                        : "monthly"}
                    </p>
                  </div>
                )}

                {/* Payment Button */}
                {((type === "cart" && cart && cart.items.length > 0) ||
                  type === "single") && (
                  <Button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="w-full bg-[#001633] hover:bg-[#002244] text-[#FFFFF0] py-3"
                  >
                    {loading ? "Processing..." : `Pay ₹${calculateTotal()}`}
                  </Button>
                )}
              </div>
            )}

            {paymentStep === "processing" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">
                  Processing Payment
                </h3>
                <p className="text-gray-600">
                  Please wait while we process your payment...
                </p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-green-800">
                  Payment Successful!
                </h3>

                {type === "single" && bundle ? (
                  <div className="text-gray-600 mb-6">
                    <p className="mb-2">
                      {bundle.name} subscription activated successfully!
                    </p>
                    <p className="text-sm">
                      You now have access to all {bundle.portfolios.length} portfolio
                      {bundle.portfolios.length > 1 ? "s" : ""} in this bundle.
                    </p>
                  </div>
                ) : type === "single" && portfolio ? (
                  <div className="text-gray-600 mb-6">
                    <p className="mb-2">
                      {portfolio.name} subscription activated!
                    </p>
                    <p className="text-sm">
                      You now have full access to this portfolio's
                      recommendations and insights.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 mb-6">
                    Your subscription has been activated successfully.
                  </p>
                )}

                <Button
                  onClick={() => {
                    handleClose();
                    refreshCart();
                    router.push('/dashboard');
                  }}
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
                  Payment Failed
                </h3>
                <p className="text-gray-600 mb-6">
                  Something went wrong with your payment. Please try again.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => setPaymentStep("review")}
                    className="w-full bg-[#001633] hover:bg-[#002244]"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
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