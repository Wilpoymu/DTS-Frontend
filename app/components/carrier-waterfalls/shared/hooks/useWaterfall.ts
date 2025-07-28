import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useLocalStorage } from './useLocalStorage'
import { useWaterfallsBackend } from '@/hooks/use-waterfalls-backend'
import { 
  transformLaneToBackendRequest, 
  prepareLocalData, 
  validateWaterfallData 
} from '@/lib/waterfall-backend-utils'
import { 
  Lane, 
  WaterfallItem, 
  CustomTier, 
  ViewStep, 
  CarrierWaterfallsProps 
} from '../types'

export const useWaterfall = (props: CarrierWaterfallsProps = {}) => {
  const { initialWaterfallId, loadInfo } = props
  const { toast } = useToast()
  const { 
    saveWaterfallToLocalStorage,
    loadWaterfallFromLocalStorage,
    clearWaterfallFromLocalStorage,
    saveCompletedWaterfall,
    getSavedWaterfalls
  } = useLocalStorage()

  // Hook para manejo de waterfalls en el backend
  const { 
    waterfalls: backendWaterfalls, 
    loading: backendLoading, 
    createWaterfall: createBackendWaterfall,
    updateWaterfall: updateBackendWaterfall,
    fetchWaterfalls: fetchBackendWaterfalls,
    syncWaterfallData,
    syncAllWaterfalls,
    checkSyncStatus,
    repairDataInconsistencies
  } = useWaterfallsBackend()

  console.log('useWaterfall initializing...', { props })

  // State
  const [currentStep, setCurrentStep] = useState<ViewStep>("lane-creation")
  const [currentLane, setCurrentLane] = useState<Lane | null>(null)
  const [waterfallItems, _setWaterfallItems] = useState<WaterfallItem[]>([])
  const [autoTierEnabled, setAutoTierEnabled] = useState<boolean>(false)
  const [customTiers, setCustomTiers] = useState<CustomTier[]>([])
  const [isEditingWaterfall, setIsEditingWaterfall] = useState(false)
  const [selectedWaterfallForDetails, setSelectedWaterfallForDetails] = useState<Lane | null>(null)
  const [savedWaterfalls, setSavedWaterfalls] = useState<Lane[]>([])
  const [showTriggeredWarning, setShowTriggeredWarning] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Helper function for setWaterfallItems with logging
  const setWaterfallItems = useCallback((items: WaterfallItem[]) => {
    console.log('🔧 Hook: setWaterfallItems called with:', {
      itemsCount: items.length,
      items: items.map(item => ({ 
        id: item.id, 
        name: item.carrier?.name, 
        rate: item.carrier?.rate 
      }))
    })
    _setWaterfallItems(items)
  }, [])
  
  // Load info states for navigation from loads
  const [highlightedLoadInfo, setHighlightedLoadInfo] = useState<{
    loadId: string
    laneId?: string
    assignedTier?: string
  } | null>(null)
  const [showLoadDetailsAlert, setShowLoadDetailsAlert] = useState(false)

  // Initialize component
  useEffect(() => {
    if (!isMounted) return
    
    console.log('useWaterfall useEffect running...')
    
    try {
      // Load from localStorage
      const storedWaterfall = loadWaterfallFromLocalStorage()
      console.log('Stored waterfall:', storedWaterfall)
      
      if (storedWaterfall) {
        setCurrentLane(storedWaterfall.lane)
        setWaterfallItems(storedWaterfall.waterfallItems || [])
        setAutoTierEnabled(storedWaterfall.autoTierEnabled || false)
        setCustomTiers(storedWaterfall.customTiers || [])
        if (storedWaterfall.lane) {
          setCurrentStep("waterfall-config")
        }
      }
      
      // Load saved waterfalls (combinar backend y localStorage)
      const saved = getSavedWaterfalls()
      const combined = [...backendWaterfalls, ...saved.filter(localWaterfall => 
        !backendWaterfalls.some(backendWaterfall => 
          backendWaterfall.originZip === localWaterfall.originZip &&
          backendWaterfall.destinationZip === localWaterfall.destinationZip &&
          backendWaterfall.equipmentType === localWaterfall.equipment
        )
      )]
      console.log('Combined waterfalls (backend + local):', combined.length)
      setSavedWaterfalls(combined)
    } catch (error) {
      console.error('Error in useWaterfall useEffect:', error)
    }
  }, [isMounted]) // Solo depender de isMounted para evitar llamadas circulares

  // Escuchar eventos de actualización de waterfalls
  useEffect(() => {
    const handleWaterfallUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent
      console.log('📢 Received waterfallDataUpdated event:', customEvent.detail)
      
      // Recargar waterfalls del backend
      await fetchBackendWaterfalls()
      
      // También recargar los del localStorage
      const savedLocal = getSavedWaterfalls()
      const combined = [...backendWaterfalls, ...savedLocal.filter(localWaterfall => 
        !backendWaterfalls.some(backendWaterfall => 
          backendWaterfall.originZip === localWaterfall.originZip &&
          backendWaterfall.destinationZip === localWaterfall.destinationZip &&
          backendWaterfall.equipmentType === localWaterfall.equipment
        )
      )]
      setSavedWaterfalls(combined)
      console.log('🔄 Updated savedWaterfalls list with', combined.length, 'items')
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('waterfallDataUpdated', handleWaterfallUpdate)
      console.log('🎧 Added listener for waterfallDataUpdated events')
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('waterfallDataUpdated', handleWaterfallUpdate)
        console.log('🗑️ Removed listener for waterfallDataUpdated events')
      }
    }
  }, [getSavedWaterfalls, fetchBackendWaterfalls, backendWaterfalls])

  // Handle navigation from loads
  useEffect(() => {
    if (initialWaterfallId && loadInfo) {
      const targetWaterfall = savedWaterfalls.find(w => w.id === initialWaterfallId)
      if (targetWaterfall) {
        setSelectedWaterfallForDetails(targetWaterfall)
        setCurrentStep("waterfall-details")
        setHighlightedLoadInfo(loadInfo)
        setShowLoadDetailsAlert(true)
        
        setTimeout(() => {
          setShowLoadDetailsAlert(false)
        }, 5000)
      }
    }
  }, [initialWaterfallId, loadInfo, savedWaterfalls])

  // Functions
  const saveWaterfall = useCallback(() => {
    if (currentLane && waterfallItems.length > 0) {
      const waterfallId = isEditingWaterfall && selectedWaterfallForDetails?.waterfall?.id 
        ? selectedWaterfallForDetails.waterfall.id 
        : Date.now().toString()
      
      const waterfallStatus = isEditingWaterfall && selectedWaterfallForDetails?.waterfall?.status
        ? selectedWaterfallForDetails.waterfall.status
        : "Draft"
      
      const waterfall = {
        id: waterfallId,
        items: waterfallItems,
        status: waterfallStatus as "Draft" | "Active",
        autoTierEnabled: autoTierEnabled,
        customTiers: customTiers
      }
      
      const laneWithWaterfall = isEditingWaterfall && selectedWaterfallForDetails
        ? { ...selectedWaterfallForDetails, waterfall }
        : { ...currentLane, waterfall }
      
      setCurrentLane(laneWithWaterfall)
      return laneWithWaterfall
    }
    return null
  }, [currentLane, waterfallItems, autoTierEnabled, customTiers, isEditingWaterfall, selectedWaterfallForDetails])

  const handleConfirmSave = useCallback(() => {
    if (currentLane && waterfallItems.length > 0) {
      saveCompletedWaterfall(currentLane, waterfallItems, autoTierEnabled, customTiers)
      
      const updatedSaved = getSavedWaterfalls()
      setSavedWaterfalls(updatedSaved)
      
      if (isEditingWaterfall) {
        toast({
          title: "Waterfall Updated!",
          description: "Your waterfall configuration has been updated successfully.",
        })
      } else {
        toast({
          title: "Waterfall Created!",
          description: "Your waterfall has been saved and is ready to use.",
        })
      }
    }
    
    clearWaterfallFromLocalStorage()
    
    // Reset state
    setCurrentStep("lane-creation")
    setCurrentLane(null)
    setWaterfallItems([])
    setAutoTierEnabled(false)
    setCustomTiers([])
    setIsEditingWaterfall(false)
    setSelectedWaterfallForDetails(null)
    setShowTriggeredWarning(false)
  }, [currentLane, waterfallItems, autoTierEnabled, customTiers, isEditingWaterfall, saveCompletedWaterfall, getSavedWaterfalls, clearWaterfallFromLocalStorage, toast])

  const handleBackToWaterfalls = useCallback(() => {
    setCurrentStep("lane-creation")
    setSelectedWaterfallForDetails(null)
    setWaterfallItems([])
    setIsEditingWaterfall(false)
    setShowTriggeredWarning(false)
  }, [])

  const handleEditWaterfall = useCallback(() => {
    if (selectedWaterfallForDetails) {
      setCurrentLane(selectedWaterfallForDetails)
      setWaterfallItems(selectedWaterfallForDetails.waterfall?.items || [])
      setAutoTierEnabled(selectedWaterfallForDetails.waterfall?.autoTierEnabled || false)
      setCustomTiers(selectedWaterfallForDetails.waterfall?.customTiers || [])
      setCurrentStep("waterfall-config")
      setIsEditingWaterfall(true)
      setShowTriggeredWarning(selectedWaterfallForDetails.status === "Triggered")
    }
  }, [selectedWaterfallForDetails])

  const handleViewWaterfallDetails = useCallback((lane: Lane) => {
    setSelectedWaterfallForDetails(lane)
    if (lane.waterfall) {
      setWaterfallItems(lane.waterfall.items)
      setCustomTiers(lane.waterfall.customTiers || [])
      if (lane.waterfall.autoTierEnabled !== undefined) {
        setAutoTierEnabled(lane.waterfall.autoTierEnabled)
      }
    } else {
      setWaterfallItems([])
      setCustomTiers([])
      setAutoTierEnabled(false)
    }
    setCurrentStep("waterfall-details")
    setIsEditingWaterfall(false)
    setShowTriggeredWarning(false)
  }, [])

  // Función para forzar sincronización de todos los datos
  const forceSyncAllData = useCallback(async () => {
    try {
      const result = await syncAllWaterfalls()
      if (result.success) {
        // Recargar datos locales también
        const savedLocal = getSavedWaterfalls()
        const combined = [...backendWaterfalls, ...savedLocal.filter(localWaterfall => 
          !backendWaterfalls.some(backendWaterfall => 
            backendWaterfall.originZip === localWaterfall.originZip &&
            backendWaterfall.destinationZip === localWaterfall.destinationZip &&
            backendWaterfall.equipmentType === localWaterfall.equipment
          )
        )]
        setSavedWaterfalls(combined)
        
        toast({
          title: "Sync completed",
          description: "All waterfall data has been synchronized successfully.",
        })
        
        console.log('✅ Full sync completed successfully')
      } else {
        toast({
          title: "Sync failed",
          description: result.error || "Could not synchronize all data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error during forced sync:', error)
      toast({
        title: "Sync error",
        description: "An error occurred during synchronization",
        variant: "destructive"
      })
    }
  }, [syncAllWaterfalls, getSavedWaterfalls, backendWaterfalls, toast])

  // Función para verificar el estado de sincronización
  const getSyncStatus = useCallback(() => {
    return checkSyncStatus()
  }, [checkSyncStatus])

  const saveWaterfallChanges = useCallback(async () => {
    console.log('🚀 saveWaterfallChanges called with:', {
      waterfallItemsCount: waterfallItems.length,
      currentLaneId: currentLane?.id,
      items: waterfallItems.map(item => ({ 
        id: item.id, 
        name: item.carrier?.name, 
        rate: item.carrier?.rate 
      })),
      autoTierEnabled,
      customTiersCount: customTiers.length
    })
    
    if (waterfallItems.length > 0 && currentLane) {
      try {
        // Validar datos antes de enviar
        const validation = validateWaterfallData(currentLane, waterfallItems)
        if (!validation.isValid) {
          toast({
            title: "Validation Error",
            description: validation.errors[0],
            variant: "destructive"
          })
          return
        }

        // Preparar datos para el backend
        const backendRequest = transformLaneToBackendRequest(currentLane, waterfallItems)
        const localData = prepareLocalData(autoTierEnabled, customTiers)

        // Determinar si es crear o actualizar
        const existingWaterfall = backendWaterfalls.find(w => 
          w.originZip === currentLane.originZip && 
          w.destinationZip === currentLane.destinationZip && 
          w.equipmentType === backendRequest.equipmentType
        )

        let result
        if (existingWaterfall && !isEditingWaterfall) {
          // Actualizar waterfall existente
          result = await updateBackendWaterfall(existingWaterfall.id, backendRequest, localData)
        } else {
          // Crear nuevo waterfall
          result = await createBackendWaterfall(backendRequest, localData)
        }

        if (result.success) {
          // Refrescar lista de waterfalls del backend
          await fetchBackendWaterfalls()
          
          // Sincronizar datos específicos del waterfall recién creado/actualizado
          if (result.data) {
            const localId = `backend-${result.data.id}`
            await syncWaterfallData(localId)
          }
          
          // Actualizar también el localStorage como respaldo
          saveCompletedWaterfall(currentLane, waterfallItems, autoTierEnabled, customTiers)
          const updatedSaved = getSavedWaterfalls()
          setSavedWaterfalls(updatedSaved)
          
          // Emitir evento para notificar a otros componentes
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('waterfallDataUpdated', {
              detail: { 
                laneId: currentLane.id,
                waterfallId: result.data?.id,
                action: existingWaterfall ? 'updated' : 'created'
              }
            })
            window.dispatchEvent(event)
            console.log('📢 Emitted waterfallDataUpdated event for lane:', currentLane.id)
          }
          
          // Limpiar el draft después de guardar permanentemente
          clearWaterfallFromLocalStorage()
          
          toast({
            title: "Changes saved",
            description: "Waterfall configuration has been saved to server successfully.",
          })
          
          console.log('✅ Waterfall saved successfully to backend and localStorage')
        } else {
          // Si falla el backend, guardar en localStorage como respaldo
          saveCompletedWaterfall(currentLane, waterfallItems, autoTierEnabled, customTiers)
          const updatedSaved = getSavedWaterfalls()
          setSavedWaterfalls(updatedSaved)
          
          toast({
            title: "Saved locally",
            description: `Could not sync to server: ${result.error}. Saved locally as backup.`,
            variant: "destructive"
          })
          
          console.warn('⚠️ Backend save failed, saved to localStorage:', result.error)
        }
      } catch (error) {
        console.error('Error saving waterfall:', error)
        
        // Fallback a localStorage en caso de error
        saveCompletedWaterfall(currentLane, waterfallItems, autoTierEnabled, customTiers)
        const updatedSaved = getSavedWaterfalls()
        setSavedWaterfalls(updatedSaved)
        
        toast({
          title: "Saved locally",
          description: "Could not connect to server. Saved locally as backup.",
          variant: "destructive"
        })
      }
    } else {
      console.warn('⚠️ Cannot save: missing items or lane', {
        hasItems: waterfallItems.length > 0,
        hasLane: !!currentLane
      })
    }
  }, [
    currentLane, 
    waterfallItems, 
    autoTierEnabled, 
    customTiers, 
    backendWaterfalls, 
    isEditingWaterfall,
    createBackendWaterfall, 
    updateBackendWaterfall, 
    fetchBackendWaterfalls,
    saveCompletedWaterfall, 
    getSavedWaterfalls, 
    clearWaterfallFromLocalStorage, 
    toast
  ])

  // Auto-save draft when data changes during editing
  useEffect(() => {
    if (currentLane && waterfallItems.length > 0 && currentStep === "waterfall-config") {
      const timeoutId = setTimeout(() => {
        console.log('Auto-saving draft changes to localStorage...')
        saveWaterfallToLocalStorage(currentLane, waterfallItems, autoTierEnabled, customTiers)
      }, 1000) // Debounce de 1 segundo

      return () => clearTimeout(timeoutId)
    }
  }, [waterfallItems, currentLane, autoTierEnabled, customTiers, currentStep, saveWaterfallToLocalStorage])

  return {
    // State
    currentStep,
    setCurrentStep,
    currentLane,
    setCurrentLane,
    waterfallItems,
    setWaterfallItems,
    autoTierEnabled,
    setAutoTierEnabled,
    customTiers,
    setCustomTiers,
    isEditingWaterfall,
    setIsEditingWaterfall,
    selectedWaterfallForDetails,
    setSelectedWaterfallForDetails,
    savedWaterfalls,
    setSavedWaterfalls,
    showTriggeredWarning,
    setShowTriggeredWarning,
    highlightedLoadInfo,
    setHighlightedLoadInfo,
    showLoadDetailsAlert,
    setShowLoadDetailsAlert,

    // Functions
    saveWaterfall,
    handleConfirmSave,
    handleBackToWaterfalls,
    handleEditWaterfall,
    handleViewWaterfallDetails,
    saveWaterfallChanges,
    getSavedWaterfalls,
    
    // Sync functions
    forceSyncAllData,
    getSyncStatus,
    syncWaterfallData,
    repairDataInconsistencies,

    // Backend data
    backendWaterfalls,
    backendLoading
  }
}
