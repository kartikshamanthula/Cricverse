"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem("cricverse-cart")
            if (savedCart) setCart(JSON.parse(savedCart))
        } catch { }
        setMounted(true)
    }, [])

    // Save cart to localStorage whenever it changes (client-only)
    useEffect(() => {
        if (!mounted) return
        try {
            localStorage.setItem("cricverse-cart", JSON.stringify(cart))
        } catch { }
    }, [cart, mounted])

    const getId = (p) => p._id ?? p.id

    const addToCart = (product) => {
        const pid = getId(product)
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => getId(item) === pid)
            if (existingItem) {
                return prevCart.map((item) =>
                    getId(item) === pid
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prevCart, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => getId(item) !== productId))
    }

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                getId(item) === productId ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setCart([])
    }

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0)
    }

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0)
    }

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen)
    }

    return (
        <CartContext.Provider
            value={{
                cart,
                isCartOpen,
                isCheckoutOpen,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartCount,
                toggleCart,
                setIsCartOpen,
                setIsCheckoutOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
