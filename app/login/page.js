"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const router = useRouter()

    const [loginForm, setLoginForm] = useState({ username: "", password: "" })

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const me = await login(loginForm.username, loginForm.password)
            toast.success("Welcome back!", { description: `Logged in as ${me.name}` })
            if (me.role === "admin") router.push("/admin/products")
            else router.push("/dashboard")
        } catch (err) {
            const errorMessage = err.message || "An unknown error occurred"

            if (errorMessage.toLowerCase().includes("deactivated")) {
                toast.error("Account Deactivated", {
                    description: "Your account has been deactivated by the administrator.",
                    duration: 6000
                })
            } else {
                toast.error("Login failed", { description: errorMessage })
            }
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
                            Manage Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Cricket Matches
                            </span>
                        </h1>
                        <p className="text-lg text-white/80 font-medium leading-relaxed">
                            Experience premium score tracking. Organize tournaments, manage teams, and witness real-time ball-by-ball updates like a pro.
                        </p>
                    </motion.div>

                    {/* Bottom Testimonial / Footer */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl max-w-sm"
                    >
                        <p className="text-white/80 italic mb-4">
                            "This platform completely changed how our league handles live match scoring and team management."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-lg">
                                MD
                            </div>
                            <div>
                                <p className="font-semibold text-sm">MS Dhoni</p>
                                <p className="text-xs text-white/50">League Organizer</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
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
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-muted-foreground text-sm">
                            Enter your credentials to access your dashboard.
                        </p>
                    </motion.div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/90">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                </div>
                                <Input
                                    placeholder="Enter your username"
                                    value={loginForm.username}
                                    onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                                    className="pl-10 h-12 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary transition-all rounded-xl"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/90">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={loginForm.password}
                                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                                    className="pl-10 pr-10 h-12 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary transition-all rounded-xl"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-12 text-md font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all"
                                disabled={loading}
                            >
                                {loading ? "Authenticating..." : "Sign In"}
                            </Button>
                        </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                Create an account
                            </Link>
                        </p>
                        
                        {/* <div className="mt-8 pt-6 border-t border-border/50">
                            <p className="text-xs text-muted-foreground">
                                Admin access? Use <span className="font-mono bg-muted px-1 py-0.5 rounded text-foreground">admin</span> with your password.
                            </p>
                        </div> */}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

