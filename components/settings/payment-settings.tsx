"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Download, CreditCard, Calendar, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Payment {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  status: "paid" | "pending" | "failed" | "refunded"
  paymentMethod: string
  description: string
}

export default function PaymentSettings() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      try {
        // In a real app, this would be a fetch call to your API
        // const response = await fetch('/api/user/payments')
        // const data = await response.json()

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setPayments([
            {
              id: "1",
              invoiceNumber: "INV-2023-001",
              date: "2023-05-15T10:30:00Z",
              amount: 9999,
              status: "paid",
              paymentMethod: "Credit Card",
              description: "Premium Plan - Annual Subscription",
            },
            {
              id: "2",
              invoiceNumber: "INV-2023-002",
              date: "2023-03-10T14:45:00Z",
              amount: 4999,
              status: "paid",
              paymentMethod: "UPI",
              description: "Growth Portfolio - Quarterly Subscription",
            },
            {
              id: "3",
              invoiceNumber: "INV-2022-045",
              date: "2022-06-15T09:15:00Z",
              amount: 2999,
              status: "paid",
              paymentMethod: "Net Banking",
              description: "Basic Plan - Annual Subscription",
            },
            {
              id: "4",
              invoiceNumber: "INV-2023-003",
              date: "2023-05-20T11:30:00Z",
              amount: 1499,
              status: "pending",
              paymentMethod: "Credit Card",
              description: "Market Analysis Report - One-time Purchase",
            },
            {
              id: "5",
              invoiceNumber: "INV-2023-004",
              date: "2023-04-05T16:20:00Z",
              amount: 999,
              status: "refunded",
              paymentMethod: "UPI",
              description: "Webinar Access - One-time Purchase",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch payments:", error)
        toast({
          title: "Error",
          description: "Failed to load payment history. Please try again later.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchPayments()
  }, [toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "refunded":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit card":
      case "debit card":
        return <CreditCard className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const filteredPayments = payments.filter((payment) => {
    // Filter by status
    if (filterStatus !== "all" && payment.status !== filterStatus) {
      return false
    }

    // Filter by date range
    const paymentDate = new Date(payment.date)
    const now = new Date()

    if (dateRange === "last30days") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(now.getDate() - 30)
      if (paymentDate < thirtyDaysAgo) {
        return false
      }
    } else if (dateRange === "last3months") {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      if (paymentDate < threeMonthsAgo) {
        return false
      }
    } else if (dateRange === "last6months") {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(now.getMonth() - 6)
      if (paymentDate < sixMonthsAgo) {
        return false
      }
    } else if (dateRange === "lastyear") {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(now.getFullYear() - 1)
      if (paymentDate < oneYearAgo) {
        return false
      }
    }

    return true
  })

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
        <p className="text-gray-600 mb-6">
          View your payment history, download invoices, and manage your payment methods.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last3months">Last 3 Months</SelectItem>
                <SelectItem value="last6months">Last 6 Months</SelectItem>
                <SelectItem value="lastyear">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="outline" className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Download All Invoices
        </Button>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No payment records found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{payment.description}</h3>
                      <Badge className={cn("text-xs", getStatusColor(payment.status))}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Invoice: {payment.invoiceNumber}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(payment.date).toLocaleDateString()} at{" "}
                      {new Date(payment.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-xl font-bold">₹{payment.amount.toLocaleString()}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      {getPaymentIcon(payment.paymentMethod)}
                      <span className="ml-1">{payment.paymentMethod}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="flex items-center mt-2">
                      <FileText className="h-4 w-4 mr-1" />
                      View Invoice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <p className="text-gray-600 mb-4">Add or update your payment methods to ensure smooth subscription renewals.</p>
        <Button className="bg-indigo-900 hover:bg-indigo-800">Manage Payment Methods</Button>
      </div>
    </div>
  )
}
