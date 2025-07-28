import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirigir automáticamente a carrier-waterfalls como página principal
  redirect('/carrier-waterfalls')
}
