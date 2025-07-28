"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { userService, PaymentHistory } from "@/services/user.service"

export default function PaymentSettings() {
  const [payments, setPayments] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      try {
        const data = await userService.getPaymentHistory()
        setPayments(data)
      } catch (error) {
        console.error("Failed to fetch payments:", error)
        toast({
          title: "Error",
          description: "Failed to load payment history. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [toast])



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600">Loading payment history...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Payment History</h2>
        <p className="text-gray-600 mb-6">View your payment history.</p>
      </div>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No payment records found.</p>
          </div>
        ) : (
          payments.map((payment) => (
            <Card key={payment._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Order ID: {payment.orderId}</h3>
                      <Badge variant={payment.status === 'captured' ? 'default' : 'secondary'}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Payment ID: {payment.paymentId}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">₹{(payment.amount / 100).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{payment.currency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
