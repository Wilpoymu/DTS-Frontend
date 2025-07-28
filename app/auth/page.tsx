"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirigir automáticamente a login
    router.push('/auth/login')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-lg text-gray-700 font-medium">Redirecting...</span>
      </div>
    </div>
  )
}
