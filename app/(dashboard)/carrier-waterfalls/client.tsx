"use client"
import { useSearchParams } from "next/navigation"
import CarrierWaterfalls from "@/app/components/carrier-waterfalls"

export default function CarrierWaterfallsClient() {
  const searchParams = useSearchParams()
  
  // Extraer parámetros de navegación desde la URL
  const waterfallId = searchParams.get('waterfallId')
  const loadId = searchParams.get('loadId')
  const laneId = searchParams.get('laneId')
  const assignedTier = searchParams.get('assignedTier')

  // Construir props de navegación si están presentes
  const props = {
    ...(waterfallId && { initialWaterfallId: waterfallId }),
    ...(loadId && {
      loadInfo: {
        loadId,
        ...(laneId && { laneId }),
        ...(assignedTier && { assignedTier })
      }
    })
  }

  console.log('CarrierWaterfallsClient - Props:', props)

  return <CarrierWaterfalls {...props} />
}
