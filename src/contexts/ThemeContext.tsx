import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or default to system
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('leavehub-theme') as Theme) || 'system'
    }
    return 'system'
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // Function to get the actual theme (resolving 'system' to light/dark)
  const getActualTheme = (selectedTheme: Theme): 'light' | 'dark' => {
    if (selectedTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return selectedTheme
  }

  // Update actual theme when theme changes or system preference changes
  useEffect(() => {
    const newActualTheme = getActualTheme(theme)
    setActualTheme(newActualTheme)

    // Apply theme to document
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(newActualTheme)

    // Store theme preference
    localStorage.setItem('leavehub-theme', theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        setActualTheme(getActualTheme(theme))
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(getActualTheme(theme))
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('light')
    } else {
      // If system, toggle to opposite of current actual theme
      setTheme(actualTheme === 'light' ? 'dark' : 'light')
    }
  }

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme: handleSetTheme,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Hook for getting theme-aware classes
export function useThemeClasses() {
  const { actualTheme } = useTheme()
  
  return {
    // Background classes
    bgPrimary: actualTheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    bgSecondary: actualTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
    bgTertiary: actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100',
    
    // Text classes
    textPrimary: actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    textSecondary: actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    textTertiary: actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    
    // Border classes
    borderPrimary: actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    borderSecondary: actualTheme === 'dark' ? 'border-gray-600' : 'border-gray-300',
    
    // Card classes
    cardBg: actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    
    // Input classes
    inputBg: actualTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900',
    
    // Button classes
    buttonPrimary: actualTheme === 'dark' 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: actualTheme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600'
      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
  }
}