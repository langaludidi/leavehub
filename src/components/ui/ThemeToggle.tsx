import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'switch'
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({ variant = 'icon', showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme()
  const [showDropdown, setShowDropdown] = useState(false)

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            actualTheme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <ThemeIcon theme={actualTheme} />
          {showLabel && (
            <span className="text-sm font-medium capitalize">
              {theme === 'system' ? 'Auto' : theme}
            </span>
          )}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            />
            <div className={`absolute right-0 mt-2 w-36 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-20 ${
              actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="py-1">
                {[
                  { value: 'light', label: 'Light', icon: '☀️' },
                  { value: 'dark', label: 'Dark', icon: '🌙' },
                  { value: 'system', label: 'Auto', icon: '💻' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTheme(option.value as 'light' | 'dark' | 'system')
                      setShowDropdown(false)
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                      theme === option.value
                        ? actualTheme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-700'
                        : actualTheme === 'dark'
                          ? 'text-gray-100 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  if (variant === 'switch') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {showLabel && (
          <span className={`text-sm font-medium ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Dark mode
          </span>
        )}
        <button
          onClick={toggleTheme}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            actualTheme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              actualTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    )
  }

  // Default icon variant
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        actualTheme === 'dark'
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400 focus:ring-offset-gray-800'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 focus:ring-offset-white'
      } ${className}`}
      title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <ThemeIcon theme={actualTheme} />
    </button>
  )
}

function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  if (theme === 'dark') {
    // Sun icon for dark mode (clicking will switch to light)
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    )
  }

  // Moon icon for light mode (clicking will switch to dark)
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  )
}

// Compact theme selector for settings
export function ThemeSelector({ className = '' }: { className?: string }) {
  const { theme, setTheme, actualTheme } = useTheme()

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className={`text-sm font-medium ${
        actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      }`}>
        Theme
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: 'light', label: 'Light', icon: '☀️' },
          { value: 'dark', label: 'Dark', icon: '🌙' },
          { value: 'system', label: 'Auto', icon: '💻' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
              theme === option.value
                ? actualTheme === 'dark'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-blue-500 bg-blue-50'
                : actualTheme === 'dark'
                  ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-lg mb-1">{option.icon}</span>
            <span className={`text-xs font-medium ${
              actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}