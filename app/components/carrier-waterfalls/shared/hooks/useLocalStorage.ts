import { useCallback } from 'react'
import { Lane, WaterfallItem, CustomTier } from '../types'

export const useLocalStorage = () => {
  // Complete waterfall data functions
  const saveWaterfallToLocalStorage = useCallback((
    lane: Lane, 
    items: WaterfallItem[], 
    autoTier: boolean, 
    tiers: CustomTier[] = []
  ) => {
    if (typeof window === 'undefined') return
    
    try {
      const waterfallData = {
        lane,
        waterfallItems: items,
        autoTierEnabled: autoTier,
        customTiers: tiers,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('currentWaterfall', JSON.stringify(waterfallData))
    } catch (error) {
      console.error('Error saving waterfall to localStorage:', error)
    }
  }, [])

  const loadWaterfallFromLocalStorage = useCallback(() => {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem('currentWaterfall')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error loading waterfall from localStorage:', error)
      return null
    }
  }, [])

  const clearWaterfallFromLocalStorage = useCallback(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem('currentWaterfall')
    } catch (error) {
      console.error('Error clearing waterfall from localStorage:', error)
    }
  }, [])

  // Save completed waterfall permanently
  const saveCompletedWaterfall = useCallback((
    lane: Lane, 
    items: WaterfallItem[], 
    autoTier: boolean, 
    tiers: CustomTier[] = []
  ) => {
    if (typeof window === 'undefined') return
    
    try {
      const waterfallData = {
        lane: {
          ...lane,
          status: "Draft" as const
        },
        waterfallItems: items,
        autoTierEnabled: autoTier,
        customTiers: tiers,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(`savedWaterfall_${lane.id}`, JSON.stringify(waterfallData))
    } catch (error) {
      console.error('Error saving completed waterfall:', error)
    }
  }, [])

  // Get all saved waterfalls from localStorage
  const getSavedWaterfalls = useCallback(() => {
    if (typeof window === 'undefined') return []
    
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('savedWaterfall_'))
      return keys.map(key => {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        return {
          ...data.lane,
          waterfall: {
            id: data.lane.id,
            status: "Draft" as const,
            items: data.waterfallItems || [],
            autoTierEnabled: data.autoTierEnabled || false,
            customTiers: data.customTiers || []
          }
        }
      })
    } catch (error) {
      console.error('Error getting saved waterfalls:', error)
      return []
    }
  }, [])

  return {
    saveWaterfallToLocalStorage,
    loadWaterfallFromLocalStorage,
    clearWaterfallFromLocalStorage,
    saveCompletedWaterfall,
    getSavedWaterfalls
  }
}
