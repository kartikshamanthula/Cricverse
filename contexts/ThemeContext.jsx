"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light")
    const [mounted, setMounted] = useState(false)

    // Load theme from localStorage on mount (defaults to light)
    useEffect(() => {
        setMounted(true)
        let savedTheme = localStorage.getItem("cricverse-theme")
        if (!localStorage.getItem("cricverse-theme-v2")) {
            savedTheme = "light"
            localStorage.setItem("cricverse-theme", "light")
            localStorage.setItem("cricverse-theme-v2", "true")
        }
        const activeTheme = savedTheme || "light"
        setTheme(activeTheme)
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add(activeTheme)
    }, [])

    // Save theme to localStorage and update document class when theme changes
    useEffect(() => {
        if (!mounted) return
        localStorage.setItem("cricverse-theme", theme)
        localStorage.setItem("cricverse-theme-v2", "true")
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
