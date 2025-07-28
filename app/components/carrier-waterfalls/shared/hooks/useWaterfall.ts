import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useLocalStorage } from './useLocalStorage'
import { useWaterfallsBackend } from '@/hooks/use-waterfalls-backend'
import { useIsDemoMode } from '@/hooks/use-demo-config'
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
    saveCompletedWaterfall,
    getSavedWaterfalls
  } = useLocalStorage()

  // Hook para manejo de waterfalls (backend)
  const {
    waterfalls: backendWaterfalls,
    loading: waterfallsLoading,
    error: waterfallsError,
    createWaterfall,
    updateWaterfall,
    fetchWaterfalls
  } = useWaterfallsBackend()
  const isDemoMode = useIsDemoMode()

  // Helper function to clear waterfall draft from localStorage
  const clearWaterfallFromLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentWaterfall')
    }
  }, [])

  // Estados del waterfall
  const [waterfallItems, setWaterfallItems] = useState<WaterfallItem[]>([])
  const [customTiers, setCustomTiers] = useState<CustomTier[]>([])
  const [autoTierEnabled, setAutoTierEnabled] = useState(false)
  const [currentLane, setCurrentLane] = useState<Lane | null>(null)
  const [currentStep, setCurrentStep] = useState<ViewStep>("lane-creation")
  const [isEditingWaterfall, setIsEditingWaterfall] = useState(false)
  const [showTriggeredWarning, setShowTriggeredWarning] = useState(false)
  const [savedWaterfalls, setSavedWaterfalls] = useState<any[]>([])

  // Funciones de sincronización (placeholder para compatibilidad)
  const syncWaterfallData = async (id: string) => {
    console.log('Sync not available in current mode');
  };
  const syncAllWaterfalls = async () => {
    console.log('Sync not available in current mode');
  };
  const checkSyncStatus = () => {
    return { hasInconsistencies: false, details: [] };
  };
  const repairDataInconsistencies = async () => {
    console.log('Repair not available in current mode');
  };

  // Cargar waterfalls al iniciar
  useEffect(() => {
    const loadInitialData = async () => {
      const savedLocal = getSavedWaterfalls()
      const combined = [...backendWaterfalls, ...savedLocal.filter(localWaterfall => 
        !backendWaterfalls.some((backendWaterfall: any) => 
          backendWaterfall.originZip === localWaterfall.originZip &&
          backendWaterfall.destinationZip === localWaterfall.destinationZip &&
          backendWaterfall.equipmentType === localWaterfall.equipment
        )
      )]
      setSavedWaterfalls(combined)
    }
    
    loadInitialData()
  }, [getSavedWaterfalls, backendWaterfalls])

  // Event listener para actualizaciones de waterfalls
  useEffect(() => {
    const handleWaterfallUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent
      console.log('📢 Received waterfallDataUpdated event:', customEvent.detail)
      
      // Recargar waterfalls del backend
      await fetchWaterfalls()
      
      // También recargar los del localStorage
      const savedLocal = getSavedWaterfalls()
      const combined = [...backendWaterfalls, ...savedLocal.filter(localWaterfall => 
        !backendWaterfalls.some((backendWaterfall: any) => 
          backendWaterfall.originZip === localWaterfall.originZip &&
          backendWaterfall.destinationZip === localWaterfall.destinationZip &&
          backendWaterfall.equipmentType === localWaterfall.equipment
        )
      )]
      setSavedWaterfalls(combined)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('waterfallDataUpdated', handleWaterfallUpdate)
      return () => {
        window.removeEventListener('waterfallDataUpdated', handleWaterfallUpdate)
      }
    }
  }, [getSavedWaterfalls, fetchWaterfalls, backendWaterfalls])

  // Cargar waterfall desde localStorage al iniciar
  useEffect(() => {
    if (initialWaterfallId) {
      // Si hay un ID inicial específico, podríamos buscar ese waterfall
      // Por ahora, simplemente cargamos el draft actual
      const savedData = loadWaterfallFromLocalStorage()
      if (savedData) {
        setCurrentLane(savedData.lane)
        setWaterfallItems(savedData.waterfallItems)
        setCustomTiers(savedData.customTiers || [])
        setAutoTierEnabled(savedData.autoTierEnabled || false)
        setCurrentStep("waterfall-details")
        setIsEditingWaterfall(true)
        console.log('Loaded waterfall from localStorage:', savedData)
      }
    } else {
      // Si no hay ID inicial, cargar cualquier waterfall guardado
      const saved = loadWaterfallFromLocalStorage()
      if (saved && saved.lane && saved.waterfallItems?.length > 0) {
        setCurrentLane(saved.lane)
        setWaterfallItems(saved.waterfallItems)
        setCustomTiers(saved.customTiers || [])
        setAutoTierEnabled(saved.autoTierEnabled || false)
        setCurrentStep("waterfall-details")
        setIsEditingWaterfall(false)
        setShowTriggeredWarning(true)
        console.log('Auto-loaded from localStorage:', saved)
      }
    }
  }, [initialWaterfallId, loadWaterfallFromLocalStorage])

  // Función para limpiar el estado
  const clearState = useCallback(() => {
    setWaterfallItems([])
    setCustomTiers([])
    setAutoTierEnabled(false)
    setCurrentLane(null)
    setCurrentStep("lane-creation")
    setIsEditingWaterfall(false)
    setShowTriggeredWarning(false)
    clearWaterfallFromLocalStorage()
  }, [clearWaterfallFromLocalStorage])

  // Función para reiniciar con una nueva lane
  const startNewWaterfall = useCallback(() => {
    if (waterfallItems.length > 0) {
      setWaterfallItems([])
      setCustomTiers([])
      setAutoTierEnabled(false)
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
      await syncAllWaterfalls()
      // Recargar datos locales también
      const savedLocal = getSavedWaterfalls()
      const combined = [...backendWaterfalls, ...savedLocal.filter(localWaterfall => 
        !backendWaterfalls.some((backendWaterfall: any) => 
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
    } catch (error) {
      console.error('Error during forced sync:', error)
      toast({
        title: "Sync failed",
        description: "Could not synchronize all data",
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
      const existingWaterfall = backendWaterfalls.find((w: any) => 
        w.originZip === currentLane.originZip && 
        w.destinationZip === currentLane.destinationZip && 
        w.equipmentType === backendRequest.equipmentType
      )

      try {
        if (existingWaterfall && !isEditingWaterfall) {
          // Actualizar waterfall existente
          await updateWaterfall(existingWaterfall.id, backendRequest, localData)
        } else {
          // Crear nuevo waterfall
          await createWaterfall(backendRequest, localData)
        }

        // Refrescar lista de waterfalls del backend
        await fetchWaterfalls()
        
        // Actualizar también el localStorage como respaldo
        saveCompletedWaterfall(currentLane, waterfallItems, autoTierEnabled, customTiers)
        const updatedSaved = getSavedWaterfalls()
        setSavedWaterfalls(updatedSaved)
        
        // Emitir evento para notificar a otros componentes
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('waterfallDataUpdated', {
            detail: { 
              laneId: currentLane.id,
              action: existingWaterfall ? 'updated' : 'created'
            }
          })
          window.dispatchEvent(event)
          console.log('📢 Emitted waterfallDataUpdated event for lane:', currentLane.id)
        }
        
        // **LIMPIAR EL DRAFT DESPUÉS DE GUARDAR PERMANENTEMENTE**
        clearWaterfallFromLocalStorage()

        toast({
          title: "Changes saved",
          description: "Waterfall configuration has been saved to server successfully.",
        })
        
        console.log('✅ Waterfall saved successfully to backend and localStorage')
      } catch (error) {
        console.error('Error saving waterfall:', error)
        
        // Si falla el backend, guardar en localStorage como respaldo
        saveCompletedWaterfall(currentLane, waterfallItems, autoTierEnabled, customTiers)
        const updatedSaved = getSavedWaterfalls()
        setSavedWaterfalls(updatedSaved)
        
        // Limpiar el draft temporal incluso cuando falla el backend
        clearWaterfallFromLocalStorage()
        
        toast({
          title: "Saved locally",
          description: `Could not sync to server. Saved locally as backup.`,
          variant: "destructive"
        })
        
        console.warn('⚠️ Backend save failed, saved to localStorage:', error)
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
    createWaterfall, 
    updateWaterfall, 
    fetchWaterfalls,
    saveCompletedWaterfall, 
    getSavedWaterfalls, 
    setSavedWaterfalls, 
    toast,
    clearWaterfallFromLocalStorage
  ])

  // Auto-save temporal al localStorage mientras el usuario edita
  useEffect(() => {
    if (currentLane && waterfallItems.length > 0) {
      const timeoutId = setTimeout(() => {
        saveWaterfallToLocalStorage(currentLane, waterfallItems, autoTierEnabled, customTiers)
      }, 2000) // Auto-save después de 2 segundos de inactividad
      
      return () => clearTimeout(timeoutId)
    }
  }, [currentLane, waterfallItems, autoTierEnabled, customTiers, saveWaterfallToLocalStorage])

  return {
    // Estado del waterfall
    waterfallItems,
    setWaterfallItems,
    customTiers,
    setCustomTiers,
    autoTierEnabled,
    setAutoTierEnabled,
    currentLane,
    setCurrentLane,
    currentStep,
    setCurrentStep,
    isEditingWaterfall,
    setIsEditingWaterfall,
    showTriggeredWarning,
    setShowTriggeredWarning,
    savedWaterfalls,
    setSavedWaterfalls,

    // Funciones de manejo de estado
    clearState,
    startNewWaterfall,
    saveWaterfallChanges,
    
    // Sync functions
    forceSyncAllData,
    getSyncStatus,
    syncWaterfallData,
    repairDataInconsistencies,

    // Backend data
    backendWaterfalls,
    backendLoading: waterfallsLoading
  }
}
