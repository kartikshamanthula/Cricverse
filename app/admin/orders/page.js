"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Search, Filter, Eye, Clock, CheckCircle2, Truck, XCircle, ChevronRight, Package, Calendar, User, Phone, MapPin, Mail, CreditCard, Banknote, Smartphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders")
            if (!response.ok) throw new Error("Failed to fetch orders")
            const data = await response.json()
            setOrders(data)
        } catch (error) {
            console.error("Error fetching orders:", error)
            toast.error("Failed to load orders")
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderStatus: newStatus })
            })

            if (!response.ok) throw new Error("Failed to update status")

            toast.success(`Order status updated to ${newStatus}`)
            fetchOrders()
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({ ...selectedOrder, orderStatus: newStatus })
            }
        } catch (error) {
            console.error("Error updating order status:", error)
            toast.error("Failed to update order status")
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "All" || order.orderStatus === statusFilter
        return matchesSearch && matchesStatus
    })

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

    const getPaymentIcon = (method) => {
        if (method?.includes("Card")) return <CreditCard className="w-4 h-4" />
        if (method?.includes("Cash")) return <Banknote className="w-4 h-4" />
        return <Smartphone className="w-4 h-4" />
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Orders Management</h1>
                    <p className="text-muted-foreground mt-2">View and manage customer orders from the store.</p>
                </div>
                {/* <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={fetchOrders} className="gap-2">
                        <Clock className="w-4 h-4" /> Refresh
                    </Button>
                </div> */}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-background/50 backdrop-blur border-border/50">
                    <CardHeader className="pb-2">
                        <CardDescription>Total Orders</CardDescription>
                        <CardTitle className="text-2xl">{orders.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-background/50 backdrop-blur border-border/50">
                    <CardHeader className="pb-2">
                        <CardDescription>Processing</CardDescription>
                        <CardTitle className="text-2xl text-blue-500">
                            {orders.filter(o => o.orderStatus === "Processing").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-background/50 backdrop-blur border-border/50">
                    <CardHeader className="pb-2">
                        <CardDescription>Delivered</CardDescription>
                        <CardTitle className="text-2xl text-green-500">
                            {orders.filter(o => o.orderStatus === "Delivered").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-background/50 backdrop-blur border-border/50">
                    <CardHeader className="pb-2">
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-2xl text-primary font-bold">
                            ₹{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-border/50 bg-background/50 backdrop-blur shadow-xl shadow-primary/5 mb-8">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Order ID or Customer Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-background/50 border-border/50"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-background/50 border-border/50">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Status</SelectItem>
                                    <SelectItem value="Processing">Processing</SelectItem>
                                    <SelectItem value="Shipped">Shipped</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card className="border-border/50 shadow-xl shadow-primary/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border/50">
                            <tr>
                                <th className="p-4 text-sm font-semibold">Order ID</th>
                                <th className="p-4 text-sm font-semibold">Customer</th>
                                <th className="p-4 text-sm font-semibold">Date</th>
                                <th className="p-4 text-sm font-semibold">Amount</th>
                                <th className="p-4 text-sm font-semibold">Status</th>
                                <th className="p-4 text-sm font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-muted-foreground italic">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="p-4 font-mono text-sm font-semibold text-primary">#{order.orderId}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{order.customerDetails.name}</span>
                                                <span className="text-xs text-muted-foreground">{order.customerDetails.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground italic">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-bold">₹{order.totalAmount.toLocaleString()}</td>
                                        <td className="p-4">{getStatusBadge(order.orderStatus)}</td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="group-hover:bg-primary/10 group-hover:text-primary transition-all rounded-full px-4"
                                                onClick={() => {
                                                    setSelectedOrder(order)
                                                    setIsDetailsOpen(true)
                                                }}
                                            >
                                                Details <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between mt-2">
                                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                        Order Details <span className="text-primary font-normal text-lg">#{selectedOrder.orderId}</span>
                                    </DialogTitle>
                                    <div>{getStatusBadge(selectedOrder.orderStatus)}</div>
                                </div>
                                <DialogDescription>
                                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                {/* Left Side: Customer & Payment */}
                                <div className="space-y-6">
                                    <Card className="border-border/50 bg-muted/20">
                                        <CardHeader className="pb-3 border-b border-border/50">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                                <User className="w-4 h-4" /> Customer Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                    {selectedOrder.customerDetails.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-semibold">{selectedOrder.customerDetails.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <Mail className="w-4 h-4" /> {selectedOrder.customerDetails.email}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <Phone className="w-4 h-4" /> {selectedOrder.customerDetails.phone}
                                            </div>
                                            <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {selectedOrder.customerDetails.address}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50 bg-muted/20">
                                        <CardHeader className="pb-3 border-b border-border/50">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                                <CreditCard className="w-4 h-4" /> Payment Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Method:</span>
                                                <span className="font-semibold flex items-center gap-2">
                                                    {getPaymentIcon(selectedOrder.paymentMethod)} {selectedOrder.paymentMethod}
                                                </span>
                                            </div>
                                            {/* <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Status:</span>
                                                <Badge variant="outline" className={selectedOrder.paymentStatus === "Completed" ? "text-green-500 border-green-500/20 bg-green-500/5" : "text-yellow-500 border-yellow-500/20 bg-yellow-500/5"}>
                                                    {selectedOrder.paymentStatus}
                                                </Badge>
                                            </div> */}
                                            <div className="flex items-center justify-between text-base font-bold text-primary pt-2">
                                                <span>Total Amount:</span>
                                                <span>₹{selectedOrder.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Side: Items & Actions */}
                                <div className="space-y-6">
                                    <Card className="border-border/50 bg-muted/20">
                                        <CardHeader className="pb-3 border-b border-border/50">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                                <ShoppingBag className="w-4 h-4" /> Order Items
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 p-0">
                                            <div className="max-h-[250px] overflow-y-auto px-4 space-y-4 pb-4">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-lg border border-border bg-background overflow-hidden shrink-0">
                                                            {item.image ? (
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                                    <Package className="w-6 h-6 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                                            <p className="text-xs text-muted-foreground">₹{item.price.toLocaleString()} x {item.quantity}</p>
                                                        </div>
                                                        <div className="text-sm font-bold">
                                                            ₹{(item.price * item.quantity).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-primary/20 bg-primary/5">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Update Status</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-background"
                                                    disabled={selectedOrder.orderStatus === "Processing"}
                                                    onClick={() => updateOrderStatus(selectedOrder._id, "Processing")}
                                                >
                                                    Processing
                                                </Button>
                                                {/* <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-background"
                                                    disabled={selectedOrder.orderStatus === "Shipped"}
                                                    onClick={() => updateOrderStatus(selectedOrder._id, "Shipped")}
                                                >
                                                    Shipped
                                                </Button> */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-background text-green-500 hover:text-green-600 border-green-500/20"
                                                    disabled={selectedOrder.orderStatus === "Delivered"}
                                                    onClick={() => updateOrderStatus(selectedOrder._id, "Delivered")}
                                                >
                                                    Delivered
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-background text-red-500 hover:text-red-600 border-red-500/20"
                                                    disabled={selectedOrder.orderStatus === "Cancelled"}
                                                    onClick={() => updateOrderStatus(selectedOrder._id, "Cancelled")}
                                                >
                                                    Cancelled
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
