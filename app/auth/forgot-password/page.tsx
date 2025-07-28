"use client"
import { useRouter } from "next/navigation"
import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  const router = useRouter()

  const handleChangeView = (view: string) => {
    switch (view) {
      case "login":
        router.push('/auth/login')
        break
      case "register":
        router.push('/auth/register')
        break
      case "activate":
        router.push('/auth/activate-account')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <ForgotPasswordForm onChangeView={handleChangeView} />
      </div>
    </div>
  )
}
