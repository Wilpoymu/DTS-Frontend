export interface ExecutionLog {
  id: string
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
  action: string
  details: string
  carrierId?: string
  carrierName?: string
  loadId?: string
}

export interface WaterfallExecution {
  currentLoad: string | null
  status: 'idle' | 'processing' | 'waiting_response' | 'completed' | 'paused'
  currentTier: number
  totalLoadsProcessed: number
  successfulAssignments: number
  pendingResponses: number
  averageResponseTime: string
  lastActivity: string
}

export interface CarrierResponse {
  carrierId: string
  carrierName: string
  tier: number
  offerSentTime: string
  responseTime?: string
  status: 'pending' | 'accepted' | 'declined' | 'no_response'
  responseWindow: number
  timeRemaining?: number
}

export const mockExecutionData: WaterfallExecution = {
  currentLoad: "LD009",
  status: "processing",
  currentTier: 1,
  totalLoadsProcessed: 8,
  successfulAssignments: 7,
  pendingResponses: 2,
  averageResponseTime: "18 minutes",
  lastActivity: "2 minutes ago"
}

export const mockExecutionLogs: ExecutionLog[] = [
  {
    id: "log_001",
    timestamp: "2024-07-14 09:45:32",
    type: "info",
    action: "Load Received",
    details: "New load LD009 (Food Products, 45,600 lbs) received and matched to waterfall",
    loadId: "LD009"
  },
  {
    id: "log_002",
    timestamp: "2024-07-14 09:45:35",
    type: "info",
    action: "Tier 1 Activated",
    details: "Sending offers to 2 carriers in Tier 1 (Preferred Carriers)",
  },
  {
    id: "log_003",
    timestamp: "2024-07-14 09:45:36",
    type: "success",
    action: "Email Sent",
    details: "Offer email sent to john.smith@swift.com - Response window: 30 minutes",
    carrierId: "carrier_001",
    carrierName: "Swift Transportation",
    loadId: "LD009"
  },
  {
    id: "log_004",
    timestamp: "2024-07-14 09:45:37",
    type: "success",
    action: "Email Sent",
    details: "Offer email sent to sarah.johnson@regional.com - Response window: 30 minutes",
    carrierId: "carrier_002",
    carrierName: "Regional Express",
    loadId: "LD009"
  },
  {
    id: "log_005",
    timestamp: "2024-07-14 09:58:45",
    type: "warning",
    action: "Carrier Declined",
    details: "Regional Express declined the offer via email. Reason: 'Equipment not available for requested dates'",
    carrierId: "carrier_002",
    carrierName: "Regional Express",
    loadId: "LD009"
  },
  {
    id: "log_006",
    timestamp: "2024-07-14 10:12:18",
    type: "success",
    action: "Carrier Accepted",
    details: "Swift Transportation accepted the offer at $2,180. Load successfully assigned.",
    carrierId: "carrier_001",
    carrierName: "Swift Transportation",
    loadId: "LD009"
  },
  {
    id: "log_007",
    timestamp: "2024-07-14 10:12:20",
    type: "info",
    action: "Assignment Complete",
    details: "Load LD009 successfully assigned to Swift Transportation. Total execution time: 26 minutes 48 seconds",
    carrierId: "carrier_001",
    carrierName: "Swift Transportation",
    loadId: "LD009"
  },
  {
    id: "log_008",
    timestamp: "2024-07-14 11:15:22",
    type: "info",
    action: "Load Received",
    details: "New load LD010 (Auto Parts, 47,200 lbs) received and matched to waterfall",
    loadId: "LD010"
  },
  {
    id: "log_009",
    timestamp: "2024-07-14 11:15:25",
    type: "info",
    action: "Tier 1 Activated",
    details: "Sending offers to 2 carriers in Tier 1 (Preferred Carriers)",
  },
  {
    id: "log_010",
    timestamp: "2024-07-14 11:15:26",
    type: "success",
    action: "Email Sent",
    details: "Offer email sent to john.smith@swift.com - Response window: 30 minutes",
    carrierId: "carrier_001",
    carrierName: "Swift Transportation",
    loadId: "LD010"
  }
]

export const mockCurrentResponses: CarrierResponse[] = [
  {
    carrierId: "carrier_001",
    carrierName: "Swift Transportation",
    tier: 1,
    offerSentTime: "2024-07-14 11:15:26",
    status: "pending",
    responseWindow: 30,
    timeRemaining: 28
  },
  {
    carrierId: "carrier_002",
    carrierName: "Regional Express",
    tier: 1,
    offerSentTime: "2024-07-14 11:15:27",
    status: "pending",
    responseWindow: 30,
    timeRemaining: 27
  }
]

export function getExecutionStatusMessage(status: string): string {
  switch (status) {
    case "Triggered":
      return "Waterfall is actively processing loads and sending offers to carriers"
    case "Completed":
      return "All pending loads have been successfully processed and assigned"
    case "Paused":
      return "Waterfall execution has been paused - no new offers are being sent"
    case "Not Triggered":
      return "Waterfall is idle - waiting for matching loads to arrive"
    default:
      return "Waterfall status unknown"
  }
}

export function getStatusIcon(status: string) {
  switch (status) {
    case "Triggered":
      return "🔄"
    case "Completed":
      return "✅"
    case "Paused":
      return "⏸️"
    case "Not Triggered":
      return "⏳"
    default:
      return "❓"
  }
}

export function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minutes ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hours ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
}
