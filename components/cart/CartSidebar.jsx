"use client"

import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { CheckoutModal } from "./CheckoutModal"

export function CartSidebar() {
    const {
        cart,
        isCartOpen,
        toggleCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartCount,
        setIsCheckoutOpen
    } = useCart()

    if (!isCartOpen) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                onClick={toggleCart}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-card border-l border-border z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="h-6 w-6 text-primary" />
                            <div>
                                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                                <p className="text-sm text-muted-foreground">{getCartCount()} items</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={toggleCart} className="rounded-full">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-auto p-6 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <ShoppingBag className="h-20 w-20 text-muted-foreground/30" />
                            <div>
                                <h3 className="text-xl font-bold text-muted-foreground">Your cart is empty</h3>
                                <p className="text-sm text-muted-foreground">Add some items to get started!</p>
                            </div>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <Card key={item._id ?? item.id} className="p-4 bg-card/50 border-secondary/20">
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary/10 shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                {item.category}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                                        <p className="text-xs text-muted-foreground">{item.category}</p>
                                        <p className="text-lg font-bold text-primary mt-1">₹{item.price.toLocaleString()}</p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => updateQuantity(item._id ?? item.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => updateQuantity(item._id ?? item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                                                onClick={() => removeFromCart(item._id ?? item.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-border bg-card/80 backdrop-blur space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold">₹{getCartTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-semibold text-green-500">FREE</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">₹{getCartTotal().toLocaleString()}</span>
                            </div>
                        </div>
                        <Button
                            className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/30"
                            onClick={() => {
                                setIsCheckoutOpen(true)
                                toggleCart()
                            }}
                        >
                            Buy Now
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal rendering removed - now handled globally in layout.js */}
        </>
    )
}
