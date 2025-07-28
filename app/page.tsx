"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { autoInitializeDemoData } from "@/lib/demo-data-initializer"

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Inicializar datos de demo automáticamente al cargar la aplicación
    autoInitializeDemoData()
    
    if (!loading) {
      // MODO DEMO/TESTING - Siempre redirigir a carrier-waterfalls sin verificar autenticación
      router.push('/carrier-waterfalls')
      
      /* LÓGICA ORIGINAL CON AUTENTICACIÓN (COMENTADA PARA DEMO)
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
      */
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-lg text-gray-700 font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  return null
}
