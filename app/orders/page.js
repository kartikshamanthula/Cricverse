"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Package, Calendar, Clock, CheckCircle2, Truck, XCircle, ChevronRight, ArrowLeft, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function MyOrdersPage() {
    const { user, loading: authLoading } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && user) {
            fetchOrders()
        } else if (!authLoading && !user) {
            setLoading(false)
        }
    }, [user, authLoading])

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders")
            if (!response.ok) throw new Error("Failed to fetch orders")
            const data = await response.json()
            setOrders(data)
        } catch (error) {
            console.error("Error fetching orders:", error)
            toast.error("Failed to load your orders")
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "Processing":
                return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Clock className="w-3 h-3 mr-1" /> Processing</Badge>
            case "Shipped":
                return <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20"><Truck className="w-3 h-3 mr-1" /> Shipped</Badge>
            case "Delivered":
                return <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Delivered</Badge>
            case "Cancelled":
                return <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Loading your orders...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
                <Card className="border-dashed border-2 p-12 bg-muted/30">
                    <div className="flex flex-col items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShoppingBag className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold italic tracking-tight uppercase">Login Required</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">Please log in to see your order history and track your deliveries.</p>
                        </div>
                        <Link href="/login">
                            <Button size="lg" className="px-8 font-bold italic uppercase tracking-wider group">
                                Login Now <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <Package className="h-8 w-8 text-primary" /> My Orders
                    </h1>
                    <p className="text-muted-foreground text-lg">Track and manage your recent purchases from CricVerse Store.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/store">
                        <Button variant="outline" className="gap-2 font-semibold">
                            <ShoppingBag className="w-4 h-4" /> Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>

            {orders.length === 0 ? (
                <Card className="border-dashed border-2 py-20 bg-muted/30 text-center">
                    <CardContent className="space-y-6">
                        <div className="flex justify-center">
                            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center opacity-50">
                                <ShoppingBag className="h-12 w-12" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">No Orders Yet</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">You haven't placed any orders yet. Visit our store to find the best cricket gear!</p>
                        </div>
                        <Link href="/store">
                            <Button size="lg" className="px-8 font-semibold group">
                                Start Shopping <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {orders.map((order) => (
                        <Card key={order._id} className="overflow-hidden border-border/50 bg-background/50 backdrop-blur shadow-xl shadow-primary/5 group hover:border-primary/30 transition-all duration-300">
                            <div className="flex flex-col lg:flex-row lg:items-stretch">
                                {/* Order Status Side */}
                                <div className="p-6 lg:w-72 bg-muted/20 border-b lg:border-b-0 lg:border-r border-border/50 flex flex-col justify-between gap-4">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order ID</p>
                                            <p className="font-mono text-sm font-bold text-primary">#{order.orderId}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                                            {getStatusBadge(order.orderStatus)}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-border/50">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                                        <p className="text-2xl font-bold text-primary leading-none">₹{order.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Order Items Content */}
                                <div className="flex-1 p-6 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold flex items-center gap-2 tracking-tight">
                                            <ShoppingBag className="w-4 h-4 text-primary" /> Purchase Summary
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border/50">
                                                    <div className="h-16 w-16 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-muted">
                                                                <Package className="w-6 h-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate tracking-tight">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground">₹{item.price.toLocaleString()} x {item.quantity}</p>
                                                        <p className="text-sm font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Address</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                {order.customerDetails.address}
                                            </p>
                                        </div>
                                        <div className="flex items-end justify-end gap-3 pt-2 md:pt-0">
                                            {/* Buttons removed as per request */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
