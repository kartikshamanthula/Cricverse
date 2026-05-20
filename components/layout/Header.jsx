"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, Bell, ShoppingCart, LogOut, UserCircle, Sun, Moon, Home, Users, Trophy, PenTool, ClipboardList, ShoppingBag, ChevronDown, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from "@/components/ui/badge";
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notifications } from "@/lib/notifications-data"
import { toast } from "sonner"

export function Header() {
    const router = useRouter()
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith('/admin')
    const { getCartCount, toggleCart } = useCart()
    const { theme, toggleTheme } = useTheme()
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const { user, logout } = useAuth()

    const handleLogout = () => logout()

    const handleProfile = () => {
        router.push('/profile')
    }

    return (
        <>
            <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex h-16 items-center justify-between px-6">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="h-12 w-12 transition-transform duration-200 group-hover:scale-105">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                {/* Blue 'C' shape */}
                                <path
                                    d="M70,25 C60,15 40,15 30,25 C15,40 15,60 30,75 C40,85 60,85 70,75"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                />
                                {/* Blue cricket ball */}
                                <circle cx="45" cy="50" r="18" fill="#3b82f6" />
                                <path d="M35,45 Q45,40 55,45" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                                <path d="M35,50 Q45,45 55,50" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                                <path d="M35,55 Q45,50 55,55" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                                {/* Green Checkmark */}
                                <path
                                    d="M50,60 L65,75 L90,40"
                                    fill="none"
                                    stroke="#22c55e"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                            CricVerse
                        </span>
                    </Link>

                    {/* Navigation Menu */}
                    <nav className="hidden md:flex items-center space-x-4">
                        {!isAdmin ? (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105">
                                        <Home className="h-4 w-4" />
                                        <span>Home</span>
                                    </Button>
                                </Link>
                                <Link href="/teams">
                                    <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105">
                                        <Users className="h-4 w-4" />
                                        <span>Teams</span>
                                    </Button>
                                </Link>
                                <Link href="/tournaments">
                                    <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105">
                                        <Trophy className="h-4 w-4" />
                                        <span>Tournaments</span>
                                    </Button>
                                </Link>
                                <Link href="/matches">
                                    <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105">
                                        <PenTool className="h-4 w-4" />
                                        <span>Matches</span>
                                    </Button>
                                </Link>
                                <Link href="/store">
                                    <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105">
                                        <ShoppingBag className="h-4 w-4" />
                                        <span>Store</span>
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/admin/products">
                                    <Button
                                        variant={pathname === '/admin/products' ? 'Primary' : 'ghost'}
                                        className={`gap-2 transition-all duration-200 ${pathname === '/admin/products' ? 'bg-primary/20 text-primary shadow-sm' : 'hover:bg-primary/10 hover:text-primary'}`}
                                    >
                                        <Package className="h-4 w-4" />
                                        <span>Products</span>
                                    </Button>
                                </Link>
                                <Link href="/admin/users">
                                    <Button
                                        variant={pathname === '/admin/users' ? 'Primary' : 'ghost'}
                                        className={`gap-2 transition-all duration-200 ${pathname === '/admin/users' ? 'bg-primary/20 text-primary shadow-sm' : 'hover:bg-primary/10 hover:text-primary'}`}
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Users</span>
                                    </Button>
                                </Link>
                                <Link href="/admin/orders">
                                    <Button
                                        variant={pathname === '/admin/orders' ? 'Primary' : 'ghost'}
                                        className={`gap-2 transition-all duration-200 ${pathname === '/admin/orders' ? 'bg-primary/20 text-primary shadow-sm' : 'hover:bg-primary/10 hover:text-primary'}`}
                                    >
                                        <ClipboardList className="h-4 w-4" />
                                        <span>Orders</span>
                                    </Button>
                                </Link>
                                <div className="h-6 w-[1px] bg-border mx-2" />
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1">
                                    Admin Panel
                                </Badge>
                            </>
                        )}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-2">
                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="relative h-9 w-9 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
                        >
                            {mounted && (theme === 'dark' ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            ))}
                        </Button>

                        {/* Cart Button — hidden on admin pages */}
                        {!isAdmin && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-9 w-9 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
                                onClick={toggleCart}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                {mounted && getCartCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-pulse">
                                        {getCartCount()}
                                    </span>
                                )}
                            </Button>
                        )}



                        {/* User Profile Dropdown */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-9 w-9 border border-border cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                                            {user.name?.slice(0, 2).toUpperCase() ?? "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="font-semibold">{user.name}</div>
                                        <div className="text-xs text-muted-foreground font-normal">@{user.username}</div>
                                        {user.role === "admin" && (
                                            <span className="text-xs text-primary font-semibold">Admin</span>
                                        )}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {!isAdmin && (
                                        <Link href="/orders">
                                            <DropdownMenuItem className="cursor-pointer">
                                                <ShoppingBag className="mr-2 h-4 w-4" />
                                                <span>My Orders</span>
                                            </DropdownMenuItem>
                                        </Link>
                                    )}
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <UserCircle className="h-4 w-4" /> Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Notifications Panel */}
            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </>
    );
}
