"use client";

import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { subscriptionService } from "@/services/subscription.service";
import { cartService } from "@/services/cart.service";
import { useToast } from "@/components/ui/use-toast";

export const DebugCartButton = () => {
  const { debugCart, forceCleanupInvalidItems, refreshCart } = useCart();
  const { toast } = useToast();

  const debugSubscriptions = async () => {
    try {
      await subscriptionService.diagnoseSubscriptionIssue();
      toast({
        title: "Subscription Debug",
        description: "Debug information logged to console. Check browser console for details.",
      });
    } catch (error) {
      console.error("Subscription debug failed:", error);
      toast({
        title: "Debug Failed",
        description: "Failed to debug subscriptions. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const forceRefreshAll = async () => {
    try {
      await subscriptionService.forceRefresh();
      await refreshCart();
      toast({
        title: "Force Refresh",
        description: "Subscriptions and cart refreshed from server.",
      });
    } catch (error) {
      console.error("Force refresh failed:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to force refresh. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const clearFailedRemovalAttempts = () => {
    try {
      cartService.clearFailedRemovalAttempts();
      toast({
        title: "Cache Cleared",
        description: "Failed removal attempts cache has been cleared.",
      });
    } catch (error) {
      console.error("Clear cache failed:", error);
      toast({
        title: "Clear Failed",
        description: "Failed to clear cache. Check console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <Button
        onClick={debugCart}
        variant="outline"
        size="sm"
        className="bg-blue-500 text-white hover:bg-blue-600"
      >
        Debug Cart
      </Button>
      <Button
        onClick={debugSubscriptions}
        variant="outline"
        size="sm"
        className="bg-purple-500 text-white hover:bg-purple-600"
      >
        Debug Subscriptions
      </Button>
      <Button
        onClick={forceRefreshAll}
        variant="outline"
        size="sm"
        className="bg-green-500 text-white hover:bg-green-600"
      >
        Force Refresh
      </Button>
      <Button
        onClick={async () => {
          try {
            await forceCleanupInvalidItems();
          } catch (error) {
            console.error("Force cleanup failed:", error);
            toast({
              title: "Cleanup Failed",
              description: "Failed to cleanup invalid items. Check console for details.",
              variant: "destructive",
            });
          }
        }}
        variant="outline"
        size="sm"
        className="bg-red-500 text-white hover:bg-red-600"
      >
        Cleanup Cart
      </Button>
      <Button
        onClick={clearFailedRemovalAttempts}
        variant="outline"
        size="sm"
        className="bg-orange-500 text-white hover:bg-orange-600"
      >
        Clear Cache
      </Button>
    </div>
  );
}; 