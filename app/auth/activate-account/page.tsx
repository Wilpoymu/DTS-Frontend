"use client"
import { useRouter } from "next/navigation"
import ActivateAccountForm from "@/app/components/auth/ActivateAccountForm"

export default function ActivateAccountPage() {
  const router = useRouter()

  const handleChangeView = (view: string) => {
    switch (view) {
      case "login":
        router.push('/auth/login')
        break
      case "register":
        router.push('/auth/register')
        break
      case "forgot":
        router.push('/auth/forgot-password')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <ActivateAccountForm onChangeView={handleChangeView} />
      </div>
    </div>
  )
}
