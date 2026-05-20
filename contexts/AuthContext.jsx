"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // Rehydrate session on mount
    useEffect(() => {
        fetch("/api/auth/me")
            .then(r => r.json())
            .then(data => setUser(data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    const login = async (username, password) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Login failed.")

        // Refresh user state
        const me = await fetch("/api/auth/me").then(r => r.json())
        setUser(me)
        return me
    }

    const register = async (username, name, password) => {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, name, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Registration failed.")

        const me = await fetch("/api/auth/me").then(r => r.json())
        setUser(me)
        return me
    }

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" })
        setUser(null)
        toast.success("Logged out successfully.")
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
