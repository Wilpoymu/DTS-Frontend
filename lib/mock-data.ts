// Mock data for loads with waterfall assignments
export interface LoadWithWaterfall {
  id: string
  status: "Booked Covered" | "Booked not Covered"
  estimatedPickupDateTime: string
  actualPickupDateTime?: string
  estimatedDeliveryDateTime: string
  actualDeliveryDateTime?: string
  equipment: string
  assignedCarrier?: string
  rate: string
  bookingDateTime: string
  waterfallId: string
  waterfallName: string
  laneId?: string
  assignedTier?: string
}

// Mock data para waterfalls con loads asignadas
export const mockWaterfallsWithLoads = [
  {
    id: "WF-001",
    name: "California to New York Lane",
    loads: ["LD-001"],
    status: "Active" as const
  },
  {
    id: "WF-002", 
    name: "Chicago to Detroit Reefer",
    loads: ["LD-002"],
    status: "Active" as const
  },
  {
    id: "WF-003",
    name: "Texas to Dallas Flatbed", 
    loads: ["LD-003"],
    status: "Draft" as const
  },
  {
    id: "WF-004",
    name: "Florida to Georgia Express",
    loads: ["LD-004"],
    status: "Active" as const
  },
  {
    id: "WF-005",
    name: "West Coast Fresh Produce",
    loads: ["LD-005"],
    status: "Draft" as const
  }
]

// Función para buscar el waterfall de una carga específica
export const findWaterfallByLoadId = (loadId: string) => {
  return mockWaterfallsWithLoads.find(waterfall => 
    waterfall.loads.includes(loadId)
  )
}

// Función para obtener información de asignación
export const getLoadAssignmentInfo = (loadId: string, waterfallId: string) => {
  // Simula la lógica de encontrar en qué tier fue asignada la carga
  const assignmentMap: { [key: string]: { tier: string; laneId: string } } = {
    "LD-001": { tier: "Tier 1", laneId: "LANE-CA-NY-001" },
    "LD-002": { tier: "Tier 2", laneId: "LANE-IL-MI-002" },
    "LD-003": { tier: "Tier 1", laneId: "LANE-TX-TX-003" },
    "LD-004": { tier: "Tier 3", laneId: "LANE-FL-GA-004" },
    "LD-005": { tier: "Tier 1", laneId: "LANE-CA-WA-005" }
  }

  return assignmentMap[loadId] || null
}
