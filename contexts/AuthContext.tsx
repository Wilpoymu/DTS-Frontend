"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  isAuthenticated as checkAuth, 
  getCurrentUser, 
  loginUser, 
  registerUser, 
  logoutUser, 
  LocalUser 
} from '@/lib/auth-local'
import { loginApi, logoutApi } from '@/lib/auth-api'

interface AuthContextType {
  isAuthenticated: boolean
  currentUser: LocalUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => { success: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authenticated = checkAuth()
    const user = getCurrentUser()
    
    setIsAuthenticated(authenticated)
    setCurrentUser(user)
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 [AUTH-CONTEXT] Attempting login with:', { email, passwordLength: password.length })
      const res = await loginApi(email, password)
      console.log('🔐 [AUTH-CONTEXT] Login response:', res)
      
      if (res.jwt) {
        console.log('✅ [AUTH-CONTEXT] Login successful, token received')
        const user = { email, password, name: res.user?.email || email }
        setIsAuthenticated(true)
        setCurrentUser(user)
        return { success: true }
      } else {
        console.log('❌ [AUTH-CONTEXT] No JWT in response')
        return { success: false, error: "Login failed - No JWT received" }
      }
    } catch (error: any) {
      console.log('❌ [AUTH-CONTEXT] Login error:', error)
      return { success: false, error: error.message || "Login failed" }
    }
  }

  const register = (email: string, password: string, name: string) => {
    const res = registerUser(email, password, name)
    if (res.success) {
      setIsAuthenticated(true)
      setCurrentUser(getCurrentUser())
      return { success: true }
    } else {
      return { success: false, error: res.error || "Registration failed" }
    }
  }

  const logout = () => {
    logoutUser()
    logoutApi()
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
