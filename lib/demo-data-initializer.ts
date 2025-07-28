/**
 * Demo Data Initializer for DTS Frontend
 * Populates localStorage with sample data for development and client demos
 */

// Tipos importados del proyecto
import { Carrier, Lane, WaterfallItem, CustomTier } from '@/app/components/carrier-waterfalls/shared/types'

// ===========================
// SAMPLE CARRIERS DATA
// ===========================
export const SAMPLE_CARRIERS: Carrier[] = [
  {
    id: "1",
    name: "Swift Transportation",
    mcNumber: "MC123456",
    contactEmail: "dispatch@swift.com",
    contactName: "John Smith",
    secondaryContactName: "Sarah Johnson",
    secondaryContactEmail: "sarah.j@swift.com",
    assignedRep: "Mike Rodriguez",
    rate: 2500,
    acceptancePercentage: 85,
    onTimePickupPercentage: 92,
    onTimeDeliveryPercentage: 88,
    availability: [
      {
        id: "av1",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        capacity: 5
      }
    ]
  },
  {
    id: "2",
    name: "Regional Express LLC",
    mcNumber: "MC234567",
    contactEmail: "ops@regional.com",
    contactName: "Lisa Brown",
    secondaryContactName: "David Wilson",
    secondaryContactEmail: "david.w@regional.com",
    assignedRep: "Angela Martinez",
    rate: 2200,
    acceptancePercentage: 78,
    onTimePickupPercentage: 85,
    onTimeDeliveryPercentage: 91,
    availability: [
      {
        id: "av2",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        capacity: 3
      }
    ]
  },
  {
    id: "3",
    name: "Quick Haul Inc",
    mcNumber: "MC345678",
    contactEmail: "dispatch@quickhaul.com",
    contactName: "Robert Taylor",
    secondaryContactName: "Jessica Lee",
    secondaryContactEmail: "jessica.l@quickhaul.com",
    assignedRep: "Carlos Gutierrez",
    rate: 1950,
    acceptancePercentage: 82,
    onTimePickupPercentage: 89,
    onTimeDeliveryPercentage: 86,
    availability: [
      {
        id: "av3",
        days: ["Monday", "Wednesday", "Friday"],
        capacity: 2
      }
    ]
  },
  {
    id: "4",
    name: "Cold Chain Logistics",
    mcNumber: "MC456789",
    contactEmail: "reefer@coldchain.com",
    contactName: "Amanda Davis",
    secondaryContactName: "Mark Thompson",
    secondaryContactEmail: "mark.t@coldchain.com",
    assignedRep: "Sofia Ramirez",
    rate: 2800,
    acceptancePercentage: 90,
    onTimePickupPercentage: 94,
    onTimeDeliveryPercentage: 92,
    availability: [
      {
        id: "av4",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        capacity: 4
      }
    ]
  },
  {
    id: "5",
    name: "Heavy Haul Specialists",
    mcNumber: "MC567890",
    contactEmail: "heavy@heavyhaul.com",
    contactName: "Tom Anderson",
    secondaryContactName: "Rachel Green",
    secondaryContactEmail: "rachel.g@heavyhaul.com",
    assignedRep: "Juan Morales",
    rate: 3200,
    acceptancePercentage: 75,
    onTimePickupPercentage: 87,
    onTimeDeliveryPercentage: 89,
    availability: [
      {
        id: "av5",
        days: ["Tuesday", "Wednesday", "Thursday"],
        capacity: 1
      }
    ]
  },
  {
    id: "6",
    name: "Nationwide Freight Co",
    mcNumber: "MC678901",
    contactEmail: "dispatch@nationwide.com",
    contactName: "Kevin Miller",
    secondaryContactName: "Laura White",
    secondaryContactEmail: "laura.w@nationwide.com",
    assignedRep: "Isabella Chen",
    rate: 2350,
    acceptancePercentage: 83,
    onTimePickupPercentage: 90,
    onTimeDeliveryPercentage: 87,
    availability: [
      {
        id: "av6",
        days: ["Monday", "Tuesday", "Thursday", "Friday"],
        capacity: 6
      }
    ]
  },
  {
    id: "7",
    name: "Express Delivery Solutions",
    mcNumber: "MC789012",
    contactEmail: "expedite@express.com",
    contactName: "Michelle Garcia",
    secondaryContactName: "Chris Johnson",
    secondaryContactEmail: "chris.j@express.com",
    assignedRep: "Diego Fernandez",
    rate: 2750,
    acceptancePercentage: 88,
    onTimePickupPercentage: 95,
    onTimeDeliveryPercentage: 93,
    availability: [
      {
        id: "av7",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        capacity: 3
      }
    ]
  },
  {
    id: "8",
    name: "Premium Logistics Group",
    mcNumber: "MC890123",
    contactEmail: "premium@logistics.com",
    contactName: "Brian Clark",
    secondaryContactName: "Nicole Adams",
    secondaryContactEmail: "nicole.a@logistics.com",
    assignedRep: "Carmen Rodriguez",
    rate: 2600,
    acceptancePercentage: 86,
    onTimePickupPercentage: 91,
    onTimeDeliveryPercentage: 90,
    availability: [
      {
        id: "av8",
        days: ["Monday", "Wednesday", "Friday", "Saturday"],
        capacity: 4
      }
    ]
  }
]

// ===========================
// SAMPLE LOADS DATA
// ===========================
export const SAMPLE_LOADS = [
  {
    id: "LD-2024-001",
    status: "Booked Covered",
    originZip: "90210",
    destinationZip: "10001",
    estimatedPickupDateTime: "2024-01-25 08:00",
    actualPickupDateTime: "2024-01-25 08:15",
    estimatedDeliveryDateTime: "2024-01-27 16:00",
    actualDeliveryDateTime: "2024-01-27 15:45",
    equipment: "Dry Van",
    assignedCarrier: "Swift Transportation",
    rate: "2500",
    bookingDateTime: "2024-01-20 14:30",
    waterfallId: "WF-CA-NY-001",
    waterfallName: "California to New York Lane",
    laneId: "LANE-CA-NY-001",
    assignedTier: "Tier 1",
    weight: "45,200 lbs",
    commodity: "Electronics"
  },
  {
    id: "LD-2024-002",
    status: "Booked Covered",
    originZip: "60601",
    destinationZip: "48201",
    estimatedPickupDateTime: "2024-01-26 10:00",
    actualPickupDateTime: "2024-01-26 10:30",
    estimatedDeliveryDateTime: "2024-01-27 18:00",
    actualDeliveryDateTime: null,
    equipment: "Reefer",
    assignedCarrier: "Cold Chain Logistics",
    rate: "2800",
    bookingDateTime: "2024-01-21 09:15",
    waterfallId: "WF-IL-MI-002",
    waterfallName: "Chicago to Detroit Reefer",
    laneId: "LANE-IL-MI-002",
    assignedTier: "Tier 1",
    weight: "42,800 lbs",
    commodity: "Frozen Foods"
  },
  {
    id: "LD-2024-003",
    status: "Booked not Covered",
    originZip: "77001",
    destinationZip: "75201",
    estimatedPickupDateTime: "2024-01-28 12:00",
    actualPickupDateTime: null,
    estimatedDeliveryDateTime: "2024-01-29 20:00",
    actualDeliveryDateTime: null,
    equipment: "Flatbed",
    assignedCarrier: null,
    rate: "1950",
    bookingDateTime: "2024-01-22 16:45",
    waterfallId: "WF-TX-TX-003",
    waterfallName: "Texas to Dallas Flatbed",
    laneId: "LANE-TX-TX-003",
    assignedTier: null,
    weight: "48,600 lbs",
    commodity: "Steel Pipes"
  },
  {
    id: "LD-2024-004",
    status: "Booked Covered",
    originZip: "33101",
    destinationZip: "30301",
    estimatedPickupDateTime: "2024-01-29 07:30",
    actualPickupDateTime: "2024-01-29 07:45",
    estimatedDeliveryDateTime: "2024-01-30 15:00",
    actualDeliveryDateTime: null,
    equipment: "Dry Van",
    assignedCarrier: "Express Delivery Solutions",
    rate: "2750",
    bookingDateTime: "2024-01-23 11:20",
    waterfallId: "WF-FL-GA-004",
    waterfallName: "Florida to Georgia Express",
    laneId: "LANE-FL-GA-004",
    assignedTier: "Tier 2",
    weight: "38,900 lbs",
    commodity: "Textiles"
  },
  {
    id: "LD-2024-005",
    status: "Booked Covered",
    originZip: "94102",
    destinationZip: "98101",
    estimatedPickupDateTime: "2024-01-30 06:00",
    actualPickupDateTime: null,
    estimatedDeliveryDateTime: "2024-01-31 14:00",
    actualDeliveryDateTime: null,
    equipment: "Reefer",
    assignedCarrier: "Regional Express LLC",
    rate: "2200",
    bookingDateTime: "2024-01-24 13:10",
    waterfallId: "WF-CA-WA-005",
    waterfallName: "West Coast Fresh Produce",
    laneId: "LANE-CA-WA-005",
    assignedTier: "Tier 1",
    weight: "41,500 lbs",
    commodity: "Fresh Produce"
  },
  {
    id: "LD-2024-006",
    status: "Booked not Covered",
    originZip: "90210",
    destinationZip: "60601",
    estimatedPickupDateTime: "2024-02-01 09:00",
    actualPickupDateTime: null,
    estimatedDeliveryDateTime: "2024-02-03 17:00",
    actualDeliveryDateTime: null,
    equipment: "Dry Van",
    assignedCarrier: null,
    rate: "2400",
    bookingDateTime: "2024-01-25 10:30",
    waterfallId: null,
    waterfallName: null,
    laneId: null,
    assignedTier: null,
    weight: "44,700 lbs",
    commodity: "Automotive Parts"
  },
  {
    id: "LD-2024-007",
    status: "Booked Covered",
    originZip: "10001",
    destinationZip: "33101",
    estimatedPickupDateTime: "2024-02-02 11:00",
    actualPickupDateTime: null,
    estimatedDeliveryDateTime: "2024-02-04 19:00",
    actualDeliveryDateTime: null,
    equipment: "Dry Van",
    assignedCarrier: "Nationwide Freight Co",
    rate: "2350",
    bookingDateTime: "2024-01-26 14:15",
    waterfallId: "WF-NY-FL-007",
    waterfallName: "New York to Florida Route",
    laneId: "LANE-NY-FL-007",
    assignedTier: "Tier 1",
    weight: "39,800 lbs",
    commodity: "Pharmaceuticals"
  },
  {
    id: "LD-2024-008",
    status: "Booked Covered",
    originZip: "48201",
    destinationZip: "77001",
    estimatedPickupDateTime: "2024-02-03 08:30",
    actualPickupDateTime: null,
    estimatedDeliveryDateTime: "2024-02-05 16:30",
    actualDeliveryDateTime: null,
    equipment: "Flatbed",
    assignedCarrier: "Heavy Haul Specialists",
    rate: "3200",
    bookingDateTime: "2024-01-27 09:45",
    waterfallId: "WF-MI-TX-008",
    waterfallName: "Detroit to Houston Heavy",
    laneId: "LANE-MI-TX-008",
    assignedTier: "Tier 1",
    weight: "49,900 lbs",
    commodity: "Machinery"
  }
]

// ===========================
// SAMPLE LANES/WATERFALLS DATA
// ===========================
export const SAMPLE_LANES: Lane[] = [
  {
    id: "LANE-CA-NY-001",
    originZip: "90210",
    destinationZip: "10001",
    equipment: "Dry Van",
    status: "Active",
    quotedLoads: 15,
    creationDate: "2024-01-15",
    waterfall: {
      id: "WF-CA-NY-001",
      status: "Active",
      items: [
        {
          id: "item1",
          carrier: SAMPLE_CARRIERS[0], // Swift Transportation
          responseWindow: 30
        },
        {
          id: "item2",
          carrier: SAMPLE_CARRIERS[1], // Regional Express LLC
          responseWindow: 45
        },
        {
          id: "item3",
          carrier: SAMPLE_CARRIERS[5], // Nationwide Freight Co
          responseWindow: 60
        }
      ],
      autoTierEnabled: true,
      customTiers: [
        {
          id: "tier1",
          name: "Premium Carriers",
          carrierIds: ["1"],
          order: 1
        },
        {
          id: "tier2",
          name: "Standard Carriers",
          carrierIds: ["2", "5"],
          order: 2
        }
      ]
    }
  },
  {
    id: "LANE-IL-MI-002",
    originZip: "60601",
    destinationZip: "48201",
    equipment: "Reefer",
    status: "Active",
    quotedLoads: 8,
    creationDate: "2024-01-16",
    waterfall: {
      id: "WF-IL-MI-002",
      status: "Active",
      items: [
        {
          id: "item4",
          carrier: SAMPLE_CARRIERS[3], // Cold Chain Logistics
          responseWindow: 30
        },
        {
          id: "item5",
          carrier: SAMPLE_CARRIERS[6], // Express Delivery Solutions
          responseWindow: 45
        }
      ],
      autoTierEnabled: false,
      customTiers: []
    }
  },
  {
    id: "LANE-TX-TX-003",
    originZip: "77001",
    destinationZip: "75201",
    equipment: "Flatbed",
    status: "Draft",
    quotedLoads: 3,
    creationDate: "2024-01-17",
    waterfall: {
      id: "WF-TX-TX-003",
      status: "Draft",
      items: [
        {
          id: "item6",
          carrier: SAMPLE_CARRIERS[4], // Heavy Haul Specialists
          responseWindow: 45
        },
        {
          id: "item7",
          carrier: SAMPLE_CARRIERS[2], // Quick Haul Inc
          responseWindow: 60
        }
      ],
      autoTierEnabled: true,
      customTiers: []
    }
  },
  {
    id: "LANE-FL-GA-004",
    originZip: "33101",
    destinationZip: "30301",
    equipment: "Dry Van",
    status: "Active",
    quotedLoads: 12,
    creationDate: "2024-01-18",
    waterfall: {
      id: "WF-FL-GA-004",
      status: "Active",
      items: [
        {
          id: "item8",
          carrier: SAMPLE_CARRIERS[6], // Express Delivery Solutions
          responseWindow: 30
        },
        {
          id: "item9",
          carrier: SAMPLE_CARRIERS[7], // Premium Logistics Group
          responseWindow: 45
        },
        {
          id: "item10",
          carrier: SAMPLE_CARRIERS[1], // Regional Express LLC
          responseWindow: 60
        }
      ],
      autoTierEnabled: true,
      customTiers: [
        {
          id: "tier3",
          name: "Express Tier",
          carrierIds: ["7"],
          order: 1
        }
      ]
    }
  },
  {
    id: "LANE-CA-WA-005",
    originZip: "94102",
    destinationZip: "98101",
    equipment: "Reefer",
    status: "Active",
    quotedLoads: 6,
    creationDate: "2024-01-19",
    waterfall: {
      id: "WF-CA-WA-005",
      status: "Active",
      items: [
        {
          id: "item11",
          carrier: SAMPLE_CARRIERS[3], // Cold Chain Logistics
          responseWindow: 30
        },
        {
          id: "item12",
          carrier: SAMPLE_CARRIERS[1], // Regional Express LLC
          responseWindow: 45
        }
      ],
      autoTierEnabled: false,
      customTiers: []
    }
  }
]

// ===========================
// INITIALIZATION FUNCTIONS
// ===========================

/**
 * Initialize all demo data in localStorage
 */
export function initializeDemoData(): void {
  try {
    console.log('🚀 Initializing demo data in localStorage...')
    
    // Initialize carriers data
    localStorage.setItem('demo-carriers', JSON.stringify(SAMPLE_CARRIERS))
    console.log('✅ Carriers data initialized:', SAMPLE_CARRIERS.length, 'carriers')
    
    // Initialize loads data
    localStorage.setItem('demo-loads', JSON.stringify(SAMPLE_LOADS))
    localStorage.setItem('localLoads', JSON.stringify(SAMPLE_LOADS))
    console.log('✅ Loads data initialized:', SAMPLE_LOADS.length, 'loads')
    
    // Initialize lanes/waterfalls data
    SAMPLE_LANES.forEach((lane) => {
      const key = `savedWaterfall_${lane.id}`
      const waterfallData = {
        lane: lane,
        waterfallItems: lane.waterfall?.items || [],
        autoTierEnabled: lane.waterfall?.autoTierEnabled || false,
        customTiers: lane.waterfall?.customTiers || [],
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(waterfallData))
    })
    console.log('✅ Waterfalls data initialized:', SAMPLE_LANES.length, 'waterfalls')
    
    // Set flag to indicate demo data has been initialized
    localStorage.setItem('demo-data-initialized', 'true')
    localStorage.setItem('demo-data-version', '1.0.0')
    localStorage.setItem('demo-data-timestamp', new Date().toISOString())
    
    console.log('🎉 Demo data initialization completed successfully!')
    
  } catch (error) {
    console.error('❌ Error initializing demo data:', error)
  }
}

/**
 * Check if demo data has been initialized
 */
export function isDemoDataInitialized(): boolean {
  return localStorage.getItem('demo-data-initialized') === 'true'
}

/**
 * Clear all demo data from localStorage
 */
export function clearDemoData(): void {
  try {
    console.log('🧹 Clearing demo data from localStorage...')
    
    // Clear specific demo data
    localStorage.removeItem('demo-carriers')
    localStorage.removeItem('demo-loads')
    localStorage.removeItem('localLoads')
    
    // Clear waterfall data
    const keys = Object.keys(localStorage).filter(key => key.startsWith('savedWaterfall_'))
    keys.forEach(key => localStorage.removeItem(key))
    
    // Clear demo flags
    localStorage.removeItem('demo-data-initialized')
    localStorage.removeItem('demo-data-version')
    localStorage.removeItem('demo-data-timestamp')
    
    console.log('✅ Demo data cleared successfully!')
    
  } catch (error) {
    console.error('❌ Error clearing demo data:', error)
  }
}

/**
 * Get demo carriers from localStorage
 */
export function getDemoCarriers(): Carrier[] {
  try {
    const stored = localStorage.getItem('demo-carriers')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error getting demo carriers:', error)
    return SAMPLE_CARRIERS
  }
}

/**
 * Get demo loads from localStorage
 */
export function getDemoLoads() {
  try {
    const stored = localStorage.getItem('demo-loads')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error getting demo loads:', error)
    return SAMPLE_LOADS
  }
}

/**
 * Get demo lanes from localStorage
 */
export function getDemoLanes(): Lane[] {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('savedWaterfall_'))
    return keys.map(key => {
      const data = JSON.parse(localStorage.getItem(key) || '{}')
      return data.lane
    }).filter(lane => lane && lane.id)
  } catch (error) {
    console.error('Error getting demo lanes:', error)
    return SAMPLE_LANES
  }
}

/**
 * Auto-initialize demo data if not already done
 */
export function autoInitializeDemoData(): void {
  if (typeof window !== 'undefined' && !isDemoDataInitialized()) {
    console.log('🔄 Auto-initializing demo data...')
    initializeDemoData()
  }
}
