"use client"

import { useState } from "react"
import { X, CreditCard, Smartphone, Banknote, CheckCircle2, ArrowLeft } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export function CheckoutModal({ isOpen, onClose }) {
    const { cart, getCartTotal, clearCart } = useCart()
    const [step, setStep] = useState(1) // 1: Payment Method, 2: Payment Details, 3: Confirmation
    const [paymentMethod, setPaymentMethod] = useState("")
    const [generatedOrderId, setGeneratedOrderId] = useState("")
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        cardNumber: "",
        cardExpiry: "",
        cardCVV: "",
        upiId: ""
    })

    if (!isOpen) return null

    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method)
        setStep(2)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        setGeneratedOrderId(orderId)

        const orderData = {
            customerDetails: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address
            },
            items: cart.map(item => ({
                productId: item._id ?? item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            totalAmount: getCartTotal(),
            paymentMethod,
            orderId
        }

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to place order")
            }

            setStep(3)
            toast.success("Order Placed Successfully!")
        } catch (error) {
            console.error("Checkout error:", error)
            toast.error(error.message || "Failed to place order. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setStep(1)
        setPaymentMethod("")
        setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            cardNumber: "",
            cardExpiry: "",
            cardCVV: "",
            upiId: ""
        })
        onClose()
    }

    const handleConfirmOrder = () => {
        clearCart()
        handleClose()
    }

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-300"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md max-h-[90vh] overflow-auto bg-card border-2 border-primary/20 shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border p-6 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {step > 1 && step < 3 && (
                                    <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)} className="rounded-full">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {step === 1 && "Select Payment Method"}
                                        {step === 2 && "Payment Details"}
                                        {step === 3 && "Order Confirmed!"}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {step === 1 && "Choose how you'd like to pay"}
                                        {step === 2 && `Paying via ${paymentMethod}`}
                                        {step === 3 && "Your order has been placed successfully"}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Step 1: Payment Method Selection */}
                        {step === 1 && (
                            <div className="flex justify-center">
                                <Card
                                    className="p-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group w-full max-w-xs"
                                    onClick={() => handlePaymentMethodSelect("Cash on Delivery")}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                            <Banknote className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Cash on Delivery</h3>
                                            <p className="text-xs text-muted-foreground">Pay when you receive</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Step 2: Payment Details Form */}
                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Customer Details */}
                                <div className="space-y-2">
                                    <h3 className="font-bold text-lg">Customer Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Delivery Address *</Label>
                                            <Input
                                                id="address"
                                                required
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="123 Main St, City"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Payment Method Specific Fields */}
                                {paymentMethod === "Card Payment" && (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg">Card Details</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="cardNumber">Card Number *</Label>
                                            <Input
                                                id="cardNumber"
                                                required
                                                value={formData.cardNumber}
                                                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cardExpiry">Expiry Date *</Label>
                                                <Input
                                                    id="cardExpiry"
                                                    required
                                                    value={formData.cardExpiry}
                                                    onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cardCVV">CVV *</Label>
                                                <Input
                                                    id="cardCVV"
                                                    type="password"
                                                    required
                                                    value={formData.cardCVV}
                                                    onChange={(e) => setFormData({ ...formData, cardCVV: e.target.value })}
                                                    placeholder="123"
                                                    maxLength={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === "Online Payment" && (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg">UPI Details</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="upiId">UPI ID *</Label>
                                            <Input
                                                id="upiId"
                                                required
                                                value={formData.upiId}
                                                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                                                placeholder="yourname@upi"
                                            />
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === "Cash on Delivery" && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            You will pay ₹{getCartTotal().toLocaleString()} in cash when your order is delivered.
                                        </p>
                                    </div>
                                )}

                                <Separator />

                                {/* Order Summary */}
                                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                                    <h3 className="font-bold">Order Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-semibold">₹{getCartTotal().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span className="font-semibold text-green-500">FREE</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-primary">₹{getCartTotal().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/30">
                                    {paymentMethod === "Cash on Delivery" ? "Place Order" : "Pay Now"}
                                </Button>
                            </form>
                        )}

                        {/* Step 3: Order Confirmation */}
                        {step === 3 && (
                            <div className="text-center space-y-6 py-8">
                                <div className="flex justify-center">
                                    <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Order Placed Successfully!</h3>
                                    <p className="text-muted-foreground">
                                        Thank you for your purchase. Your order will be delivered soon.
                                    </p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Order ID</span>
                                        <span className="font-mono font-semibold">#{generatedOrderId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Amount</span>
                                        <span className="font-bold text-primary">₹{getCartTotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment Method</span>
                                        <span className="font-semibold">{paymentMethod}</span>
                                    </div>
                                </div>
                                <Button onClick={handleConfirmOrder} className="w-full h-12 text-lg font-bold">
                                    Continue Shopping
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </>
    )
}
