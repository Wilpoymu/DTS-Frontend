import { useState, useEffect } from 'react'

export function useGenericLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // Initialize state with default value
  const [value, setValue] = useState<T>(defaultValue)

  // Load value from localStorage on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        setValue(JSON.parse(stored))
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error)
    }
  }, [key])

  // Update localStorage when value changes
  const setStoredValue = (newValue: T) => {
    try {
      setValue(newValue)
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error)
    }
  }

  return [value, setStoredValue]
}
