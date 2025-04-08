"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { setTheme } from "../redux/slices/settingsSlice"

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
  colors: {
    background: string
    text: string
    primary: string
    secondary: string
    card: string
    border: string
    notification: string
    error: string
    success: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch()
  const systemColorScheme = useColorScheme()
  const themePreference = useSelector((state: any) => state.settings.theme)

  // Use system theme by default, but respect user preference if set
  const [isDarkMode, setIsDarkMode] = useState(
    themePreference === "system" ? systemColorScheme === "dark" : themePreference === "dark",
  )

  useEffect(() => {
    if (themePreference === "system") {
      setIsDarkMode(systemColorScheme === "dark")
    }
  }, [systemColorScheme, themePreference])

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark"
    setIsDarkMode(!isDarkMode)
    dispatch(setTheme(newTheme))
  }

  const lightColors = {
    background: "#FFFFFF",
    text: "#1A1A1A",
    primary: "#FF5722",
    secondary: "#4CAF50",
    card: "#F5F5F5",
    border: "#E0E0E0",
    notification: "#FF9800",
    error: "#F44336",
    success: "#4CAF50",
  }

  const darkColors = {
    background: "#121212",
    text: "#FFFFFF",
    primary: "#FF5722",
    secondary: "#4CAF50",
    card: "#1E1E1E",
    border: "#333333",
    notification: "#FF9800",
    error: "#F44336",
    success: "#4CAF50",
  }

  const colors = isDarkMode ? darkColors : lightColors

  const value = {
    isDarkMode,
    toggleTheme,
    colors,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

