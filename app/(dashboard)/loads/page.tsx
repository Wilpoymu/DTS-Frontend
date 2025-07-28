"use client"
import { useRouter } from "next/navigation"
import ActivePastLanes from "@/app/components/active-past-lanes"

export default function LoadsPage() {
  const router = useRouter()

  const handleNavigateToWaterfall = (waterfallId: string, loadInfo?: { loadId: string; laneId?: string; assignedTier?: string }) => {
    // Navegar a la página de carrier waterfalls con parámetros
    const params = new URLSearchParams()
    params.set('waterfallId', waterfallId)
    
    if (loadInfo) {
      params.set('loadId', loadInfo.loadId)
      if (loadInfo.laneId) {
        params.set('laneId', loadInfo.laneId)
      }
      if (loadInfo.assignedTier) {
        params.set('assignedTier', loadInfo.assignedTier)
      }
    }
    
    router.push(`/carrier-waterfalls?${params.toString()}`)
  }

  return <ActivePastLanes onNavigateToWaterfall={handleNavigateToWaterfall} />
}
