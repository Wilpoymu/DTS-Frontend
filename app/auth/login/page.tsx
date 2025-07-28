"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/app/components/auth/LoginForm"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [authError, setAuthError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null)
    const result = await login(email, password)
    if (result.success) {
      router.push('/carrier-waterfalls')
    } else {
      setAuthError(result.error || "Login failed")
    }
  }

  const handleChangeView = (view: string) => {
    switch (view) {
      case "register":
        router.push('/auth/register')
        break
      case "forgot":
        router.push('/auth/forgot-password')
        break
      case "activate":
        router.push('/auth/activate-account')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <LoginForm 
          onChangeView={handleChangeView} 
          onLogin={handleLogin} 
          error={authError} 
        />
      </div>
    </div>
  )
}
