"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Settings, Truck, Plus, Trash2, Eye, Clock, Users, GripVertical, Edit, Search, X, Calendar, CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCarriersAdaptive } from "@/hooks/use-carriers-adaptive"

interface WaterfallConfigViewProps {
  currentLane: any
  waterfallItems: any[]
  autoTierEnabled: boolean
  customTiers: any[]
  onToggleAutoTier: (enabled: boolean) => void
  onSaveWaterfall: () => Promise<void>
  onBack: () => void
  onAddWaterfallItem?: (item: any) => void
  onRemoveWaterfallItem?: (itemId: string) => void  // Cambiado de (index: number) a (itemId: string)
  onUpdateWaterfallItems?: (items: any[]) => void
  onCreateCustomTier: (tier: any) => void
  onUpdateCustomTier: (tierId: string, updatedTier: any) => void
  onDeleteCustomTier: (tierId: string) => void
}

export default function WaterfallConfigView({
  currentLane,
  waterfallItems,
  autoTierEnabled,
  customTiers,
  onToggleAutoTier,
  onSaveWaterfall,
  onBack,
  onAddWaterfallItem,
  onRemoveWaterfallItem,
  onUpdateWaterfallItems,
  onCreateCustomTier,
  onUpdateCustomTier,
  onDeleteCustomTier
}: WaterfallConfigViewProps) {
  // Hook para obtener carriers del backend
  const { 
    carriers, 
    loading: carriersLoading, 
    error: carriersError, 
    fetchCarriers 
  } = useCarriersAdaptive()
  const { toast } = useToast()
  
  // Estados para los modales
  const [showCarrierSearch, setShowCarrierSearch] = useState(false)
  const [showCarrierDetails, setShowCarrierDetails] = useState(false)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCarrier, setEditingCarrier] = useState<any>(null)

  // Estados para el modal de disponibilidad
  const [tempAvailability, setTempAvailability] = useState<any[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [dailyCapacity, setDailyCapacity] = useState(1)

  // Estados para custom tiers
  const [showCreateTierModal, setShowCreateTierModal] = useState(false)
  const [editingTier, setEditingTier] = useState<any>(null)
  const [newTierName, setNewTierName] = useState('')
  const [selectedCarriersForTier, setSelectedCarriersForTier] = useState<string[]>([])

  // Estado para modal de confirmación de guardado
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  
  // Estado para el feedback del botón Save Changes
  const [isSavingChanges, setIsSavingChanges] = useState(false)

  // Estados para drag and drop
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null)
  
  // Estado local para manejar los items del waterfall
  const [localWaterfallItems, setLocalWaterfallItems] = useState(waterfallItems)

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Sincronizar estado local con props
  React.useEffect(() => {
    setLocalWaterfallItems(waterfallItems)
  }, [waterfallItems])

  // Auto-guardar cambios en draft cuando se modifican los items localmente
  React.useEffect(() => {
    if (localWaterfallItems.length > 0 && onUpdateWaterfallItems) {
      // Debounce para evitar demasiadas actualizaciones
      const timeoutId = setTimeout(() => {
        console.log('Auto-saving draft changes to parent...')
        onUpdateWaterfallItems(localWaterfallItems)
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [localWaterfallItems, onUpdateWaterfallItems])

  // Función helper para sincronizar cambios con el componente padre
  const syncWithParent = (newItems: any[]) => {
    console.log('syncWithParent called with', newItems.length, 'items')
    console.log('Item IDs:', newItems.map(item => ({ id: item.id, name: item.carrier?.name })))
    
    setLocalWaterfallItems(newItems)
    
    // Si existe la función del padre, la usamos, sino manejamos localmente
    if (onUpdateWaterfallItems) {
      console.log('Calling onUpdateWaterfallItems with new items')
      onUpdateWaterfallItems(newItems)
    } else {
      // Actualización temporal local - el estado local será la fuente de verdad
      console.log('No onUpdateWaterfallItems available, using local state')
    }
  }

  // Funciones para manejar el flujo de añadir carriers
  const addCarrier = () => {
    setShowCarrierSearch(true)
  }

  const selectCarrier = (carrier: any) => {
    setEditingCarrier({ ...carrier })
    setShowCarrierSearch(false)
    setShowCarrierDetails(true)
  }

  const saveCarrierDetails = () => {
    if (!editingCarrier) return
    
    // Buscar si el carrier ya existe en la lista (modo edición)
    const existingItemIndex = localWaterfallItems.findIndex(item => item.carrier?.id === editingCarrier.id)
    
    let updatedItems
    
    if (existingItemIndex !== -1) {
      // Modo edición: actualizar el carrier existente
      console.log('Editing existing carrier with ID:', editingCarrier.id, 'Name:', editingCarrier.name)
      updatedItems = localWaterfallItems.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, carrier: editingCarrier }
          : item
      )
    } else {
      // Modo agregar: crear un nuevo carrier
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newItem = {
        id: uniqueId,
        carrier: editingCarrier,
        responseWindow: 30 // default
      }
      console.log('Adding new carrier with ID:', uniqueId, 'Carrier:', editingCarrier.name)
      updatedItems = [...localWaterfallItems, newItem]
      onAddWaterfallItem?.(newItem)
    }
    
    // Actualizar el estado local inmediatamente
    setLocalWaterfallItems(updatedItems)
    // Y sincronizar con el padre
    syncWithParent(updatedItems)
    
    setShowCarrierDetails(false)
    setEditingCarrier(null)
  }

  const cancelCarrierDetails = () => {
    setShowCarrierDetails(false)
    setEditingCarrier(null)
  }

  // Funciones para el modal de disponibilidad
  const openAvailabilityModal = () => {
    setTempAvailability(editingCarrier?.availability || [])
    setShowAvailabilityModal(true)
  }

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const addDailyCapacityRule = () => {
    if (selectedDays.length === 0) return
    
    const newRule = {
      id: `${Date.now()}`,
      days: [...selectedDays],
      capacity: dailyCapacity
    }
    
    setTempAvailability(prev => [...prev, newRule])
    setSelectedDays([])
    setDailyCapacity(1)
  }

  const removeDailyCapacityRule = (ruleId: string) => {
    setTempAvailability(prev => prev.filter(rule => rule.id !== ruleId))
  }

  const saveDailyCapacity = () => {
    const updatedCarrier = {
      ...editingCarrier,
      availability: [...tempAvailability]
    }
    
    // Actualizar el carrier en el estado de edición
    setEditingCarrier(updatedCarrier)
    
    // Actualizar el item del waterfall con la nueva disponibilidad
    const updatedItems = localWaterfallItems.map(item => 
      item.carrier?.id === editingCarrier?.id 
        ? { ...item, carrier: updatedCarrier }
        : item
    )
    
    if (updatedItems.some(item => item.carrier?.id === editingCarrier?.id)) {
      syncWithParent(updatedItems)
    }
    
    setShowAvailabilityModal(false)
  }

  const cancelDailyCapacity = () => {
    setTempAvailability([])
    setSelectedDays([])
    setDailyCapacity(1)
    setShowAvailabilityModal(false)
  }

  // Funciones para custom tiers
  const openCreateTierModal = () => {
    setEditingTier(null)
    setNewTierName('')
    setSelectedCarriersForTier([])
    setShowCreateTierModal(true)
  }

  const openEditTierModal = (tier: any) => {
    setEditingTier(tier)
    setNewTierName(tier.name)
    setSelectedCarriersForTier([...tier.carrierIds])
    setShowCreateTierModal(true)
  }

  const cancelTierModal = () => {
    setShowCreateTierModal(false)
    setEditingTier(null)
    setNewTierName('')
    setSelectedCarriersForTier([])
  }

  const toggleCarrierSelection = (carrierId: string) => {
    setSelectedCarriersForTier(prev => 
      prev.includes(carrierId) 
        ? prev.filter(id => id !== carrierId)
        : [...prev, carrierId]
    )
  }

  const createCustomTier = () => {
    if (!newTierName.trim() || selectedCarriersForTier.length === 0) return

    const newTier = {
      id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newTierName.trim(),
      carrierIds: [...selectedCarriersForTier],
      order: customTiers.length + 1
    }

    // Usar la función del padre para crear el tier
    onCreateCustomTier(newTier)
    cancelTierModal()
  }

  const updateCustomTier = () => {
    if (!editingTier || !newTierName.trim() || selectedCarriersForTier.length === 0) return

    const updatedTier = {
      ...editingTier,
      name: newTierName.trim(),
      carrierIds: [...selectedCarriersForTier]
    }

    // Usar la función del padre para actualizar el tier
    onUpdateCustomTier(editingTier.id, updatedTier)
    cancelTierModal()
  }

  const deleteCustomTier = (tierId: string) => {
    // Usar la función del padre para eliminar el tier
    onDeleteCustomTier(tierId)
  }

  // Funciones de drag and drop
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItemId(itemId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverItemId(itemId)
  }

  const handleDragLeave = () => {
    setDragOverItemId(null)
  }

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault()
    
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null)
      setDragOverItemId(null)
      return
    }

    const draggedIndex = localWaterfallItems.findIndex(item => item.id === draggedItemId)
    const targetIndex = localWaterfallItems.findIndex(item => item.id === targetItemId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newItems = [...localWaterfallItems]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    syncWithParent(newItems)
    setDraggedItemId(null)
    setDragOverItemId(null)
  }

  const handleDragEnd = () => {
    setDraggedItemId(null)
    setDragOverItemId(null)
  }

  // Funciones para actualizar campos individuales
  const updateCarrierRate = (itemId: string, rate: number) => {
    const updatedItems = localWaterfallItems.map(item => 
      item.id === itemId 
        ? { ...item, carrier: { ...item.carrier, rate } }
        : item
    )
    
    console.log('updateCarrierRate: Updating local state and syncing with parent')
    console.log('updateCarrierRate: Updated item rate:', updatedItems.find(item => item.id === itemId)?.carrier.rate)
    
    // Actualizar el estado local inmediatamente
    setLocalWaterfallItems(updatedItems)
    // Y sincronizar con el padre
    syncWithParent(updatedItems)
  }

  const updateResponseWindow = (itemId: string, window: number) => {
    const updatedItems = localWaterfallItems.map(item => 
      item.id === itemId 
        ? { ...item, responseWindow: window }
        : item
    )
    
    console.log('updateResponseWindow: Updating local state and syncing with parent')
    
    // Actualizar el estado local inmediatamente
    setLocalWaterfallItems(updatedItems)
    // Y sincronizar con el padre
    syncWithParent(updatedItems)
  }

  const removeCarrier = (itemId: string) => {
    console.log('Removing carrier with ID:', itemId)
    const itemToRemove = localWaterfallItems.find(item => item.id === itemId)
    console.log('Found item to remove:', itemToRemove)
    
    const updatedItems = localWaterfallItems.filter(item => item.id !== itemId)
    console.log('Updated items after removal:', updatedItems.length, 'items remaining')
    
    // Actualizar el estado local inmediatamente
    setLocalWaterfallItems(updatedItems)
    // Y sincronizar con el padre
    syncWithParent(updatedItems)
    
    // Notificar al componente padre usando el ID correcto
    if (onRemoveWaterfallItem) {
      onRemoveWaterfallItem(itemId)
    }
  }

  const openCarrierDetailsModal = (carrier: any) => {
    setEditingCarrier({ ...carrier })
    setShowCarrierDetails(true)
  }

  const openDailyCapacityModal = (carrier: any) => {
    setEditingCarrier({ ...carrier })
    setTempAvailability(carrier?.availability || [])
    setShowAvailabilityModal(true)
  }

  // Función para guardar cambios parciales (draft save)
  const saveChanges = async () => {
    setIsSavingChanges(true)
    
    try {
      // Sincronizar cambios con el padre (esto guarda en localStorage como draft)
      if (onUpdateWaterfallItems) {
        onUpdateWaterfallItems(localWaterfallItems)
      }
      
      // Simular un pequeño delay para mostrar el feedback visual
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mostrar toast de confirmación
      toast({
        title: "✅ Changes Saved",
        description: `Draft updated with ${localWaterfallItems.length} carriers and ${customTiers.length} custom tiers.`,
        duration: 3000,
      })
      
      console.log('Saving draft changes with items:', localWaterfallItems)
    } catch (error) {
      toast({
        title: "❌ Error Saving Changes",
        description: "There was an issue saving your changes. Please try again.",
        duration: 4000,
      })
    } finally {
      setIsSavingChanges(false)
    }
  }

  // Función para guardar configuración final (guardar definitivamente y regresar)
  const saveWaterfallConfiguration = () => {
    // Primero sincronizar cualquier cambio pendiente con el padre
    if (onUpdateWaterfallItems) {
      console.log('🔄 Syncing changes with parent before save:', {
        localItemsCount: localWaterfallItems.length,
        items: localWaterfallItems.map(item => ({ 
          id: item.id, 
          name: item.carrier?.name, 
          rate: item.carrier?.rate 
        }))
      })
      onUpdateWaterfallItems(localWaterfallItems)
    }
    
    // Pequeño delay para asegurar la sincronización, luego mostrar modal
    setTimeout(() => {
      setShowSaveConfirmModal(true)
    }, 100)
  }

  const confirmSaveWaterfall = async () => {
    console.log('💾 Confirming waterfall save with final data:', {
      localItemsCount: localWaterfallItems.length,
      items: localWaterfallItems.map(item => ({ 
        id: item.id, 
        name: item.carrier?.name, 
        rate: item.carrier?.rate 
      }))
    })
    
    try {
      // Una última sincronización antes del guardado definitivo
      if (onUpdateWaterfallItems) {
        onUpdateWaterfallItems(localWaterfallItems)
      }
      
      // Ejecutar el guardado real definitivo
      await onSaveWaterfall()
      setShowSaveConfirmModal(false)
      
      // Mostrar toast de éxito (el toast ya se muestra en saveWaterfallChanges)
    } catch (error) {
      console.error('Error confirming save waterfall:', error)
      toast({
        title: "Error saving waterfall",
        description: "There was an error saving the waterfall configuration.",
        variant: "destructive"
      })
    }
  }

  const cancelSaveWaterfall = () => {
    setShowSaveConfirmModal(false)
  }

  // Transformar carriers del backend para compatibilidad con el formato esperado
  const transformedCarriers = carriers
    .filter(carrier => carrier.status === "ACTIVE") // Solo carriers activos
    .map(carrier => ({
      id: String(carrier.id),
      name: carrier.name,
      mcNumber: carrier.mc,
      contactEmail: carrier.primaryContact?.email || '',
      contactName: carrier.primaryContact?.name || '',
      secondaryContactName: carrier.secondaryContact?.name || '',
      secondaryContactEmail: carrier.secondaryContact?.email || '',
      assignedRep: carrier.assignedRep || 'Unassigned',
      carrierMcNumber: carrier.mc,
      rate: parseFloat(carrier.averageRate?.replace(/[^0-9.]/g, '') || '0'),
      acceptancePercentage: carrier.acceptanceRate || 0,
      onTimePickupPercentage: carrier.onTimePickup || 0,
      onTimeDeliveryPercentage: carrier.onTimeDelivery || 0
    }))

  // Filtrar carriers para búsqueda
  const filteredCarriers = transformedCarriers.filter(carrier => 
    !localWaterfallItems.some(item => item.carrier?.id === carrier.id) &&
    (carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     carrier.mcNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Manejar estados de loading y error para carriers
  if (carriersLoading) {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <Button onClick={onBack} variant="outline" size="sm" style={{ marginRight: '10px' }}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading carriers...</span>
        </div>
      </div>
    )
  }

  if (carriersError) {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <Button onClick={onBack} variant="outline" size="sm" style={{ marginRight: '10px' }}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500 mb-4">Error loading carriers: {carriersError}</p>
            <Button onClick={() => fetchCarriers()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Button onClick={onBack} variant="outline" size="sm" style={{ marginRight: '10px' }}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
            <Settings className="inline h-6 w-6 mr-2" />
            Waterfall Configuration
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Configure carrier waterfall for {currentLane?.originZip} → {currentLane?.destinationZip} ({currentLane?.equipment})
          </p>
        </div>
      </div>

      {/* Lane Info Card */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Lane Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div>
              <Label>Origin</Label>
              <div style={{ fontWeight: '500', marginTop: '2px' }}>{currentLane?.originZip}</div>
            </div>
            <div>
              <Label>Destination</Label>
              <div style={{ fontWeight: '500', marginTop: '2px' }}>{currentLane?.destinationZip}</div>
            </div>
            <div>
              <Label>Equipment</Label>
              <div style={{ fontWeight: '500', marginTop: '2px' }}>{currentLane?.equipment}</div>
            </div>
            <div>
              <Label>Status</Label>
              <Badge variant="secondary" style={{ marginTop: '2px' }}>{currentLane?.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waterfall Configuration */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>Waterfall Configuration</CardTitle>
              <CardDescription>Configure carrier dispatch sequence, rates, and response windows.</CardDescription>
            </div>
            <Button onClick={addCarrier} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Carrier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Custom Tiers Section */}
          {customTiers.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Custom Tiers</h3>
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {customTiers.length} tier{customTiers.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="space-y-3">
                {customTiers.map((tier) => {
                  const tierCarriers = localWaterfallItems.filter((item) =>
                    tier.carrierIds.includes(item.carrier.id),
                  )
                  return (
                    <div key={tier.id} className="border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="default" className="gap-1">
                            <Users className="h-3 w-3" />
                            {tier.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {tierCarriers.length} carrier{tierCarriers.length !== 1 ? "s" : ""}:{" "}
                            {tierCarriers.map((item) => item.carrier.name).join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditTierModal(tier)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustomTier(tier.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="border-t mt-4 pt-4">
                <h4 className="font-medium mb-2">All Carriers</h4>
              </div>
            </div>
          )}

          {/* Waterfall Items Table */}
          {localWaterfallItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No carriers configured yet.</p>
              <p className="text-sm">Add carriers to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="h-10">
                    <TableHead className="w-8 text-xs"></TableHead>
                    <TableHead className="w-20 text-xs">MC Number</TableHead>
                    <TableHead className="w-32 text-xs">Name</TableHead>
                    <TableHead className="w-36 text-xs">Main Contact</TableHead>
                    <TableHead className="w-36 text-xs">Secondary Contact</TableHead>
                    <TableHead className="w-20 text-xs">Rate</TableHead>
                    <TableHead className="w-24 text-xs">Response Window</TableHead>
                    <TableHead className="w-24 text-xs">Capacity</TableHead>
                    <TableHead className="w-20 text-xs">% Acceptance</TableHead>
                    <TableHead className="w-20 text-xs">% On time pickup</TableHead>
                    <TableHead className="w-20 text-xs">% On time delivery</TableHead>
                    <TableHead className="w-20 text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localWaterfallItems.map((item, index) => (
                    <TableRow
                      key={item.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, item.id)}
                      onDragEnd={handleDragEnd}
                      className={dragOverItemId === item.id ? "bg-blue-50 border-t-2 border-t-blue-500" : ""}
                    >
                      <TableCell className="text-xs cursor-move">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        <div className="flex items-center gap-2">
                          {item.carrier?.mcNumber || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium">{item.carrier?.name || `Carrier ${index + 1}`}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium">{item.carrier?.contactName || "-"}</div>
                        {item.carrier?.contactEmail && (
                          <div className="text-xs text-gray-500 mt-1">{item.carrier.contactEmail}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium">{item.carrier?.secondaryContactName || "-"}</div>
                        {item.carrier?.secondaryContactEmail && (
                          <div className="text-xs text-gray-500 mt-1">{item.carrier.secondaryContactEmail}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            value={item.carrier?.rate || ""}
                            onChange={(e) => updateCarrierRate(item.id, parseFloat(e.target.value))}
                            className="min-w-20 pl-6 h-8 text-xs"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={item.responseWindow || 30}
                            onChange={(e) => updateResponseWindow(item.id, parseInt(e.target.value))}
                            className="w-16 h-8 text-xs"
                          />
                          <span className="text-xs text-gray-600">min</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDailyCapacityModal(item.carrier)}
                          className="h-6 px-2 text-xs"
                        >
                          {(item.carrier?.availability?.length || 0) > 0
                            ? `${item.carrier.availability.length} rule(s)`
                            : "No rules"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="text-xs">{item.carrier?.acceptancePercentage || 0}%</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="text-xs">{item.carrier?.onTimePickupPercentage || 0}%</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="text-xs">{item.carrier?.onTimeDeliveryPercentage || 0}%</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => openCarrierDetailsModal(item.carrier)} 
                            className="h-6 w-6 p-0"
                            title="Edit carrier"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => removeCarrier(item.id)} 
                            className="h-6 w-6 p-0"
                            title="Remove carrier"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {localWaterfallItems.length > 0 && (
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Switch
                  id="auto-tier-global"
                  checked={autoTierEnabled}
                  onCheckedChange={onToggleAutoTier}
                />
                <Label htmlFor="auto-tier-global" className="text-sm font-medium">
                  Enable Auto-Tier Grouping
                </Label>
                <span className="text-xs text-gray-500">
                  Automatically group carriers with the same rate
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openCreateTierModal}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Custom Tier
                </Button>
                {customTiers.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {customTiers.length} custom tier{customTiers.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              onClick={saveChanges} 
              disabled={isSavingChanges}
              className="min-w-[120px]"
            >
              {isSavingChanges ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={saveWaterfallConfiguration} style={{ backgroundColor: '#3b82f6' }}>
          Save Waterfall Configuration
        </Button>
      </div>

      {/* Carrier Search Modal */}
      <Dialog open={showCarrierSearch} onOpenChange={setShowCarrierSearch}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search and Select Carrier</DialogTitle>
            <DialogDescription>
              Search for carriers by name or MC number and select one to add to your waterfall.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search by carrier name or MC number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">Search</Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier Name</TableHead>
                    <TableHead>MC Number</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCarriers.map((carrier) => (
                    <TableRow key={carrier.id}>
                      <TableCell className="font-medium">{carrier.name}</TableCell>
                      <TableCell>{carrier.mcNumber}</TableCell>
                      <TableCell>{carrier.contactEmail}</TableCell>
                      <TableCell>
                        <Button onClick={() => selectCarrier(carrier)} size="sm">
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCarrierSearch(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Carrier Details Modal */}
      <Dialog open={showCarrierDetails} onOpenChange={setShowCarrierDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCarrier && localWaterfallItems.some(item => item.carrier?.id === editingCarrier.id) 
                ? 'Edit Carrier Details' 
                : 'Review and Add Carrier Details'
              }
            </DialogTitle>
            <DialogDescription>
              {editingCarrier && localWaterfallItems.some(item => item.carrier?.id === editingCarrier.id)
                ? 'Update the carrier information and save changes.'
                : 'Review the carrier information and update any details before adding to the waterfall.'
              }
            </DialogDescription>
          </DialogHeader>
          {editingCarrier && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Carrier Name</Label>
                  <Input
                    value={editingCarrier.name}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Carrier MC Number</Label>
                  <Input
                    value={editingCarrier.mcNumber}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, mcNumber: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Main Contact Name</Label>
                  <Input
                    value={editingCarrier.contactName || ""}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, contactName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Main Contact Email</Label>
                  <Input
                    type="email"
                    value={editingCarrier.contactEmail}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, contactEmail: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Secondary Contact Name</Label>
                  <Input
                    value={editingCarrier.secondaryContactName || ""}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, secondaryContactName: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Secondary Contact Email</Label>
                  <Input
                    type="email"
                    value={editingCarrier.secondaryContactEmail || ""}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, secondaryContactEmail: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Daily Capacity</Label>
                  <Button
                    variant="outline"
                    onClick={openAvailabilityModal}
                    className="w-full justify-start"
                  >
                    {(editingCarrier.availability?.length || 0) > 0
                      ? `${editingCarrier.availability?.length} rule(s) configured`
                      : "Configure daily capacity"}
                  </Button>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Rate ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingCarrier.rate || ""}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, rate: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Carrier MC Number</Label>
                  <Input
                    value={editingCarrier.carrierMcNumber || editingCarrier.mcNumber}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, carrierMcNumber: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assigned Rep</Label>
                  <Select
                    value={editingCarrier.assignedRep || ""}
                    onValueChange={(value) => setEditingCarrier({ ...editingCarrier, assignedRep: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assigned rep" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="Mike Wilson">Mike Wilson</SelectItem>
                      <SelectItem value="Tom Anderson">Tom Anderson</SelectItem>
                      <SelectItem value="Lisa Rodriguez">Lisa Rodriguez</SelectItem>
                      <SelectItem value="David Chen">David Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={cancelCarrierDetails}>
              Cancel
            </Button>
            <Button onClick={saveCarrierDetails}>
              {editingCarrier && localWaterfallItems.some(item => item.carrier?.id === editingCarrier.id) 
                ? 'Save Changes' 
                : 'Add to Waterfall'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Availability Modal */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Daily Capacity</DialogTitle>
            <DialogDescription>Configure daily capacity rules for this carrier.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add New Rule Section */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Add Capacity Rule</CardTitle>
                <CardDescription>Select days and set daily truck capacity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">Select Days</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={selectedDays.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
                        />
                        <Label htmlFor={day} className="text-sm font-medium cursor-pointer">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Daily Capacity</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={dailyCapacity}
                      onChange={(e) => setDailyCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24"
                      min="1"
                    />
                    <span className="text-sm text-muted-foreground">trucks per day</span>
                  </div>
                </div>
                
                <Button 
                  onClick={addDailyCapacityRule}
                  disabled={selectedDays.length === 0}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </CardContent>
            </Card>

            {/* Current Rules Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Capacity Rules</CardTitle>
                <CardDescription>
                  {tempAvailability.length === 0 
                    ? "No capacity rules configured" 
                    : `${tempAvailability.length} rule(s) configured`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tempAvailability.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No capacity rules configured yet.</p>
                    <p className="text-xs mt-1">Add rules above to set daily truck limits.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tempAvailability.map((rule) => (
                      <div key={rule.id} className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {rule.days.join(", ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {rule.capacity} truck{rule.capacity !== 1 ? 's' : ''} per day
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDailyCapacityRule(rule.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelDailyCapacity}>
              Cancel
            </Button>
            <Button onClick={saveDailyCapacity}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Tier Creation/Edit Modal */}
      <Dialog open={showCreateTierModal} onOpenChange={setShowCreateTierModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTier ? 'Edit Tier' : 'Create New Tier'}
            </DialogTitle>
            <DialogDescription>
              {editingTier 
                ? 'Modify the tier name and carrier assignments' 
                : 'Create a custom tier by grouping carriers together'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Tier Name */}
            <div className="space-y-2">
              <Label htmlFor="tier-name">Tier Name</Label>
              <Input
                id="tier-name"
                placeholder="Enter tier name (e.g., Premium Carriers)"
                value={newTierName}
                onChange={(e) => setNewTierName(e.target.value)}
              />
            </div>

            {/* Carrier Selection */}
            <div className="space-y-3">
              <Label>Select Carriers for this Tier</Label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {localWaterfallItems.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No carriers available. Add carriers to the waterfall first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {localWaterfallItems.map((item) => {
                      const isSelected = selectedCarriersForTier.includes(item.carrier.id)
                      const isAssignedToOtherTier = editingTier 
                        ? customTiers.some(tier => 
                            tier.id !== editingTier.id && tier.carrierIds.includes(item.carrier.id)
                          )
                        : customTiers.some(tier => 
                            tier.carrierIds.includes(item.carrier.id)
                          )
                      
                      return (
                        <div 
                          key={item.carrier.id} 
                          className={`flex items-center space-x-3 p-3 rounded-lg border ${
                            isAssignedToOtherTier ? 'bg-muted/50 opacity-60' : 'hover:bg-muted/20'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isAssignedToOtherTier}
                            onCheckedChange={() => toggleCarrierSelection(item.carrier.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium text-sm">{item.carrier.name}</p>
                                <p className="text-xs text-muted-foreground">MC: {item.carrier.mcNumber}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-600">
                                  ${(item.carrier.rate || 0).toFixed(0)}
                                </p>
                                <p className="text-xs text-muted-foreground">Rate</p>
                              </div>
                            </div>
                            {isAssignedToOtherTier && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Already assigned to another tier
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              {selectedCarriersForTier.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedCarriersForTier.length} carrier{selectedCarriersForTier.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelTierModal}>
              Cancel
            </Button>
            <Button 
              onClick={editingTier ? updateCustomTier : createCustomTier}
              disabled={!newTierName.trim() || selectedCarriersForTier.length === 0}
            >
              {editingTier ? 'Update Tier' : 'Create Tier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Modal */}
      <Dialog open={showSaveConfirmModal} onOpenChange={setShowSaveConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Save Waterfall Configuration
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to save this waterfall configuration? This will save all carriers, custom tiers, and settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Carriers configured:</span>
                  <Badge variant="secondary">{localWaterfallItems.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Custom tiers:</span>
                  <Badge variant="secondary">{customTiers.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-tier enabled:</span>
                  <Badge variant={autoTierEnabled ? "default" : "secondary"}>
                    {autoTierEnabled ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Lane: <strong>{currentLane?.originZip} → {currentLane?.destinationZip}</strong> ({currentLane?.equipment})
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelSaveWaterfall}>
              Cancel
            </Button>
            <Button onClick={confirmSaveWaterfall}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
