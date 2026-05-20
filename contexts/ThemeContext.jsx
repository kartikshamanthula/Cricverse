"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("dark")
    const [mounted, setMounted] = useState(false)

    // Load theme from localStorage on mount
    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem("cricverse-theme") || "dark"
        setTheme(savedTheme)
    }, [])

    // Save theme to localStorage and update document class when theme changes
    useEffect(() => {
        if (!mounted) return
        localStorage.setItem("cricverse-theme", theme)
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add(theme)
    }, [theme, mounted])

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark")
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
