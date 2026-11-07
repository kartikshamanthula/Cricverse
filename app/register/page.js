"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Eye, EyeOff, User, Lock, Mail } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [regForm, setRegForm] = useState({ username: "", name: "", password: "", confirm: "" })

    // Redirect already authenticated users away from /register
    useEffect(() => {
        if (!authLoading && user && typeof window !== "undefined") {
            window.location.replace(user.role === "admin" ? "/admin/products" : "/dashboard")
        }
    }, [user, authLoading])

    // Detect browser Back-Forward Cache (bfcache) restoration and force fresh state
    useEffect(() => {
        const handlePageShow = (event) => {
            if (event.persisted) {
                window.location.reload()
            }
        }
        window.addEventListener("pageshow", handlePageShow)
        return () => window.removeEventListener("pageshow", handlePageShow)
    }, [])

    const handleRegister = async (e) => {
        e.preventDefault()
        if (regForm.password !== regForm.confirm) {
            toast.error("Passwords don't match.")
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: regForm.username, name: regForm.name, password: regForm.password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Registration failed.")

            // Log out in case of stale session
            await fetch("/api/auth/logout", { method: "POST" })

            toast.success("Account created!", { description: "Please log in with your new credentials." })
            window.location.replace("/login")
        } catch (err) {
            toast.error("Registration failed", { description: err.message })
        } finally {
            setLoading(false)
        }
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
    }

    if (authLoading || user) {
        return null
    }

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Side - Branding (Hidden on small screens) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black">
                {/* Background Image Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2605&auto=format&fit=crop"
                        alt="Cricket Stadium at Night"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Left Side Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white w-full">
                    {/* Logo & Name */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-primary/50">
                            <svg viewBox="0 0 100 100" className="w-6 h-6">
                                <path d="M70,25 C60,15 40,15 30,25 C15,40 15,60 30,75 C40,85 60,85 70,75" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                                <circle cx="45" cy="50" r="18" fill="currentColor" />
                                <path d="M50,60 L65,75 L90,40" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight">CricVerse</span>
                    </div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-6 max-w-lg"
                    >
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Global Arena
                            </span>
                        </h1>
                        <p className="text-lg text-white/80 font-medium leading-relaxed">
                            Create a free account to start managing teams, tracking live scores, and competing on the global leaderboard.
                        </p>
                    </motion.div>

                    {/* Bottom Features List */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="flex gap-4 text-white/70 text-sm font-medium"
                    >
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Live Scoring</div>
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />Team Roster</div>
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" />Ball by Ball</div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-24 lg:p-32 bg-background relative overflow-hidden">
                {/* Decorative blobs for right side background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <motion.div
                    className="w-full max-w-md relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Mobile Logo (shown only on small screens) */}
                    <div className="flex lg:hidden items-center gap-3 mb-10">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                            <svg viewBox="0 0 100 100" className="w-8 h-8 text-primary">
                                <path d="M70,25 C60,15 40,15 30,25 C15,40 15,60 30,75 C40,85 60,85 70,75" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                                <circle cx="45" cy="50" r="18" fill="currentColor" />
                                <path d="M50,60 L65,75 L90,40" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">CricVerse</span>
                    </div>

                    <motion.div variants={itemVariants} className="mb-8">
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Create Account</h2>
                        <p className="text-muted-foreground text-sm">
                            Join the ultimate cricket management platform today.
                        </p>
                    </motion.div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Full Name */}
                            <motion.div variants={itemVariants} className="space-y-1.5 col-span-2">
                                <label className="text-sm font-semibold text-foreground/90">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    </div>
                                    <Input
                                        placeholder="Enter your full name"
                                        value={regForm.name}
                                        onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                                        className="pl-10 h-11 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary transition-all rounded-xl"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* Username */}
                            <motion.div variants={itemVariants} className="space-y-1.5 col-span-2">
                                <label className="text-sm font-semibold text-foreground/90">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    </div>
                                    <Input
                                        placeholder="Enter your username"
                                        value={regForm.username}
                                        onChange={e => setRegForm(f => ({ ...f, username: e.target.value }))}
                                        className="pl-10 h-11 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary transition-all rounded-xl"
                                        required
                                        autoComplete="username"
                                        minLength={3}
                                        maxLength={20}
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div variants={itemVariants} className="space-y-1.5 col-span-2 sm:col-span-1">
                                <label className="text-sm font-semibold text-foreground/90">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    </div>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 6 chars"
                                        value={regForm.password}
                                        onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                                        className="pl-10 pr-10 h-11 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary transition-all rounded-xl"
                                        required
                                        autoComplete="new-password"
                                        minLength={6}
                                    />
                                </div>
                            </motion.div>

                            {/* Confirm Password */}
                            <motion.div variants={itemVariants} className="space-y-1.5 col-span-2 sm:col-span-1">
                                <label className="text-sm font-semibold text-foreground/90">Confirm</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    </div>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Repeat"
                                        value={regForm.confirm}
                                        onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))}
                                        className="pl-10 h-11 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary transition-all rounded-xl"
                                        required
                                        autoComplete="new-password"
                                        minLength={6}
                                    />
                                    {/* Only show the eye toggle on the first password field for cleaner UI, but it controls both */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => !s)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors sm:hidden"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        <div className="flex justify-end mb-2 sm:mt-1 pr-1 hidden sm:flex">
                            <button
                                type="button"
                                onClick={() => setShowPassword(s => !s)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                {showPassword ? "Hide passwords" : "Show passwords"}
                            </button>
                        </div>

                        <motion.div variants={itemVariants} className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-12 text-md font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all"
                                disabled={loading}
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </Button>
                        </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
