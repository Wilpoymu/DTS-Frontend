"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, Settings, Plus, Eye, Clock, Users, 
  Play, AlertTriangle, Trash2
} from "lucide-react"
import { toast } from "sonner"

interface WaterfallDetailsViewProps {
  currentLane: any
  waterfallItems: any[]
  customTiers: any[]
  highlightedLoadInfo?: {
    loadId: string
    laneId?: string
    assignedTier?: string
  } | null
  showLoadDetailsAlert?: boolean
  onBack: () => void
  onEditWaterfall: () => void
  onPauseWaterfall?: () => void
  onResumeWaterfall?: () => void
  onStopWaterfall?: () => void
  onRestartWaterfall?: () => void
}

// Mock data functions from original component
const getLocationFromZip = (zip: string) => {
  const locations: { [key: string]: { city: string; state: string } } = {
    "90210": { city: "Beverly Hills", state: "CA" },
    "10001": { city: "New York", state: "NY" },
    "60601": { city: "Chicago", state: "IL" },
    "48201": { city: "Detroit", state: "MI" },
    "77001": { city: "Houston", state: "TX" },
    "75201": { city: "Dallas", state: "TX" },
    "33101": { city: "Miami", state: "FL" },
    "30301": { city: "Atlanta", state: "GA" },
    "94102": { city: "San Francisco", state: "CA" },
    "98101": { city: "Seattle", state: "WA" },
  }
  return locations[zip] || null
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Triggered":
      return <Badge className="text-dts-darkblue bg-dts-lightblue">Triggered</Badge>
    case "Not Triggered":
      return <Badge className="bg-gray-100 text-gray-800">Not Triggered</Badge>
    case "Draft":
      return <Badge className="bg-dts-lightblue text-dts-darkblue">Draft</Badge>
    case "Paused":
      return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
    case "Completed":
      return <Badge className="text-dts-black bg-dts-neongreen" variant="secondary">Completed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getExecutionStatusMessage = (status: string) => {
  switch (status) {
    case "Triggered":
      return "Currently processing loads"
    case "Not Triggered":
      return "Ready to process loads"
    case "Paused":
      return "Execution temporarily paused"
    case "Completed":
      return "All configured loads processed"
    default:
      return "Status unknown"
  }
}

// Mock data for execution
const mockExecutionData = {
  totalLoadsProcessed: 15,
  successfulAssignments: 12,
  pendingResponses: 2,
  averageResponseTime: "4m 32s",
  currentLoad: "LD-2024-001",
  currentTier: 1
}

const mockCurrentResponses = [
  {
    carrierId: "1",
    carrierName: "ABC Transport",
    status: "accepted",
    offerSentTime: new Date().toISOString(),
    timeRemaining: null
  },
  {
    carrierId: "2", 
    carrierName: "XYZ Logistics",
    status: "pending",
    offerSentTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    timeRemaining: 10
  }
]

const mockExecutionLogs = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    action: "Load Assignment Started",
    details: "Load LD-2024-001 entered waterfall for processing",
    type: "info",
    loadId: "LD-2024-001",
    carrierName: null,
    carrierId: null
  },
  {
    id: "2", 
    timestamp: new Date(Date.now() - 300000).toISOString(),
    action: "Offer Sent",
    details: "Rate offer sent via email",
    type: "info",
    loadId: "LD-2024-001", 
    carrierName: "ABC Transport",
    carrierId: "1"
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 480000).toISOString(), // 8 minutes ago
    action: "Carrier Contacted",
    details: "Initial contact attempt via phone call",
    type: "info",
    loadId: "LD-2024-001",
    carrierName: "ABC Transport", 
    carrierId: "1"
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    action: "Offer Accepted",
    details: "Carrier accepted the load at offered rate of $2,500",
    type: "success",
    loadId: "LD-2024-001",
    carrierName: "ABC Transport",
    carrierId: "1"
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago  
    action: "Response Timeout",
    details: "No response received within 15-minute window, escalating to next tier",
    type: "warning",
    loadId: "LD-2024-002",
    carrierName: "XYZ Logistics",
    carrierId: "2"
  },
  {
    id: "6",
    timestamp: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
    action: "Offer Rejected", 
    details: "Carrier declined the load - rate too low",
    type: "warning",
    loadId: "LD-2024-002",
    carrierName: "Express Freight",
    carrierId: "3"
  },
  {
    id: "7",
    timestamp: new Date(Date.now() - 1500000).toISOString(), // 25 minutes ago
    action: "Email Delivery Failed",
    details: "Email bounced - invalid email address",
    type: "error", 
    loadId: "LD-2024-002",
    carrierName: "Fast Haul Inc",
    carrierId: "4"
  },
  {
    id: "8",
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    action: "Tier Escalation",
    details: "Escalated to Tier 2 after no responses in Tier 1",
    type: "info",
    loadId: "LD-2024-002",
    carrierName: null,
    carrierId: null
  },
  {
    id: "9",
    timestamp: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
    action: "Load Assignment Completed",
    details: "Load successfully assigned and confirmed",
    type: "success", 
    loadId: "LD-2024-003",
    carrierName: "Reliable Transport",
    carrierId: "5"
  },
  {
    id: "10",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    action: "Waterfall Triggered",
    details: "Automatic waterfall execution started for new load",
    type: "info",
    loadId: "LD-2024-004",
    carrierName: null,
    carrierId: null
  },
  {
    id: "11",
    timestamp: new Date(Date.now() - 4200000).toISOString(), // 1 hour 10 minutes ago
    action: "SMS Sent",
    details: "Backup SMS notification sent after email timeout",
    type: "info",
    loadId: "LD-2024-004",
    carrierName: "Quick Ship LLC", 
    carrierId: "6"
  },
  {
    id: "12", 
    timestamp: new Date(Date.now() - 4800000).toISOString(), // 1 hour 20 minutes ago
    action: "Rate Negotiation",
    details: "Carrier requested rate increase to $2,800 - approved",
    type: "info",
    loadId: "LD-2024-005",
    carrierName: "Premium Logistics",
    carrierId: "7"
  }
]

const getLatestProcessedLoads = () => {
  return [
    {
      id: "LD-001",
      status: "Completed",
      pickupDateTimeExpected: "2024-01-22 08:00",
      pickupDateTimeActual: "2024-01-22 08:15", 
      deliveryDateTimeExpected: "2024-01-24 17:00",
      deliveryDateTimeActual: "2024-01-24 16:45",
      equipmentType: "Dry Van",
      assignedCarrier: "ABC Transport",
      finalRate: 2500.00,
      bookingDate: "2024-01-21 15:30"
    },
    {
      id: "LD-002", 
      status: "In Transit",
      pickupDateTimeExpected: "2024-01-23 06:00",
      pickupDateTimeActual: "2024-01-23 06:30",
      deliveryDateTimeExpected: "2024-01-25 14:00", 
      deliveryDateTimeActual: "2024-01-25 14:00",
      equipmentType: "Reefer",
      assignedCarrier: "XYZ Logistics", 
      finalRate: 2800.00,
      bookingDate: "2024-01-22 09:15"
    },
    {
      id: "LD-003",
      status: "Completed", 
      pickupDateTimeExpected: "2024-01-24 12:00",
      pickupDateTimeActual: "2024-01-24 11:45",
      deliveryDateTimeExpected: "2024-01-26 10:00",
      deliveryDateTimeActual: "2024-01-26 09:30", 
      equipmentType: "Flatbed",
      assignedCarrier: "Reliable Transport",
      finalRate: 3200.00,
      bookingDate: "2024-01-23 14:20"
    },
    {
      id: "LD-004",
      status: "Pending Pickup",
      pickupDateTimeExpected: "2024-01-25 14:00", 
      pickupDateTimeActual: "2024-01-25 14:00",
      deliveryDateTimeExpected: "2024-01-27 16:00",
      deliveryDateTimeActual: "2024-01-27 16:00",
      equipmentType: "Dry Van", 
      assignedCarrier: "Express Freight",
      finalRate: 2650.00,
      bookingDate: "2024-01-24 11:45"
    },
    {
      id: "LD-005",
      status: "Delivered",
      pickupDateTimeExpected: "2024-01-26 07:30",
      pickupDateTimeActual: "2024-01-26 07:15",
      deliveryDateTimeExpected: "2024-01-28 15:30",
      deliveryDateTimeActual: "2024-01-28 15:00",
      equipmentType: "Dry Van",
      assignedCarrier: "Premium Logistics", 
      finalRate: 2750.00,
      bookingDate: "2024-01-25 13:10"
    }
  ]
}

// Mock waterfall items for testing when no items are provided
const mockWaterfallItems = [
  {
    id: "1753113166101-95mp1mdbx",
    carrier: {
      id: "1",
      name: "ABC Transport",
      mcNumber: "MC123456",
      contactEmail: "contact@abctransport.com",
      contactName: "John Doe",
      secondaryContactName: "Jane Smith",
      secondaryContactEmail: "jane@abctransport.com",
      assignedRep: "Sarah Johnson",
      carrierMcNumber: "MC123456",
      rate: 2500,
      acceptancePercentage: 85,
      onTimePickupPercentage: 92,
      onTimeDeliveryPercentage: 88
    },
    responseWindow: 30
  },
  {
    id: "1753113169853-1vzki584x",
    carrier: {
      id: "3",
      name: "Quick Haul Inc",
      mcNumber: "MC345678",
      contactEmail: "dispatch@quickhaul.com",
      contactName: "Robert Johnson",
      assignedRep: "Lisa Rodriguez",
      carrierMcNumber: "MC345678",
      rate: 2500,
      acceptancePercentage: 92,
      onTimePickupPercentage: 89,
      onTimeDeliveryPercentage: 94
    },
    responseWindow: 30
  },
  {
    id: "1753113174580-jfj29z79u",
    carrier: {
      id: "5",
      name: "Speed Delivery",
      mcNumber: "MC567890",
      contactEmail: "booking@speeddelivery.com",
      contactName: "Chris Martinez",
      assignedRep: "Mike Wilson",
      carrierMcNumber: "MC567890",
      rate: 2850,
      acceptancePercentage: 81,
      onTimePickupPercentage: 93,
      onTimeDeliveryPercentage: 86
    },
    responseWindow: 30
  },
  {
    id: "1753113179693-9on4rujtq",
    carrier: {
      id: "2",
      name: "XYZ Logistics",
      mcNumber: "MC789012",
      contactEmail: "info@xyzlogistics.com",
      contactName: "Mike Wilson",
      secondaryContactName: "Lisa Brown",
      secondaryContactEmail: "lisa@xyzlogistics.com",
      assignedRep: "Tom Anderson",
      carrierMcNumber: "MC789012",
      rate: 2750.5,
      acceptancePercentage: 78,
      onTimePickupPercentage: 95,
      onTimeDeliveryPercentage: 91
    },
    responseWindow: 30
  }
]

export default function WaterfallDetailsView({
  currentLane,
  waterfallItems = [],
  customTiers = [],
  highlightedLoadInfo,
  showLoadDetailsAlert = false,
  onBack,
  onEditWaterfall
}: WaterfallDetailsViewProps) {
  const [showCreateTierModal, setShowCreateTierModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [editingTier, setEditingTier] = useState<any>(null)
  const [newTierName, setNewTierName] = useState('')
  const [selectedCarriersForTier, setSelectedCarriersForTier] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)
  const [showLoadDetailsAlert2, setShowLoadDetailsAlert2] = useState(showLoadDetailsAlert)
  const [showTriggeredWarning] = useState(currentLane?.status === "Triggered")
  const [autoTierEnabled] = useState(true)
  
  // State for complete waterfall data from localStorage
  const [waterfallData, setWaterfallData] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Function to force refresh from localStorage
  const refreshFromLocalStorage = () => {
    if (typeof window !== 'undefined' && currentLane?.id) {
      const key = `savedWaterfall_${currentLane.id}`
      try {
        const savedData = localStorage.getItem(key)
        console.log('🔄 Force refreshing from localStorage:', key)
        
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          console.log('✅ Refreshed data:', parsedData)
          setWaterfallData(parsedData)
        }
      } catch (error) {
        console.error('Error refreshing from localStorage:', error)
      }
    }
  }

  // Listen for storage changes from other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key && e.key.startsWith(`savedWaterfall_${currentLane?.id}`)) {
          console.log('📡 Storage change detected for current lane, refreshing...')
          refreshFromLocalStorage()
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [currentLane?.id])

  // Also add a custom event listener for same-page updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleCustomRefresh = () => {
        console.log('📡 Custom refresh event received, refreshing from localStorage...')
        refreshFromLocalStorage()
      }
      
      window.addEventListener('waterfallDataUpdated', handleCustomRefresh)
      
      return () => {
        window.removeEventListener('waterfallDataUpdated', handleCustomRefresh)
      }
    }
  }, [currentLane?.id])

  // Load waterfall data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && currentLane?.id) {
      const key = `savedWaterfall_${currentLane.id}`
      try {
        const savedData = localStorage.getItem(key)
        console.log('Loading waterfall data from localStorage:', {
          key,
          currentLane: currentLane,
          waterfallItems,
          customTiers
        })
        
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          console.log('Parsed waterfall data:', parsedData)
          setWaterfallData(parsedData)
        } else {
          // If no saved data, create initial structure with props
          const initialData = {
            lane: currentLane,
            waterfallItems: waterfallItems,
            autoTierEnabled: true,
            customTiers: customTiers || [],
            savedAt: new Date().toISOString()
          }
          console.log('Creating initial waterfall data:', initialData)
          setWaterfallData(initialData)
          localStorage.setItem(key, JSON.stringify(initialData))
        }
      } catch (error) {
        console.error('Error loading waterfall data from localStorage:', error)
        // Fallback to props data
        const fallbackData = {
          lane: currentLane,
          waterfallItems: waterfallItems,
          autoTierEnabled: true,
          customTiers: customTiers || [],
          savedAt: new Date().toISOString()
        }
        setWaterfallData(fallbackData)
      }
    }
  }, [currentLane?.id, waterfallItems, customTiers])

  // Save waterfall data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && waterfallData && currentLane?.id) {
      const key = `savedWaterfall_${currentLane.id}`
      try {
        const dataToSave = {
          ...waterfallData,
          savedAt: new Date().toISOString()
        }
        console.log('Saving waterfall data to localStorage:', {
          key,
          dataToSave
        })
        localStorage.setItem(key, JSON.stringify(dataToSave))
        console.log('✅ Waterfall data saved successfully')
      } catch (error) {
        console.error('Error saving waterfall data to localStorage:', error)
      }
    }
  }, [waterfallData, currentLane?.id])

  // Add console log to debug the initial data
  useEffect(() => {
    console.log('Component mounted with data:', {
      currentLane,
      waterfallItems,
      customTiers,
      mockWaterfallItems
    })
  }, [currentLane, waterfallItems, customTiers])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const latestLoads = getLatestProcessedLoads()

  const openCreateTierModal = () => {
    setEditingTier(null)
    setNewTierName('')
    setSelectedCarriersForTier([])
    setShowCreateTierModal(true)
  }

  const openEditTierModal = (tier: any) => {
    setEditingTier(tier)
    setNewTierName(tier.name)
    setSelectedCarriersForTier(tier.carrierIds || [])
    setShowCreateTierModal(true)
  }

  const toggleCarrierSelection = (carrierId: string) => {
    setSelectedCarriersForTier(prev => 
      prev.includes(carrierId) 
        ? prev.filter(id => id !== carrierId)
        : [...prev, carrierId]
    )
  }

  const cancelTierModal = () => {
    setShowCreateTierModal(false)
    setEditingTier(null)
    setNewTierName('')
    setSelectedCarriersForTier([])
  }

  const createCustomTier = () => {
    if (!newTierName.trim()) {
      toast.error('Please enter a tier name')
      return
    }
    
    if (selectedCarriersForTier.length === 0) {
      toast.error('Please select at least one carrier')
      return
    }

    // Create new tier with unique ID
    const newTier = {
      id: `tier-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      name: newTierName.trim(),
      carrierIds: [...selectedCarriersForTier],
      order: (waterfallData?.customTiers?.length || 0) + 1
    }

    // Update waterfall data with new custom tier
    if (waterfallData) {
      const updatedWaterfallData = {
        ...waterfallData,
        customTiers: [...(waterfallData.customTiers || []), newTier]
      }
      setWaterfallData(updatedWaterfallData)
    }
    
    toast.success(`Tier "${newTierName.trim()}" created successfully`)
    setShowCreateTierModal(false)
    setNewTierName('')
    setSelectedCarriersForTier([])
  }

  const updateCustomTier = () => {
    if (!newTierName.trim()) {
      toast.error('Please enter a tier name')
      return
    }
    
    if (selectedCarriersForTier.length === 0) {
      toast.error('Please select at least one carrier')
      return
    }

    if (!editingTier || !waterfallData) {
      toast.error('No tier selected for editing')
      return
    }

    // Update the tier in waterfall data
    const updatedCustomTiers = (waterfallData.customTiers || []).map((tier: any) => 
      tier.id === editingTier.id 
        ? { 
            ...tier, 
            name: newTierName.trim(), 
            carrierIds: [...selectedCarriersForTier]
          }
        : tier
    )

    const updatedWaterfallData = {
      ...waterfallData,
      customTiers: updatedCustomTiers
    }

    setWaterfallData(updatedWaterfallData)

    toast.success(`Tier "${newTierName.trim()}" updated successfully`)
    setShowCreateTierModal(false)
    setEditingTier(null)
    setNewTierName('')
    setSelectedCarriersForTier([])
  }

  const deleteCustomTier = (tierId: string) => {
    if (!waterfallData) return
    
    const tierToDelete = waterfallData.customTiers?.find((tier: any) => tier.id === tierId)
    const updatedCustomTiers = (waterfallData.customTiers || []).filter((tier: any) => tier.id !== tierId)
    
    const updatedWaterfallData = {
      ...waterfallData,
      customTiers: updatedCustomTiers
    }
    
    setWaterfallData(updatedWaterfallData)
    toast.success(`Tier "${tierToDelete?.name || 'Unknown'}" deleted successfully`)
  }

  if (!currentLane) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No waterfall selected for details</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2 bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          Back to All Waterfalls
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Waterfall Details</h1>
      </div>

      {/* Alert para información de la carga navegada */}
      {showLoadDetailsAlert2 && highlightedLoadInfo && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Load Information:</strong> You are viewing this waterfall from Load {highlightedLoadInfo.loadId}.
            {highlightedLoadInfo.assignedTier && (
              <span> This load was assigned to <strong>{highlightedLoadInfo.assignedTier}</strong>.</span>
            )}
            {highlightedLoadInfo.laneId && (
              <span> Lane ID: <strong>{highlightedLoadInfo.laneId}</strong></span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLoadDetailsAlert2(false)}
              className="ml-2 h-6 px-2 text-blue-800 hover:bg-blue-100"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {showTriggeredWarning && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Warning:</strong> You are editing a waterfall with "Triggered" status. Changes may affect ongoing
            operations.
          </AlertDescription>
        </Alert>
      )}

      {/* Lane Summary */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Lane Summary</CardTitle>
        </CardHeader>
        <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Origin ZIP</Label>
              <p className="text-2xl font-bold text-primary">{currentLane.originZip}</p>
              {(() => {
                const location = getLocationFromZip(currentLane.originZip)
                return location ? (
                  <p className="text-sm text-muted-foreground">
                    {location.city}, {location.state}
                  </p>
                ) : null
              })()}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Destination ZIP</Label>
              <p className="text-2xl font-bold text-primary">{currentLane.destinationZip}</p>
              {(() => {
                const location = getLocationFromZip(currentLane.destinationZip)
                return location ? (
                  <p className="text-sm text-muted-foreground">
                    {location.city}, {location.state}
                  </p>
                ) : null
              })()}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Equipment</Label>
              <p className="text-2xl font-bold">{currentLane.equipment}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Quoted Loads</Label>
              <p className="text-2xl font-bold text-blue-600">
                {currentLane.quotedLoads || latestLoads.length || 15}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">% Acceptance</Label>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    const acceptanceRate = currentLane.acceptancePercentage || 80
                    return `${acceptanceRate}%`
                  })()}
                </p>
                <div className={`w-3 h-3 rounded-full ${
                  (currentLane.acceptancePercentage || 80) >= 85 ? 'bg-green-500' :
                  (currentLane.acceptancePercentage || 80) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">% On Time Pickup</Label>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    const onTimePickupRate = currentLane.onTimePickupPercentage || 85
                    return `${onTimePickupRate}%`
                  })()}
                </p>
                <div className={`w-3 h-3 rounded-full ${
                  (currentLane.onTimePickupPercentage || 85) >= 90 ? 'bg-green-500' :
                  (currentLane.onTimePickupPercentage || 85) >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">% On Time Delivery</Label>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    const onTimeDeliveryRate = currentLane.onTimeDeliveryPercentage || 79
                    return `${onTimeDeliveryRate}%`
                  })()}
                </p>
                <div className={`w-3 h-3 rounded-full ${
                  (currentLane.onTimeDeliveryPercentage || 79) >= 85 ? 'bg-green-500' :
                  (currentLane.onTimeDeliveryPercentage || 79) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="configuration" className="text-base">
            Waterfall Configuration
          </TabsTrigger>
          <TabsTrigger value="execution" className="text-base">
            Execution Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription className="text-base">
                  Carrier dispatch sequence and response windows
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCreateTierModal}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Custom Tier
                  </Button>
                  <Button variant="outline" onClick={onEditWaterfall} className="gap-2 bg-transparent">
                    <Settings className="h-4 w-4" />
                    Edit Configuration
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                // Use waterfall data for tiers and carriers
                const tiers = waterfallData?.customTiers || []
                // Use waterfall data items if available, fallback to props or mock data
                const items = waterfallData?.waterfallItems || waterfallItems.length > 0 ? waterfallItems : mockWaterfallItems
                const autoTierEnabledLocal = waterfallData?.autoTierEnabled ?? autoTierEnabled
                
                if (!items || items.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No carriers configured for this waterfall yet.</p>
                    </div>
                  )
                }
                
                const tiersDisplay: React.ReactNode[] = []
                
                // Mostrar custom tiers primero
                tiers.forEach((tier: any, index: any) => {
                  const tierCarriers = items.filter(item => 
                    tier.carrierIds.includes(item.carrier.id)
                  )
                  if (tierCarriers.length > 0) {
                    tiersDisplay.push(
                      <div key={tier.id} className="border rounded-lg p-6 bg-muted/30">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                            {tiersDisplay.length + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{tier.name}</h3>
                            <p className="text-sm text-muted-foreground">Custom tier</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              <Users className="h-3 w-3" />
                              {tierCarriers.length} carrier{tierCarriers.length !== 1 ? 's' : ''}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditTierModal(tier)}
                              className="h-8 w-8 p-0"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCustomTier(tier.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Carrier Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>MC Number</TableHead>
                                <TableHead>Contact Name</TableHead>
                                <TableHead>Contact Email</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Response Window</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tierCarriers.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.carrier.name}</TableCell>
                                  <TableCell>
                                    <Badge variant="default">Active</Badge>
                                  </TableCell>
                                  <TableCell>{item.carrier.mcNumber}</TableCell>
                                  <TableCell>{item.carrier.contactName || '-'}</TableCell>
                                  <TableCell>{item.carrier.contactEmail || '-'}</TableCell>
                                  <TableCell className="font-medium text-green-600">
                                    $
                                    {(item.carrier.rate || 0).toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm">{item.responseWindow} min</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  }
                })
                
                // Carriers no asignados a custom tiers
                const carriersNotInCustomTiers = items.filter(item => 
                  !tiers.some((tier: any) => tier.carrierIds.includes(item.carrier.id))
                )
                
                if (autoTierEnabledLocal && carriersNotInCustomTiers.length > 0) {
                  // Agrupar por rate
                  const groupedByRate = carriersNotInCustomTiers.reduce((groups, item) => {
                    const rate = item.carrier.rate || 0
                    if (!groups[rate]) {
                      groups[rate] = []
                    }
                    groups[rate].push(item)
                    return groups
                  }, {} as Record<number, typeof carriersNotInCustomTiers>)
                  
                  const sortedRateGroups = Object.entries(groupedByRate)
                    .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
                  
                  sortedRateGroups.forEach(([rate, items]) => {
                    if ((items as any[]).length > 1) {
                      tiersDisplay.push(
                        <div key={`auto-tier-${rate}`} className="border rounded-lg p-6 bg-muted/30">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">
                              {tiersDisplay.length + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">Auto-Tier ${rate}</h3>
                              <p className="text-sm text-muted-foreground">Automatically grouped by rate</p>
                            </div>
                            <Badge variant="outline" className="gap-1">
                              <Users className="h-3 w-3" />
                              {(items as any[]).length} carrier{(items as any[]).length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Carrier Name</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>MC Number</TableHead>
                                  <TableHead>Contact Name</TableHead>
                                  <TableHead>Contact Email</TableHead>
                                  <TableHead>Rate</TableHead>
                                  <TableHead>Response Window</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(items as any[]).map((item: any) => (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.carrier.name}</TableCell>
                                    <TableCell>
                                      <Badge variant="default">Active</Badge>
                                    </TableCell>
                                    <TableCell>{item.carrier.mcNumber}</TableCell>
                                    <TableCell>{item.carrier.contactName || '-'}</TableCell>
                                    <TableCell>{item.carrier.contactEmail || '-'}</TableCell>
                                    <TableCell className="font-medium text-green-600">
                                      $
                                      {(item.carrier.rate || 0).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm">{item.responseWindow} min</span>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )
                    }
                  })
                  
                  // Carriers individuales
                  const individualCarriers = sortedRateGroups
                    .filter(([rate, items]) => (items as any[]).length === 1)
                    .flatMap(([rate, items]) => items as any[])
                  
                  if (individualCarriers.length > 0) {
                    tiersDisplay.push(
                      <div key="individual-carriers" className="border rounded-lg p-6 bg-muted/30">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">
                            {tiersDisplay.length + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Individual Carriers</h3>
                            <p className="text-sm text-muted-foreground">Carriers with unique rates or not grouped</p>
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {individualCarriers.length} carrier{individualCarriers.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Carrier Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>MC Number</TableHead>
                                <TableHead>Contact Name</TableHead>
                                <TableHead>Contact Email</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Response Window</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {individualCarriers.map((item: any) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.carrier.name}</TableCell>
                                  <TableCell>
                                    <Badge variant="default">Active</Badge>
                                  </TableCell>
                                  <TableCell>{item.carrier.mcNumber}</TableCell>
                                  <TableCell>{item.carrier.contactName || '-'}</TableCell>
                                  <TableCell>{item.carrier.contactEmail || '-'}</TableCell>
                                  <TableCell className="font-medium text-green-600">
                                    $
                                    {(item.carrier.rate || 0).toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm">{item.responseWindow} min</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  }
                } else if (!autoTierEnabledLocal && carriersNotInCustomTiers.length > 0) {
                  // Cuando autoTier está deshabilitado, mostrar todos los carriers restantes como individuales
                  tiersDisplay.push(
                    <div key="individual-carriers" className="border rounded-lg p-6 bg-muted/30">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">
                          {tiersDisplay.length + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Individual Carriers</h3>
                          <p className="text-sm text-muted-foreground">Carriers not in custom tiers</p>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {carriersNotInCustomTiers.length} carrier{carriersNotInCustomTiers.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Carrier Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>MC Number</TableHead>
                              <TableHead>Contact Name</TableHead>
                              <TableHead>Contact Email</TableHead>
                              <TableHead>Rate</TableHead>
                              <TableHead>Response Window</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {carriersNotInCustomTiers.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.carrier.name}</TableCell>
                                <TableCell>
                                  <Badge variant="default">Active</Badge>
                                </TableCell>
                                <TableCell>{item.carrier.mcNumber}</TableCell>
                                <TableCell>{item.carrier.contactName || '-'}</TableCell>
                                <TableCell>{item.carrier.contactEmail || '-'}</TableCell>
                                <TableCell className="font-medium text-green-600">
                                  $
                                  {(item.carrier.rate || 0).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">{item.responseWindow} min</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )
                }
                
                // Mostrar info de auto-tier
                if (tiersDisplay.length > 0) {
                  tiersDisplay.unshift(
                    <div key="tier-info" className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${autoTierEnabledLocal ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm font-medium">
                            Auto-Tier Grouping: {autoTierEnabledLocal ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        {tiers.length > 0 && (
                          <Badge variant="secondary" className="gap-1 ml-4">
                            <Users className="h-3 w-3" />
                            {tiers.length} custom tier{tiers.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {autoTierEnabledLocal 
                          ? 'Carriers with the same rate are automatically grouped together'
                          : 'All carriers are shown individually unless assigned to custom tiers'
                        }
                      </p>
                    </div>
                  )
                }
                
                return tiersDisplay.length > 1 ? tiersDisplay : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No carriers configured for this waterfall yet.</p>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
          
          {/* Modal de creación/edición de tier */}
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
                <div className="space-y-2">
                  <Label htmlFor="tier-name">Tier Name</Label>
                  <Input
                    id="tier-name"
                    placeholder="Enter tier name (e.g., Premium Carriers)"
                    value={newTierName}
                    onChange={(e) => setNewTierName(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Select Carriers for this Tier</Label>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    {(() => {
                      // Use mock data if no waterfallItems provided (for testing persistence)
                      const availableItems = waterfallData?.waterfallItems || waterfallItems.length > 0 ? waterfallItems : mockWaterfallItems
                      
                      if (availableItems.length === 0) {
                        return (
                          <p className="text-center py-8 text-muted-foreground">
                            No carriers available. Add carriers to the waterfall first.
                          </p>
                        )
                      }
                      
                      return (
                        <div className="space-y-2">
                          {availableItems.map((item) => {
                          const isSelected = selectedCarriersForTier.includes(item.carrier.id)
                          const currentCustomTiers = waterfallData?.customTiers || []
                          const isAssignedToOtherTier = editingTier 
                            ? currentCustomTiers.some((tier: any) => 
                                tier.id !== editingTier.id && tier.carrierIds.includes(item.carrier.id)
                              )
                            : currentCustomTiers.some((tier: any) => 
                                tier.carrierIds.includes(item.carrier.id)
                              )
                          
                          return (
                            <div 
                              key={item.carrier.id} 
                              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                                isAssignedToOtherTier 
                                  ? 'bg-gray-50 border-gray-200' 
                                  : isSelected 
                                    ? 'bg-blue-50 border-blue-200' 
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <Checkbox
                                id={`carrier-${item.carrier.id}`}
                                checked={isSelected}
                                disabled={isAssignedToOtherTier}
                                onCheckedChange={() => toggleCarrierSelection(item.carrier.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className={`font-medium ${isAssignedToOtherTier ? 'text-gray-500' : ''}`}>
                                      {item.carrier.name}
                                    </p>
                                    <p className={`text-sm ${isAssignedToOtherTier ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                      {item.carrier.mcNumber}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className={`font-medium ${isAssignedToOtherTier ? 'text-gray-500' : 'text-green-600'}`}>
                                      ${(item.carrier.rate || 0).toLocaleString()}
                                    </p>
                                    <p className={`text-sm ${isAssignedToOtherTier ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                      {item.responseWindow} min
                                    </p>
                                  </div>
                                </div>
                                {isAssignedToOtherTier && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Already assigned to another tier
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        </div>
                      )
                    })()}
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
        </TabsContent>

        <TabsContent value="execution" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-dts-darkblue">Execution Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Status and Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-lg">{currentLane.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {getExecutionStatusMessage(currentLane.status)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {currentLane.status === "Paused" && (
                    <Button className="gap-2 bg-dts-blue hover:bg-dts-darkblue text-white">
                      <Play className="h-4 w-4" />
                      Resume Waterfall
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="gap-2 bg-transparent"
                    onClick={() => setShowLogsModal(true)}
                  >
                    <Eye className="h-4 w-4" />
                    View All Logs
                  </Button>
                </div>
              </div>

              {/* Execution Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-dts-darkblue">{mockExecutionData.totalLoadsProcessed}</p>
                        <p className="text-sm text-muted-foreground">Total Loads Processed</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Play className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{mockExecutionData.successfulAssignments}</p>
                        <p className="text-sm text-muted-foreground">Successful Assignments</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{mockExecutionData.pendingResponses}</p>
                        <p className="text-sm text-muted-foreground">Pending Responses</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{mockExecutionData.averageResponseTime}</p>
                        <p className="text-sm text-muted-foreground">Average Response Time</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Current Load Processing */}
              {currentLane.status === "Triggered" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Currently Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Load ID:</Label>
                          <Badge variant="outline" className="font-mono">{mockExecutionData.currentLoad}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Current Tier:</Label>
                          <Badge className="bg-blue-100 text-blue-800">Tier {mockExecutionData.currentTier}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Processing since {new Date(Date.now() - 600000).toLocaleTimeString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Responses Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Carrier Response Status</CardTitle>
                  <CardDescription>Active offers and pending responses</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockCurrentResponses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active carrier responses</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mockCurrentResponses.map((response) => (
                        <div key={response.carrierId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{response.carrierName}</p>
                              <p className="text-sm text-muted-foreground">
                                Offer sent {new Date(response.offerSentTime).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {response.status === "accepted" ? (
                              <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                            ) : response.status === "pending" ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                {response.timeRemaining && (
                                  <span className="text-sm text-muted-foreground">
                                    {response.timeRemaining}m left
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Badge variant="secondary">{response.status}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                      <CardDescription>Latest waterfall execution events</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowLogsModal(true)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View All Logs
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockExecutionLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          log.type === 'success' ? 'bg-green-500' :
                          log.type === 'warning' ? 'bg-yellow-500' :
                          log.type === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">{log.action}</p>
                                {log.loadId && (
                                  <Badge variant="outline" className="text-xs">
                                    {log.loadId}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground break-words">
                                {log.details}
                              </p>
                              {log.carrierName && (
                                <p className="text-xs text-blue-600 mt-1">
                                  {log.carrierName}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {(() => {
                                const logTime = new Date(log.timestamp)
                                const now = new Date()
                                const diffMinutes = Math.floor((now.getTime() - logTime.getTime()) / (1000 * 60))
                                
                                if (diffMinutes < 1) return "Just now"
                                if (diffMinutes < 60) return `${diffMinutes}m ago`
                                if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
                                return logTime.toLocaleDateString()
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {mockExecutionLogs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recent activity</p>
                        <p className="text-sm">Activity will appear here when the waterfall is active</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Active and Past Loads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-dts-darkblue">Active and Past Loads</CardTitle>
          <CardDescription>
            {latestLoads.length === 0
              ? "No loads have been processed through this waterfall yet"
              : `Processed loads for this waterfall, sorted by oldest first (FIFO). Shows expected vs actual pickup and delivery times.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestLoads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No processed loads</p>
              <p className="text-sm">This waterfall hasn't processed any loads yet.</p>
              {currentLane.status === "Not Triggered" && (
                <p className="text-sm mt-2">Trigger the waterfall to start processing loads.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Load ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>[EST] Pickup Date/Time</TableHead>
                    <TableHead>Pickup Date/Time</TableHead>
                    <TableHead>[EST] Delivery Date/Time</TableHead>
                    <TableHead>Actual Delivery Date/Time</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Assigned Carrier</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Booking Date/Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestLoads.map((load) => (
                    <TableRow key={load.id}>
                      <TableCell className="font-medium">{load.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant={load.status === "Completed" ? "default" : "secondary"}
                          className={
                            load.status === "Completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {load.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{load.pickupDateTimeExpected.split(" ")[0]}</div>
                          <div className="text-muted-foreground">{load.pickupDateTimeExpected.split(" ")[1]}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{load.pickupDateTimeActual.split(" ")[0]}</div>
                          <div className="text-muted-foreground">{load.pickupDateTimeActual.split(" ")[1]}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{load.deliveryDateTimeExpected.split(" ")[0]}</div>
                          <div className="text-muted-foreground">{load.deliveryDateTimeExpected.split(" ")[1]}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{load.deliveryDateTimeActual.split(" ")[0]}</div>
                          <div className="text-muted-foreground">{load.deliveryDateTimeActual.split(" ")[1]}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{load.equipmentType}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{load.assignedCarrier}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        $
                        {load.finalRate.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-sm">{load.bookingDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Modal */}
      {isClient && (
        <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
          <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl">Waterfall Execution Logs</DialogTitle>
              <DialogDescription>
                Complete execution history for {currentLane?.originZip} → {currentLane?.destinationZip} waterfall
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[60vh] pr-2">
              <div className="space-y-3">
                {mockExecutionLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                        log.type === 'success' ? 'bg-green-500' :
                        log.type === 'warning' ? 'bg-yellow-500' :
                        log.type === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{log.action}</h4>
                              {log.loadId && (
                                <Badge variant="outline" className="text-xs">
                                  {log.loadId}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 break-words">
                              {log.details}
                            </p>
                            {log.carrierName && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-blue-600">
                                  Carrier: {log.carrierName}
                                </span>
                                {log.carrierId && (
                                  <Badge variant="secondary" className="text-xs">
                                    ID: {log.carrierId}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {mockExecutionLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No execution logs yet</p>
                    <p className="text-sm">Logs will appear here once the waterfall starts processing loads</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowLogsModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}