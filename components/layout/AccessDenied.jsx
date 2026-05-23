"use client"

import { ShieldAlert, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AccessDenied({ moduleName = "requested" }) {
    const router = useRouter()

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] left-[20%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-red-500/10 blur-[80px] sm:blur-[120px] animate-pulse" />
                <div className="absolute -bottom-[10%] right-[20%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-amber-500/10 blur-[80px] sm:blur-[120px] animate-pulse" />
            </div>

            {/* Glassmorphic Container */}
            <div className="relative z-10 max-w-md w-full bg-card/45 backdrop-blur-xl border border-border/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/30 text-center flex flex-col items-center">
                {/* Shield alert wrapper with premium animation */}
                <div className="relative mb-6 group">
                    {/* Ring light aura */}
                    <div className="absolute -inset-1.5 rounded-full bg-linear-to-r from-red-500 to-amber-500 opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                    
                    {/* Main Icon container */}
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-black/80 flex items-center justify-center border border-red-500/50">
                        <ShieldAlert className="h-9 w-9 sm:h-11 sm:w-11 text-red-500 animate-bounce" />
                    </div>
                </div>

                {/* Typography */}
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground uppercase mb-2 bg-gradient-to-r from-red-400 via-amber-400 to-red-400 bg-clip-text text-transparent">
                    Access Denied
                </h1>
                
                <h2 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    Permission Required
                </h2>
                
                <p className="text-sm text-muted-foreground/80 leading-relaxed mb-8">
                    You do not possess the required module privileges to access the <strong className="text-foreground capitalize">{moduleName}</strong> section. Please reach out to your administrator to request access.
                </p>

                {/* Interactive buttons with premium scale animation */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-xl border-border/60 hover:bg-muted/40 text-xs sm:text-sm font-bold tracking-wide hover:scale-102 transition-all gap-2"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                    <Button
                        className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border-0 shadow-lg shadow-red-500/20 text-xs sm:text-sm font-bold tracking-wide hover:scale-102 transition-all gap-2"
                        onClick={() => router.push("/dashboard")}
                    >
                        <Home className="h-4 w-4" />
                        Home
                    </Button>
                </div>
            </div>
        </div>
    )
}
