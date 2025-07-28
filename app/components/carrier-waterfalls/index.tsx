"use client"

import { useState, useEffect } from "react"
import { CarrierWaterfallsProps } from "./shared/types"
import { useGenericLocalStorage } from "./shared/hooks/useGenericLocalStorage"
import { useWaterfall } from "./shared/hooks/useWaterfall"
import LaneCreationView from "./lane-creation/LaneCreationView"
import WaterfallConfigView from "./waterfall-config/WaterfallConfigView"
import WaterfallDetailsView from "./waterfall-details/WaterfallDetailsView"
import SyncStatusIndicator from "./SyncStatusIndicator"

export default function CarrierWaterfall(props: CarrierWaterfallsProps = {}) {
  console.log('CarrierWaterfall component rendering...', { props })
  
  // Estados básicos para las vistas
  const [currentView, setCurrentView] = useState<'main' | 'lane-creation' | 'waterfall-config' | 'waterfall-details'>('main')
  
  // Test del hook useGenericLocalStorage
  const [testValue, setTestValue] = useGenericLocalStorage('carrierWaterfalls-test', 'default-value')
  
  // Hook principal de waterfall
  const waterfall = useWaterfall(props)

  // Si viene initialWaterfallId y loadInfo, mostrar detalles directamente
  useEffect(() => {
    if (props.initialWaterfallId && waterfall.savedWaterfalls.length > 0) {
      const target = waterfall.savedWaterfalls.find(wf => wf.id === props.initialWaterfallId)
      if (target) {
        waterfall.setSelectedWaterfallForDetails(target)
        waterfall.setCurrentStep('waterfall-details')
      }
    }
  }, [props.initialWaterfallId, waterfall.savedWaterfalls])
  
  // Vista principal - mostrar LaneCreationView como pantalla inicial
  if (currentView === 'main' || currentView === 'lane-creation') {
    return (
      <div className="space-y-4">
        {/* Indicador de sincronización */}
        <div className="flex justify-end">
          <SyncStatusIndicator
            getSyncStatus={waterfall.getSyncStatus}
            forceSyncAllData={waterfall.forceSyncAllData}
            repairDataInconsistencies={waterfall.repairDataInconsistencies}
          />
        </div>
        
        <LaneCreationView 
          savedWaterfalls={waterfall.savedWaterfalls}
          onCreateLane={(lane) => {
            waterfall.setCurrentLane(lane)
            waterfall.setCurrentStep('waterfall-config')
            setCurrentView('waterfall-config') // Ir directamente a la configuración
          }}
          onViewWaterfallDetails={(lane) => {
            waterfall.setSelectedWaterfallForDetails(lane)
            waterfall.setCurrentStep('waterfall-details')
            setCurrentView('waterfall-details') // Ir a la vista de detalles
          }}
        />
      </div>
    )
  }

  if (currentView === 'waterfall-config' && waterfall.currentLane) {
    return (
      <WaterfallConfigView
        currentLane={waterfall.currentLane}
        waterfallItems={waterfall.waterfallItems}
        autoTierEnabled={waterfall.autoTierEnabled}
        customTiers={waterfall.customTiers}
        onToggleAutoTier={waterfall.setAutoTierEnabled}
        onAddWaterfallItem={(item) => {
          const newItems = [...waterfall.waterfallItems, item]
          waterfall.setWaterfallItems(newItems)
        }}
        onRemoveWaterfallItem={(itemId) => {
          console.log('Router: Removing item with ID:', itemId)
          const newItems = waterfall.waterfallItems.filter(item => String(item.id) !== String(itemId))
          console.log('Router: Items after removal:', newItems.length)
          waterfall.setWaterfallItems(newItems)
        }}
        onUpdateWaterfallItems={(items) => {
          console.log('🔄 Router: Updating waterfall items from config view:', {
            itemsCount: items.length,
            items: items.map(item => ({ 
              id: item.id, 
              name: item.carrier?.name, 
              rate: item.carrier?.rate 
            }))
          })
          waterfall.setWaterfallItems(items)
        }}
        onSaveWaterfall={async () => {
          await waterfall.saveWaterfallChanges()
          setCurrentView('main')
        }}
        onBack={() => setCurrentView('main')}
        onCreateCustomTier={(tier) => {
          const newTiers = [...waterfall.customTiers, tier]
          waterfall.setCustomTiers(newTiers)
        }}
        onUpdateCustomTier={(tierId, updatedTier) => {
          const newTiers = waterfall.customTiers.map(tier => 
            tier.id === tierId ? updatedTier : tier
          )
          waterfall.setCustomTiers(newTiers)
        }}
        onDeleteCustomTier={(tierId) => {
          const newTiers = waterfall.customTiers.filter(tier => tier.id !== tierId)
          waterfall.setCustomTiers(newTiers)
        }}
      />
    )
  }

  // Vista de detalles del waterfall
  if (currentView === 'waterfall-details' && waterfall.selectedWaterfallForDetails) {
    return (
      <WaterfallDetailsView
        currentLane={waterfall.selectedWaterfallForDetails}
        waterfallItems={waterfall.selectedWaterfallForDetails.waterfall?.items || []}
        customTiers={waterfall.selectedWaterfallForDetails.waterfall?.customTiers || []}
        highlightedLoadInfo={waterfall.highlightedLoadInfo}
        showLoadDetailsAlert={waterfall.showLoadDetailsAlert}
        onBack={() => {
          waterfall.handleBackToWaterfalls()
          setCurrentView('main')
        }}
        onEditWaterfall={() => {
          waterfall.handleEditWaterfall()
          setCurrentView('waterfall-config')
        }}
        onPauseWaterfall={() => {
          // TODO: Implementar pausa del waterfall
          console.log('Pausing waterfall...')
        }}
        onResumeWaterfall={() => {
          // TODO: Implementar reanudación del waterfall
          console.log('Resuming waterfall...')
        }}
        onStopWaterfall={() => {
          // TODO: Implementar detención del waterfall
          console.log('Stopping waterfall...')
        }}
        onRestartWaterfall={() => {
          // TODO: Implementar reinicio del waterfall
          console.log('Restarting waterfall...')
        }}
      />
    )
  }
  
  // Fallback - esto no debería ejecutarse nunca porque main/lane-creation se manejan arriba
  return (
    <div>
      <p>Error: Unknown view state - {currentView}</p>
    </div>
  )
}
