"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingBag, Star, Loader2, Filter, ChevronLeft, ClipboardList, MessageCircle, X, Send, Bot, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export default function StorePage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [mounted, setMounted] = useState(false)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const { addToCart, getCartCount, toggleCart, setIsCheckoutOpen } = useCart()

    // AI Chatbot States
    const [chatOpen, setChatOpen] = useState(false)
    const [chatMessages, setChatMessages] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [chatLoading, setChatLoading] = useState(false)
    const [chatStyle, setChatStyle] = useState('')
    const [chatHeight, setChatHeight] = useState('')
    const [chatBudget, setChatBudget] = useState('')

    useEffect(() => {
        setMounted(true)
        fetch('/api/products?active=true')
            .then(r => r.json())
            .then(data => setProducts(Array.isArray(data) ? data : []))
            .catch(() => toast.error('Failed to load store inventory.'))
            .finally(() => setLoading(false))
    }, [])

    const categories = useMemo(() => {
        const catSet = new Set(products.map(p => p.category))
        return ["All", ...Array.from(catSet)]
    }, [products])

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleAddToCart = (e, product) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(product)
        toast.success("Added to Cart", {
            description: `${product.name} added to your bag.`
        })
    }

    const handleBuyNow = (e, product) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(product)
        setIsCheckoutOpen(true)
    }

    const sendChatMessage = async () => {
        if (!chatInput.trim()) return
        const userMsg = { role: 'user', content: chatInput.trim() }
        setChatMessages(prev => [...prev, userMsg])
        setChatInput('')
        setChatLoading(true)
        try {
            const res = await fetch('/api/ai/shop-consultant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    style: chatStyle,
                    height: chatHeight,
                    budget: chatBudget,
                    chatHistory: chatMessages.slice(-8),
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'AI failed')
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response,
                products: data.recommendedProducts || [],
            }])
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again!' }])
        } finally {
            setChatLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Ultra Premium Store Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/90 backdrop-blur-2xl shadow-md shadow-black/5">
                {/* Subtle gradient accent line at the very top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                {/* Main Header Row */}
                <div className="container max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-6">

                    {/* Left: Back + Brand */}
                    <div className="flex items-center gap-4 shrink-0">
                        <Link href="/dashboard" className="group flex items-center justify-center h-8 w-8 rounded-full border border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
                            <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>

                        <div className="flex items-center gap-2.5">
                            <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                                <ShoppingBag className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div className="leading-none">
                                <div className="text-[15px] font-extrabold tracking-tight text-foreground">
                                    CricVerse
                                </div>
                                <div className="text-[10px] font-semibold text-primary uppercase tracking-widest -mt-0.5">
                                    Store
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center: Search */}
                    <div className="flex-1 max-w-xl hidden md:block">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200" />
                            <Input
                                placeholder="Search bats, balls, gloves, gear..."
                                className="pl-10 h-10 bg-muted/20 border border-border/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-background rounded-full text-sm shadow-inner transition-all duration-200 placeholder:text-muted-foreground/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href="/orders"
                            className="flex items-center gap-2 px-4 h-9 rounded-full text-xs font-semibold border border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                        >
                            <ClipboardList className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline tracking-wide">My Orders</span>
                        </Link>

                        <Button
                            className="relative flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 h-9 text-xs font-bold shadow-md shadow-primary/25 transition-all duration-200"
                            onClick={toggleCart}
                        >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline tracking-wide">Cart</span>
                            {mounted && getCartCount() > 0 && (
                                <span suppressHydrationWarning className="flex items-center justify-center h-4 w-4 rounded-full bg-primary-foreground text-primary text-[9px] font-black">
                                    {getCartCount()}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Search Row */}
                <div className="md:hidden px-4 pb-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search bats, balls, gear..."
                            className="pl-10 h-9 bg-muted/20 border-border/50 rounded-full text-sm w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>


            <main className="container max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full md:w-56 shrink-0">
                        <div className="sticky top-24">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                Categories
                            </h3>
                            <div className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${selectedCategory === cat
                                                ? "bg-primary text-primary-foreground font-medium"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {selectedCategory === "All" ? "All Products" : selectedCategory}
                            </h1>
                            <span className="text-muted-foreground text-sm font-medium">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
                            </span>
                        </div>

                        {loading ? (
                            <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                                <span>Loading inventory...</span>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="h-[40vh] flex flex-col items-center justify-center border border-dashed border-border/50 rounded-2xl bg-muted/10">
                                <Search className="h-10 w-10 text-muted-foreground/50 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                                {(searchQuery || selectedCategory !== "All") && (
                                    <Button
                                        variant="outline"
                                        className="mt-6 rounded-full"
                                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                                    >
                                        Clear all filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product) => (
                                        <motion.div
                                            key={product._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            className="group relative flex flex-col"
                                        >
                                            {/* Product Image Box */}
                                            <div className="relative aspect-square w-full rounded-2xl bg-accent/20 border border-border/30 overflow-hidden mb-4">
                                                {/* Top tags */}
                                                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                                                    {product.stock <= 5 && product.stock > 0 && (
                                                        <Badge variant="destructive" className="bg-destructive/90 hover:bg-destructive text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                                                            Low Stock
                                                        </Badge>
                                                    )}
                                                    {product.stock <= 0 && (
                                                        <Badge variant="secondary" className="bg-background/80 hover:bg-background/90 text-foreground text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                                                            Sold Out
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="absolute top-3 right-3 z-10">
                                                    <div className="flex items-center gap-1 bg-background/80 backdrop-blur-md px-2 py-1 rounded-full border border-border/50 shadow-sm">
                                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-xs font-bold text-foreground">{product.rating}</span>
                                                    </div>
                                                </div>

                                                {/* Image */}
                                                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-contain p-6 mix-blend-multiply dark:mix-blend-normal drop-shadow-xl"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        />
                                                    ) : (
                                                        <h3 className="text-4xl sm:text-5xl font-black text-foreground/5 uppercase -rotate-12 select-none pointer-events-none">
                                                            {product.category}
                                                        </h3>
                                                    )}
                                                </div>

                                                {/* Hover Overlay Actions */}
                                                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent flex gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        className="flex-1 rounded-xl bg-background/90 hover:bg-background text-foreground font-semibold shadow-lg backdrop-blur-md"
                                                        onClick={(e) => handleBuyNow(e, product)}
                                                        disabled={product.stock <= 0}
                                                    >
                                                        Buy Now
                                                    </Button>
                                                    <Button
                                                        className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg backdrop-blur-sm"
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        disabled={product.stock <= 0}
                                                    >
                                                        Add to Bag
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex flex-col flex-1 px-1">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                        {product.name}
                                                    </h3>
                                                    <span className="font-bold text-lg whitespace-nowrap">
                                                        ₹{product.price.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold text-[10px] mb-2">{product.category}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
                                                    {product.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>

            {/* AI Chat Floating Orb */}
            <button
                onClick={() => setChatOpen(!chatOpen)}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/40 flex items-center justify-center hover:scale-110 transition-all duration-300 group"
            >
                {chatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-background animate-pulse" />
            </button>

            {/* AI Chat Drawer */}
            <AnimatePresence>
                {chatOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 400 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 400 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-24 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-background/95 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">CricVerse AI Assistant</h3>
                                    <p className="text-[10px] text-muted-foreground">Your personal cricket gear consultant</p>
                                </div>
                            </div>
                            {/* Quick Profile Inputs */}
                            <div className="flex gap-1.5 mt-3">
                                <select value={chatStyle} onChange={(e) => setChatStyle(e.target.value)} className="flex-1 text-[10px] px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-foreground">
                                    <option value="">Style</option>
                                    <option value="Aggressive Batsman">Aggressive Bat</option>
                                    <option value="Defensive Batsman">Defensive Bat</option>
                                    <option value="Fast Bowler">Fast Bowler</option>
                                    <option value="Spin Bowler">Spin Bowler</option>
                                    <option value="Wicketkeeper">Wicketkeeper</option>
                                    <option value="All-rounder">All-rounder</option>
                                </select>
                                <input
                                    value={chatHeight}
                                    onChange={(e) => setChatHeight(e.target.value)}
                                    placeholder="Height"
                                    className="w-16 text-[10px] px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground"
                                />
                                <input
                                    value={chatBudget}
                                    onChange={(e) => setChatBudget(e.target.value)}
                                    placeholder="Budget ₹"
                                    className="w-20 text-[10px] px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {chatMessages.length === 0 && (
                                <div className="text-center py-8">
                                    <Bot className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                    <p className="text-sm font-medium text-muted-foreground">Hi! I'm your AI cricket gear consultant.</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Ask me about bats, balls, gear, or anything cricket!</p>
                                    <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                                        {['Best bat for beginners?', 'Recommend gloves', 'What gear do I need?'].map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => { setChatInput(q); }}
                                                className="text-[10px] px-2.5 py-1 rounded-full border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-md'
                                        : 'bg-muted/50 text-foreground rounded-bl-md border border-border/30'
                                    }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        {/* Recommended Product Cards */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {msg.products.map((p) => (
                                                    <div key={p._id} className="bg-background/80 rounded-xl p-3 border border-border/50 flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {p.image ? (
                                                                <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
                                                            ) : (
                                                                <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-xs truncate">{p.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="font-bold text-xs text-primary">₹{p.price}</span>
                                                                <span className="text-[9px] text-yellow-500 flex items-center gap-0.5">
                                                                    <Star className="h-2.5 w-2.5 fill-yellow-500" />{p.rating}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                addToCart(p)
                                                                toast.success(`${p.name} added to cart!`)
                                                            }}
                                                            className="text-[9px] font-bold px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                                                        >
                                                            + Cart
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3 border border-border/30">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Thinking...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-3 border-t border-border/30 bg-background/50">
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }}
                                className="flex gap-2"
                            >
                                <input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask about cricket gear..."
                                    className="flex-1 text-sm px-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/60 transition-all"
                                    disabled={chatLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={chatLoading || !chatInput.trim()}
                                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-purple-500/25"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
