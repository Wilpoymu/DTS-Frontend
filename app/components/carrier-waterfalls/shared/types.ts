export interface DailyAvailability {
  id: string
  days: string[]
  capacity: number
}

export interface Carrier {
  id: string
  name: string
  mcNumber: string
  contactEmail: string
  contactName?: string
  secondaryContactName?: string
  secondaryContactEmail?: string
  assignedRep?: string
  availability?: DailyAvailability[]
  rate?: number
  acceptancePercentage?: number
  onTimePickupPercentage?: number
  onTimeDeliveryPercentage?: number
  carrierMcNumber?: string
  assignedRepSecondary?: string
  availabilityWindows?: any[]
  autoTier?: boolean
}

export interface WaterfallItem {
  id: string
  carrier: Carrier
  responseWindow: number
}

export interface CustomTier {
  id: string
  name: string
  carrierIds: string[]
  order: number
}

export interface Waterfall {
  id: string
  items: WaterfallItem[]
  status: "Draft" | "Active"
  autoTierEnabled?: boolean
  customTiers?: CustomTier[]
}

export interface Lane {
  id: string
  originZip: string
  destinationZip: string
  equipment: string
  status: "Draft" | "Active" | "Paused" | "Completed" | "Triggered" | "Not Triggered"
  waterfall?: Waterfall
  quotedLoads: number
  creationDate: string
}

export interface CarrierWaterfallsProps {
  initialWaterfallId?: string
  loadInfo?: {
    loadId: string
    laneId?: string
    assignedTier?: string
  }
}

export type ViewStep = "lane-creation" | "waterfall-config" | "waterfall-details"

export interface WaterfallContextType {
  // Current step and navigation
  currentStep: ViewStep
  setCurrentStep: (step: ViewStep) => void
  
  // Lane data
  currentLane: Lane | null
  setCurrentLane: (lane: Lane | null) => void
  
  // Waterfall data
  waterfallItems: WaterfallItem[]
  setWaterfallItems: (items: WaterfallItem[]) => void
  
  // Auto-tier and custom tiers
  autoTierEnabled: boolean
  setAutoTierEnabled: (enabled: boolean) => void
  customTiers: CustomTier[]
  setCustomTiers: (tiers: CustomTier[]) => void
  
  // Editing states
  isEditingWaterfall: boolean
  setIsEditingWaterfall: (editing: boolean) => void
  selectedWaterfallForDetails: Lane | null
  setSelectedWaterfallForDetails: (lane: Lane | null) => void
  
  // Saved waterfalls
  savedWaterfalls: Lane[]
  setSavedWaterfalls: (waterfalls: Lane[]) => void
  
  // Load info for navigation
  highlightedLoadInfo: { loadId: string; laneId?: string; assignedTier?: string } | null
  setHighlightedLoadInfo: (info: { loadId: string; laneId?: string; assignedTier?: string } | null) => void
  
  // Functions
  saveWaterfall: () => void
  handleBackToWaterfalls: () => void
  handleEditWaterfall: () => void
  getSavedWaterfalls: () => Lane[]
}
