"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Trophy, ShoppingBag, Award, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
    {
        name: "Teams",
        href: "/teams",
        icon: Users,
    },
    {
        name: "Tournaments",
        href: "/tournaments",
        icon: Trophy,
    },
    {
        name: "Store",
        href: "/store",
        icon: ShoppingBag,
        special: true, // Mark Store as special for custom styling
    },
    {
        name: "Leaderboards",
        href: "/leaderboard",
        icon: Award,
    },
    {
        name: "Matches",
        href: "/matches",
        icon: Calendar,
    },
]

export function MobileFooterNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
            <div className="grid grid-cols-5 h-16">
                {navigationItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    const Icon = item.icon
                    const isStore = item.special

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 transition-colors relative",
                                isActive && !isStore
                                    ? "text-primary"
                                    : !isStore && "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isStore ? (
                                <div className="flex flex-col items-center justify-center gap-0.5">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md",
                                        isActive
                                            ? "bg-green-700 scale-105"
                                            : "bg-green-600 hover:bg-green-500"
                                    )}>
                                        <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-medium mt-0.5",
                                        isActive ? "text-green-600" : "text-muted-foreground"
                                    )}>{item.name}</span>
                                </div>
                            ) : (
                                <>
                                    <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
                                    <span className="text-[10px] font-medium">{item.name}</span>
                                </>
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
