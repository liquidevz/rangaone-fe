// components/cart.tsx
"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, X, ShoppingCart as CartIcon, CreditCard, ArrowLeft, Package, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-context"
import { useCart } from "@/components/cart/cart-context"
import { CheckoutModal } from "@/components/checkout-modal"
import Link from "next/link"
import { cartService } from "@/services/cart.service"
import { userPortfolioService } from "@/services/user-portfolio.service"
import { motion, AnimatePresence } from "framer-motion"

export default function CartPage() {
  const [loading, setLoading] = useState(true)
  const [subscriptionType, setSubscriptionType] = useState<"monthly" | "quarterly" | "yearly">("monthly")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState("")
  const [discount, setDiscount] = useState(0)
  const [checkoutModal, setCheckoutModal] = useState(false)
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null)

  const { isAuthenticated } = useAuth()
  const { cart, localCart, cartItemCount, addToCart, removeFromCart, refreshCart, getEffectiveCart, syncing } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart().finally(() => setLoading(false))
    } else {
      // For unauthenticated users, just load local cart
      setLoading(false)
    }
  }, [isAuthenticated, refreshCart])

  // Get effective cart data
  const effectiveCart = getEffectiveCart()
  const effectiveItems = effectiveCart.items

  const updateQuantity = async (portfolioId: string, newQuantity: number) => {
    if (updatingQuantity) return; // Prevent multiple simultaneous updates
    
    try {
      setUpdatingQuantity(portfolioId);
      
      if (newQuantity <= 0) {
        await removeFromCart(portfolioId);
        toast({
          title: "Item Removed",
          description: "Item has been removed from your cart",
        });
      } else {
        // Get current quantity to calculate the difference
        const currentItem = effectiveItems.find(item => item.portfolio._id === portfolioId);
        const currentQuantity = currentItem?.quantity || 0;
        
        if (newQuantity > currentQuantity) {
          // Increase quantity: add the difference
          const quantityToAdd = newQuantity - currentQuantity;
          await addToCart(portfolioId, quantityToAdd);
        } else if (newQuantity < currentQuantity) {
          // Decrease quantity: need to implement a different approach, For now, we'll remove and re-add with the correct quantity
          await removeFromCart(portfolioId);
          if (newQuantity > 0) {
            await addToCart(portfolioId, newQuantity);
          }
        }
        // If newQuantity === currentQuantity, no action needed
        
        toast({
          title: "Quantity Updated",
          description: `Updated quantity to ${newQuantity}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart",
        variant: "destructive",
      });
    } finally {
      setUpdatingQuantity(null);
    }
  }

  const removeItem = async (portfolioId: string) => {
    try {
      await removeFromCart(portfolioId)
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const applyCoupon = () => {
    // Placeholder for future backend implementation
    toast({
      title: "Coupon System",
      description: "Coupon functionality will be available soon via backend integration.",
    })
  }

  const removeCoupon = () => {
    setAppliedCoupon("")
    setDiscount(0)
    setCouponCode("")
    toast({
      title: "Coupon Removed",
      description: "Discount has been removed from your order",
    })
  }

  // Get checkout description from description array
  const getCheckoutDescription = (descriptions: any[]) => {
    if (!descriptions || !Array.isArray(descriptions)) {
      return null;
    }
    
    const result = userPortfolioService.getDescriptionByKey(descriptions, "checkout card");
    return result || null;
  }

  // Calculate subtotal based on actual cart items
  const subtotal = effectiveItems.reduce((sum, item) => {
    let price = 0
    
    // Check if this is a bundle item
    if (cartService.isBundle(item)) {
      // For bundles, use bundle pricing logic
      switch (subscriptionType) {
        case "yearly":
          price = cartService.getBundlePrice(item.portfolio, "yearly")
          break
        case "quarterly":
          price = cartService.getBundlePrice(item.portfolio, "quarterly")
          break
        default:
          price = cartService.getBundlePrice(item.portfolio, "monthly")
          break
      }
    } else {
      // For regular portfolios, use subscription fee
      switch (subscriptionType) {
        case "yearly":
          price = item.portfolio.subscriptionFee.find((fee: any) => fee.type === "yearly")?.price || 0
          break
        case "quarterly":
          price = item.portfolio.subscriptionFee.find((fee: any) => fee.type === "quarterly")?.price || 0
          break
        default:
          price = item.portfolio.subscriptionFee.find((fee: any) => fee.type === "monthly")?.price || 0
          break
      }
    }
    return sum + (price * item.quantity)
  }, 0) || 0

  const discountAmount = subtotal * discount
  const total = subtotal - discountAmount

  const billingPeriod = subscriptionType === "yearly" ? "Yearly" : subscriptionType === "quarterly" ? "Quarterly" : "Monthly"

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your cart...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Enhanced Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors group">
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Continue Shopping</span>
              </Link>
            </div>
            
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <div className="p-3 bg-blue-100 rounded-full">
                  <CartIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Your Cart</h1>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 text-lg"
              >
                {cartItemCount > 0 
                  ? `${cartItemCount} item${cartItemCount > 1 ? 's' : ''} ready for checkout`
                  : "Your cart is empty"
                }
              </motion.p>
            </div>
            
            {/* Enhanced Status Notifications */}
            <AnimatePresence>
              {!isAuthenticated && cartItemCount > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mt-6 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Items Saved Locally</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Sign in during checkout to save these items to your account permanently.
                  </p>
                </motion.div>
              )}

              {syncing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mt-6 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-green-600 animate-pulse" />
                    <span className="font-semibold text-green-900">Syncing Cart</span>
                  </div>
                  <p className="text-green-800 text-sm">
                    Transferring your items to your account...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {cartItemCount === 0 ? (
            // Enhanced Empty Cart State
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <div className="p-6 bg-gray-100 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                  <CartIcon className="w-16 h-16 text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Discover our investment portfolios and subscription plans to start building your wealth.
                </p> 
                <Link href="/#portfolios">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Browse Portfolios
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            // Enhanced Cart with Items
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Side - Cart Items */}
              <div className="lg:col-span-2">
                {/* Enhanced Subscription Type Toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      Billing Cycle
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: "monthly", label: "Monthly", badge: "" },
                        { key: "quarterly", label: "Quarterly", badge: "Save 11%" },
                        { key: "yearly", label: "Yearly", badge: "Save 17%" }
                      ].map((option) => (
                        <button
                          key={option.key}
                          onClick={() => setSubscriptionType(option.key as any)}
                          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                            subscriptionType === option.key 
                              ? "bg-blue-600 text-white shadow-lg transform scale-105" 
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                          }`}
                        >
                          {option.label}
                          {option.badge && (
                            <Badge variant="secondary" className={`text-xs ${
                              subscriptionType === option.key ? "bg-white/20 text-white" : ""
                            }`}>
                              {option.badge}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Cart Items List */}
                <div className="space-y-6">
                  <AnimatePresence>
                    {effectiveItems.map((item, index) => {
                      let price = 0
                      let period = ""
                      const isBundle = cartService.isBundle(item)
                      
                      if (isBundle) {
                        // Bundle pricing logic
                        switch (subscriptionType) {
                          case "yearly":
                            price = cartService.getBundlePrice(item.portfolio, "yearly")
                            period = "Yearly"
                            break
                          case "quarterly":
                            price = cartService.getBundlePrice(item.portfolio, "quarterly")
                            period = "Quarterly"
                            break
                          default:
                            price = cartService.getBundlePrice(item.portfolio, "monthly")
                            period = "Monthly"
                            break
                        }
                      } else {
                        // Regular portfolio pricing
                        switch (subscriptionType) {
                          case "yearly":
                            price = item.portfolio.subscriptionFee.find((fee: any) => fee.type === "yearly")?.price || 0
                            period = "Yearly"
                            break
                          case "quarterly":
                            price = item.portfolio.subscriptionFee.find((fee: any) => fee.type === "quarterly")?.price || 0
                            period = "Quarterly"
                            break
                          default:
                            price = item.portfolio.subscriptionFee.find((fee: any) => fee.type === "monthly")?.price || 0
                            period = "Monthly"
                            break
                        }
                      }

                      const isUpdating = updatingQuantity === item.portfolio._id;
                      const checkoutDescription = getCheckoutDescription(item.portfolio.description);

                      return (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-4">
                            {/* Header with title and price */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{item.portfolio.name}</h3>
                                {isBundle && (
                                  <Badge variant="secondary" className="mt-1">
                                    {(item.portfolio as any).category === "premium" ? "Premium" : "Basic"} Subscription
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-lg font-bold text-gray-900">₹ {price.toFixed(2)}</div>
                                <div className="text-sm text-gray-500">/ {period}</div>
                              </div>
                            </div>

                            {/* Portfolio Details/Features */}
                            {checkoutDescription && (
                              <div className="mb-4">
                                <div 
                                  className="checkout-description text-gray-600 text-sm"
                                  dangerouslySetInnerHTML={{ __html: checkoutDescription }}
                                />
                              </div>
                            )}

                            {/* Bottom controls */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-3">
                                {/* Quantity controls for portfolios */}
                                {!isBundle && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.portfolio._id, item.quantity - 1)}
                                      disabled={isUpdating}
                                      className="w-8 h-8 p-0"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="px-3 py-1 min-w-[40px] text-center text-sm font-medium">
                                      {isUpdating ? (
                                        <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                      ) : (
                                        item.quantity
                                      )}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.portfolio._id, item.quantity + 1)}
                                      disabled={isUpdating}
                                      className="w-8 h-8 p-0"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                                
                                {isBundle && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    Subscription
                                  </span>
                                )}
                              </div>

                              {/* Remove button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.portfolio._id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                disabled={isUpdating}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Enhanced Right Side - Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="sticky top-6"
                >
                  <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Enhanced Discount Coupon */}
                      <div>
                        <Label className="text-sm font-semibold mb-3 block text-gray-900">DISCOUNT COUPON</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 rounded-lg border-gray-300"
                          />
                          <Button onClick={applyCoupon} variant="outline" className="rounded-lg border-gray-300">
                            Apply
                          </Button>
                        </div>
                        {appliedCoupon && (
                          <div className="flex items-center justify-between mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="text-sm text-green-700 font-medium">Coupon "{appliedCoupon}" applied</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={removeCoupon}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Coupon system coming soon via backend integration
                        </p>
                      </div>

                      <Separator />

                      {/* Enhanced Order Details */}
                      <div>
                        <h3 className="font-semibold mb-4 text-gray-900">Order Details</h3>
                        <div className="space-y-4">
                          {effectiveItems.map((item) => {
                            let price = 0
                            let period = ""
                            const isBundle = cartService.isBundle(item)
                            
                            if (isBundle) {
                              switch (subscriptionType) {
                                case "yearly":
                                  price = cartService.getBundlePrice(item.portfolio, "yearly")
                                  period = "Yearly"
                                  break
                                case "quarterly":
                                  price = cartService.getBundlePrice(item.portfolio, "quarterly")
                                  period = "Quarterly"
                                  break
                                default:
                                  price = cartService.getBundlePrice(item.portfolio, "monthly")
                                  period = "Monthly"
                                  break
                              }
                            } else {
                              switch (subscriptionType) {
                                case "yearly":
                                  price = item.portfolio.subscriptionFee.find((fee: any) => fee.type === "yearly")?.price || 0
                                  period = "Yearly"
                                  break
                                case "quarterly":
                                  price = item.portfolio.subscriptionFee.find((fee: any) => fee.type === "quarterly")?.price || 0
                                  period = "Quarterly"
                                  break
                                default:
                                  price = item.portfolio.subscriptionFee.find((fee: any) => fee.type === "monthly")?.price || 0
                                  period = "Monthly"
                                  break
                              }
                            }

                            return (
                              <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 flex items-center gap-2">
                                    {item.portfolio.name}
                                    {isBundle && (
                                      <Badge variant="outline" className="text-xs">
                                        {(item.portfolio as any).category === "premium" ? "Premium" : "Basic"}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-gray-600 text-sm">
                                    {item.quantity} × ₹{price} / {period}
                                  </div>
                                </div>
                                <div className="font-semibold text-gray-900">₹{(price * item.quantity).toFixed(2)}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <Separator />

                      {/* Enhanced Totals */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-base">
                          <span className="text-gray-700">Subtotal ({cartItemCount} Items)</span>
                          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                            <span>-₹{discountAmount.toFixed(2)}</span>
                          </div>
                        )}

                        <Separator />

                        <div className="flex justify-between font-bold text-xl">
                          <span className="text-gray-900">Total Amount</span>
                          <span className="text-blue-600">₹{total.toFixed(2)}</span>
                        </div>

                        <div className="text-xs text-gray-500 text-center">Billed {billingPeriod.toLowerCase()}</div>
                      </div>

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        onClick={() => setCheckoutModal(true)}
                        disabled={updatingQuantity !== null}
                      >
                        <CreditCard className="w-5 h-5 mr-3" />
                        {updatingQuantity ? "Updating..." : isAuthenticated ? "Checkout" : "Sign In & Checkout"}
                      </Button>
                      
                      {!isAuthenticated && (
                        <p className="text-xs text-gray-500 text-center">
                          You'll be prompted to sign in or create an account
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModal}
        onClose={() => setCheckoutModal(false)}
        type="cart"
        subscriptionType={subscriptionType}
      />
    </>
  )
}