"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import RegisterForm from "@/app/components/auth/RegisterForm"
import { useAuth } from "@/contexts/AuthContext"

export default function RegisterPage() {
  const [authError, setAuthError] = useState<string | null>(null)
  const { register } = useAuth()
  const router = useRouter()

  const handleRegister = (email: string, password: string, name: string) => {
    setAuthError(null)
    const result = register(email, password, name)
    if (result.success) {
      router.push('/carrier-waterfalls')
    } else {
      setAuthError(result.error || "Registration failed")
    }
  }

  const handleChangeView = (view: string) => {
    switch (view) {
      case "login":
        router.push('/auth/login')
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
        <RegisterForm 
          onChangeView={handleChangeView} 
          onRegister={handleRegister} 
          error={authError} 
        />
      </div>
    </div>
  )
}
