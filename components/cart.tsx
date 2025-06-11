// components/cart.tsx
"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, X, ShoppingCart as CartIcon, CreditCard, ArrowLeft } from "lucide-react"
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

export default function CartPage() {
  const [loading, setLoading] = useState(true)
  const [subscriptionType, setSubscriptionType] = useState<"monthly" | "quarterly" | "yearly">("monthly")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState("")
  const [discount, setDiscount] = useState(0)
  const [checkoutModal, setCheckoutModal] = useState(false)
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null)

  const { isAuthenticated } = useAuth()
  const { cart, cartItemCount, addToCart, removeFromCart, refreshCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, refreshCart])

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
        const currentItem = cart?.items.find(item => item.portfolio._id === portfolioId);
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

  const getCartItemQuantity = (portfolioId: string) => {
    const item = cart?.items.find(item => item.portfolio._id === portfolioId)
    return item?.quantity || 0
  }

  // Calculate subtotal based on actual cart items
  const subtotal = cart?.items.reduce((sum, item) => {
    let price = 0
    switch (subscriptionType) {
      case "yearly":
        price = item.portfolio.subscriptionFee.find(fee => fee.type === "yearly")?.price || 0
        break
      case "quarterly":
        price = item.portfolio.subscriptionFee.find(fee => fee.type === "quarterly")?.price || 0
        break
      default:
        price = item.portfolio.subscriptionFee.find(fee => fee.type === "monthly")?.price || 0
        break
    }
    return sum + (price * item.quantity)
  }, 0) || 0

  const discountAmount = subtotal * discount
  const total = subtotal - discountAmount

  const billingPeriod = subscriptionType === "yearly" ? "Yearly" : subscriptionType === "quarterly" ? "Quarterly" : "Monthly"

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Continue Shopping
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Your Cart</h1>
            <p className="text-center text-gray-600">
              {cartItemCount > 0 
                ? `You have ${cartItemCount} item${cartItemCount > 1 ? 's' : ''} in your cart`
                : "Your cart is empty"
              }
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {cartItemCount === 0 ? (
            // Empty Cart State
            <div className="text-center py-16">
              <CartIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any portfolios to your cart yet. 
                Explore our investment options and find the perfect portfolio for your goals.
              </p> 
              <Link href="/#portfolios">
                <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                  Browse Portfolios
                </Button>
              </Link>
            </div>
          ) : (
            // Cart with Items
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Side - Cart Items */}
              <div className="lg:col-span-2">
                {/* Subscription Type Toggle */}
                <div className="bg-white rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <Label className="text-sm font-medium">Subscription Type:</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSubscriptionType("monthly")}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          subscriptionType === "monthly" 
                            ? "bg-blue-600 text-white" 
                            : "bg-white text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setSubscriptionType("quarterly")}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          subscriptionType === "quarterly" 
                            ? "bg-blue-600 text-white" 
                            : "bg-white text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Quarterly
                        <Badge variant="secondary" className="ml-1 text-xs">
                          Save 11%
                        </Badge>
                      </button>
                      <button
                        onClick={() => setSubscriptionType("yearly")}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          subscriptionType === "yearly" 
                            ? "bg-blue-600 text-white" 
                            : "bg-white text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Yearly
                        <Badge variant="secondary" className="ml-1 text-xs">
                          Save 17%
                        </Badge>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="space-y-4">
                  {cart?.items.map((item) => {
                    let price = 0
                    let period = ""
                    
                    switch (subscriptionType) {
                      case "yearly":
                        price = item.portfolio.subscriptionFee.find(fee => fee.type === "yearly")?.price || 0
                        period = "Year"
                        break
                      case "quarterly":
                        price = item.portfolio.subscriptionFee.find(fee => fee.type === "quarterly")?.price || 0
                        period = "Quarter"
                        break
                      default:
                        price = item.portfolio.subscriptionFee.find(fee => fee.type === "monthly")?.price || 0
                        period = "Month"
                        break
                    }

                    const isUpdating = updatingQuantity === item.portfolio._id;

                    return (
                      <Card key={item._id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-2xl font-bold text-white">
                                {item.portfolio.name.charAt(0)}
                              </span>
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">{item.portfolio.name}</h3>
                                <div className="text-right">
                                  <div className="text-xl font-bold">₹{price.toFixed(2)}</div>
                                  <div className="text-sm text-gray-500">/ {period}</div>
                                </div>
                              </div>

                              {/* Portfolio Description */}
                              {item.portfolio.description && item.portfolio.description.length > 0 && (
                                <div className="text-sm text-gray-600 mb-3">
                                  {item.portfolio.description.slice(0, 2).map((desc, index) => (
                                    <div key={index} className="mb-1">
                                      <span className="font-medium">{desc.key}:</span> {desc.value}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 border rounded-lg">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateQuantity(item.portfolio._id, item.quantity - 1)}
                                      disabled={isUpdating}
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="px-3 py-1 min-w-[40px] text-center">
                                      {isUpdating ? (
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                      ) : (
                                        item.quantity
                                      )}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateQuantity(item.portfolio._id, item.quantity + 1)}
                                      disabled={isUpdating}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.portfolio._id)}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={isUpdating}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="text-lg font-bold">
                                  ₹{(price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Right Side - Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CartIcon className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Discount Coupon - Placeholder for backend */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">DISCOUNT COUPON</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={applyCoupon} variant="outline">
                          Apply
                        </Button>
                      </div>
                      {appliedCoupon && (
                        <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded">
                          <span className="text-sm text-green-700">Coupon "{appliedCoupon}" applied</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeCoupon}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Coupon system coming soon via backend integration
                      </p>
                    </div>

                    <Separator />

                    {/* Order Details */}
                    <div>
                      <h3 className="font-medium mb-3">Order Details</h3>
                      <div className="space-y-3">
                        {cart?.items.map((item) => {
                          let price = 0
                          let period = ""
                          
                          switch (subscriptionType) {
                            case "yearly":
                              price = item.portfolio.subscriptionFee.find(fee => fee.type === "yearly")?.price || 0
                              period = "Yearly"
                              break
                            case "quarterly":
                              price = item.portfolio.subscriptionFee.find(fee => fee.type === "quarterly")?.price || 0
                              period = "Quarterly"
                              break
                            default:
                              price = item.portfolio.subscriptionFee.find(fee => fee.type === "monthly")?.price || 0
                              period = "Monthly"
                              break
                          }

                          return (
                            <div key={item._id} className="flex justify-between items-center text-sm">
                              <div>
                                <div className="font-medium">{item.portfolio.name}</div>
                                <div className="text-gray-500">
                                  {item.quantity} × ₹{price} / {period}
                                </div>
                              </div>
                              <div className="font-medium">₹{(price * item.quantity).toFixed(2)}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal ({cartItemCount} Items)</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                          <span>-₹{discountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount</span>
                        <span className="text-blue-600">₹{total.toFixed(2)}</span>
                      </div>

                      <div className="text-xs text-gray-500 text-center">Billed {billingPeriod.toLowerCase()}</div>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                      onClick={() => setCheckoutModal(true)}
                      disabled={updatingQuantity !== null}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {updatingQuantity ? "Updating..." : "Checkout"}
                    </Button>
                  </CardContent>
                </Card>
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