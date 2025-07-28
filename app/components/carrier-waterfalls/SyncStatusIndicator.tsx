'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react'

interface SyncStatusIndicatorProps {
  getSyncStatus: () => {
    hasUnsyncedData: boolean;
    unsyncedCount: number;
    unsyncedItems: any[];
  };
  forceSyncAllData: () => Promise<void>;
  repairDataInconsistencies?: () => Promise<{ success: boolean; error?: string }>;
  className?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  getSyncStatus,
  forceSyncAllData,
  repairDataInconsistencies,
  className = ""
}) => {
  const [syncStatus, setSyncStatus] = useState(() => {
    // Llamada inicial segura
    try {
      return getSyncStatus()
    } catch (error) {
      console.warn('Error getting initial sync status:', error)
      return {
        hasUnsyncedData: false,
        unsyncedCount: 0,
        unsyncedItems: []
      }
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Actualizar estado cada 30 segundos
  useEffect(() => {
    if (!isMounted) return
    
    const interval = setInterval(() => {
      try {
        setSyncStatus(getSyncStatus())
      } catch (error) {
        console.warn('Error updating sync status:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [getSyncStatus, isMounted])

  // Escuchar eventos de actualización
  useEffect(() => {
    if (!isMounted) return
    
    const handleWaterfallUpdate = () => {
      try {
        setSyncStatus(getSyncStatus())
        setLastSync(new Date())
      } catch (error) {
        console.warn('Error handling waterfall update:', error)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('waterfallDataUpdated', handleWaterfallUpdate)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('waterfallDataUpdated', handleWaterfallUpdate)
      }
    }
  }, [getSyncStatus, isMounted])

  const handleForceSync = async () => {
    try {
      setIsLoading(true)
      await forceSyncAllData()
      setSyncStatus(getSyncStatus())
      setLastSync(new Date())
    } catch (error) {
      console.error('Error during manual sync:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepairData = async () => {
    if (!repairDataInconsistencies) return;
    
    try {
      setIsLoading(true)
      const result = await repairDataInconsistencies()
      if (result.success) {
        await forceSyncAllData() // Sync after repair
        setSyncStatus(getSyncStatus())
        setLastSync(new Date())
      }
    } catch (error) {
      console.error('Error during data repair:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-4 w-4 animate-spin" />
    }
    
    if (syncStatus.hasUnsyncedData) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = () => {
    if (isLoading) {
      return "Synchronizing..."
    }
    
    if (syncStatus.hasUnsyncedData) {
      return `${syncStatus.unsyncedCount} item${syncStatus.unsyncedCount > 1 ? 's' : ''} need sync`
    }
    
    return "All data synchronized"
  }

  const getStatusColor = () => {
    if (isLoading) {
      return "bg-blue-100 text-blue-800"
    }
    
    if (syncStatus.hasUnsyncedData) {
      return "bg-yellow-100 text-yellow-800"
    }
    
    return "bg-green-100 text-green-800"
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className={`flex items-center gap-2 ${getStatusColor()}`}
            >
              {getStatusIcon()}
              <span className="text-xs">{getStatusText()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p><strong>Sync Status:</strong></p>
              <p>{getStatusText()}</p>
              {lastSync && (
                <p className="text-xs text-gray-500 mt-1">
                  Last sync: {lastSync.toLocaleTimeString()}
                </p>
              )}
              {syncStatus.hasUnsyncedData && (
                <p className="text-xs text-yellow-600 mt-1">
                  Some data may be out of sync with the server
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleForceSync}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>

        {repairDataInconsistencies && syncStatus.hasUnsyncedData && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepairData}
                disabled={isLoading}
                className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700"
              >
                <AlertCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p>Repair data inconsistencies</p>
                <p className="text-xs text-gray-500">
                  Fix sync issues between local and server data
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

export default SyncStatusIndicator
