"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Eye,
  Edit,
  Save,
  X,
  Users,
  Settings,
} from "lucide-react"

interface WaterfallDetailsModalProps {
  waterfall: any
  isOpen: boolean
  onClose: () => void
}

export default function WaterfallDetailsModal({ waterfall, isOpen, onClose }: WaterfallDetailsModalProps) {
  const [isEditingRate, setIsEditingRate] = useState(false)
  const [editedRate, setEditedRate] = useState(waterfall?.rate || 0)
  const [showLogs, setShowLogs] = useState(false)

  // Mock waterfall configuration data
  const waterfallConfig = {
    tiers: [
      {
        id: "tier1",
        name: "Tier 1 - Preferred Carriers",
        responseWindow: 30,
        carriers: [
          {
            name: "Swift Transportation",
            mcNumber: "MC789012",
            status: "Active",
            contactName: "John Smith",
            contactEmail: "john.smith@swift.com",
          },
          {
            name: "Regional Express",
            mcNumber: "MC890123",
            status: "Active",
            contactName: "Sarah Johnson",
            contactEmail: "sarah.johnson@regional.com",
          },
        ],
      },
      {
        id: "tier2",
        name: "Tier 2 - Regional Carriers",
        responseWindow: 45,
        carriers: [
          {
            name: "Cold Chain Logistics",
            mcNumber: "MC901234",
            status: "Active",
            contactName: "Mike Davis",
            contactEmail: "mike.davis@coldchain.com",
          },
          {
            name: "Heavy Haul Specialists",
            mcNumber: "MC012345",
            status: "Active",
            contactName: "Lisa Brown",
            contactEmail: "lisa.brown@heavyhaul.com",
          },
        ],
      },
    ],
    individualCarriers: [
      {
        name: "Quick Delivery Co",
        mcNumber: "MC123456",
        responseWindow: 60,
        status: "Active",
        contactName: "Robert Wilson",
        contactEmail: "robert.wilson@quickdelivery.com",
      },
    ],
  }

  // Mock execution data based on status
  const getExecutionData = () => {
    switch (waterfall.status) {
      case "Triggered":
        return {
          currentLoad: "LD001",
          message: "Processing load LD001 - Tier 1 active",
          showTrigger: false,
          showLogs: true,
          showCarrierResponses: true,
        }
      case "Completed":
        return {
          currentLoad: "LD005",
          message: "Last processed: LD005 - Successfully assigned to Swift Transportation",
          showTrigger: false,
          showLogs: true,
          showCarrierResponses: true,
        }
      case "Not Triggered":
        return {
          currentLoad: null,
          message: "Searching for load match...",
          showTrigger: false,
          showLogs: false,
          showCarrierResponses: false,
        }
      case "Paused":
        return {
          currentLoad: null,
          message: "Waterfall execution is paused",
          showTrigger: true,
          showLogs: true,
          showCarrierResponses: true,
        }
      default:
        return {
          currentLoad: null,
          message: "Waiting for execution",
          showTrigger: false,
          showLogs: false,
          showCarrierResponses: false,
        }
    }
  }

  const executionData = getExecutionData()

  // Mock carrier responses data
  const carrierResponses = [
    {
      id: "1",
      name: "Swift Transportation",
      tier: "Tier 1",
      offerSentTime: "2024-01-15 09:00:00",
      acceptanceStatus: "Accepted",
      responseTime: "2024-01-15 09:15:00",
    },
    {
      id: "2",
      name: "Regional Express",
      tier: "Tier 1",
      offerSentTime: "2024-01-15 09:00:00",
      acceptanceStatus: "Declined",
      responseTime: "2024-01-15 09:25:00",
    },
    {
      id: "3",
      name: "Cold Chain Logistics",
      tier: "Tier 2",
      offerSentTime: "2024-01-15 09:30:00",
      acceptanceStatus: "Pending",
      responseTime: null,
    },
  ]

  // Mock processed loads data - Latest 5 loads
  const getLatestProcessedLoads = () => {
    if (waterfall.status === "Not Triggered") {
      return []
    }

    const baseLoads = [
      {
        id: "LD008",
        originZip: "90210",
        destinationZip: "10001",
        pickupDateTime: "2024-01-22 07:45",
        deliveryDateTime: "2024-01-24 13:45",
        equipmentType: "Dry Van",
        shipmentMode: "FTL",
        weight: "45,600 lbs",
        commodity: "Food Products",
        assignedCarrier: "Cold Chain Logistics",
        finalRate: 2180.0,
        bookingDate: "2024-01-21",
        executionTime: "30 minutes",
        status: waterfall.status === "Triggered" ? "In Transit" : "Completed",
      },
      {
        id: "LD007",
        originZip: "90210",
        destinationZip: "10001",
        pickupDateTime: "2024-01-21 10:00",
        deliveryDateTime: "2024-01-23 16:00",
        equipmentType: "Dry Van",
        shipmentMode: "FTL",
        weight: "47,200 lbs",
        commodity: "Industrial Equipment",
        assignedCarrier: "Regional Express",
        finalRate: 2250.0,
        bookingDate: "2024-01-20",
        executionTime: "28 minutes",
        status: "Completed",
      },
      {
        id: "LD006",
        originZip: "90210",
        destinationZip: "10001",
        pickupDateTime: "2024-01-20 08:30",
        deliveryDateTime: "2024-01-22 14:30",
        equipmentType: "Dry Van",
        shipmentMode: "FTL",
        weight: "43,500 lbs",
        commodity: "Consumer Goods",
        assignedCarrier: "Swift Transportation",
        finalRate: 2125.0,
        bookingDate: "2024-01-19",
        executionTime: "22 minutes",
        status: "Completed",
      },
      {
        id: "LD005",
        originZip: "90210",
        destinationZip: "10001",
        pickupDateTime: "2024-01-19 11:00",
        deliveryDateTime: "2024-01-21 17:00",
        equipmentType: "Dry Van",
        shipmentMode: "FTL",
        weight: "46,800 lbs",
        commodity: "Auto Parts",
        assignedCarrier: "Quick Delivery Co",
        finalRate: 2175.0,
        bookingDate: "2024-01-18",
        executionTime: "18 minutes",
        status: "Completed",
      },
      {
        id: "LD004",
        originZip: "90210",
        destinationZip: "10001",
        pickupDateTime: "2024-01-18 09:15",
        deliveryDateTime: "2024-01-20 15:30",
        equipmentType: "Dry Van",
        shipmentMode: "FTL",
        weight: "44,200 lbs",
        commodity: "Textiles",
        assignedCarrier: "Heavy Haul Specialists",
        finalRate: 2050.0,
        bookingDate: "2024-01-17",
        executionTime: "20 minutes",
        status: "Completed",
      },
    ]

    return baseLoads
  }

  const latestLoads = getLatestProcessedLoads()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Declined":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>
      case "Declined":
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSaveRate = () => {
    setIsEditingRate(false)
    console.log("Saving rate:", editedRate)
  }

  const handleCancelEdit = () => {
    setEditedRate(waterfall?.rate || 0)
    setIsEditingRate(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-2xl font-bold">Waterfall Details</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {/* Lane Summary */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Lane Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Origin ZIP</Label>
                    <p className="text-2xl font-bold text-primary">{waterfall.originZip}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Destination ZIP</Label>
                    <p className="text-2xl font-bold text-primary">{waterfall.destinationZip}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Equipment</Label>
                    <p className="text-2xl font-bold">{waterfall.equipment}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Rate</Label>
                    {isEditingRate ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={editedRate}
                            onChange={(e) => setEditedRate(Number.parseFloat(e.target.value))}
                            className="pl-8 text-lg font-bold w-36"
                          />
                        </div>
                        <Button size="sm" onClick={handleSaveRate}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <p className="text-2xl font-bold text-green-600">
                          ${editedRate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingRate(true)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {waterfall.status}
                    </Badge>
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
                      <Button variant="outline" className="gap-2 bg-transparent">
                        <Settings className="h-4 w-4" />
                        Edit Configuration
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {waterfallConfig.tiers.map((tier, index) => (
                      <div key={tier.id} className="border rounded-lg p-6 bg-muted/30">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{tier.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Response Window: {tier.responseWindow} minutes
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {tier.carriers.length} carriers
                          </Badge>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Carrier Name</TableHead>
                                <TableHead>MC Number</TableHead>
                                <TableHead>Contact Name</TableHead>
                                <TableHead>Contact Email</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tier.carriers.map((carrier, carrierIndex) => (
                                <TableRow key={carrierIndex}>
                                  <TableCell className="font-medium">{carrier.name}</TableCell>
                                  <TableCell>{carrier.mcNumber}</TableCell>
                                  <TableCell>{carrier.contactName}</TableCell>
                                  <TableCell>{carrier.contactEmail}</TableCell>
                                  <TableCell>
                                    <Badge variant={carrier.status === "Active" ? "default" : "secondary"}>
                                      {carrier.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}

                    {/* Individual Carriers */}
                    {waterfallConfig.individualCarriers.length > 0 && (
                      <div className="border rounded-lg p-6 bg-muted/30">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">
                            {waterfallConfig.tiers.length + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Individual Carriers</h3>
                            <p className="text-sm text-muted-foreground">Carriers outside of tier structure</p>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Carrier Name</TableHead>
                                <TableHead>MC Number</TableHead>
                                <TableHead>Contact Name</TableHead>
                                <TableHead>Contact Email</TableHead>
                                <TableHead>Response Window</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {waterfallConfig.individualCarriers.map((carrier, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{carrier.name}</TableCell>
                                  <TableCell>{carrier.mcNumber}</TableCell>
                                  <TableCell>{carrier.contactName}</TableCell>
                                  <TableCell>{carrier.contactEmail}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm">{carrier.responseWindow} min</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={carrier.status === "Active" ? "default" : "secondary"}>
                                      {carrier.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="execution" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Execution Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold text-lg">{waterfall.status}</p>
                            <p className="text-sm text-muted-foreground">{executionData.message}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {executionData.showTrigger && (
                          <Button className="gap-2">
                            <Play className="h-4 w-4" />
                            Trigger Waterfall
                          </Button>
                        )}
                        {executionData.showLogs && (
                          <Button variant="outline" onClick={() => setShowLogs(true)} className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Logs
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Carrier Responses */}
                    {executionData.showCarrierResponses && (
                      <div className="space-y-4">
                        <div className="border-t pt-6">
                          <h3 className="font-semibold text-lg mb-2">Carrier Responses</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Real-time tracking of carrier communications
                          </p>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Carrier Name</TableHead>
                                  <TableHead>Tier</TableHead>
                                  <TableHead>Offer Sent Time</TableHead>
                                  <TableHead>Acceptance Status</TableHead>
                                  <TableHead>Response Time</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {carrierResponses.map((carrier) => (
                                  <TableRow key={carrier.id}>
                                    <TableCell className="font-medium">{carrier.name}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{carrier.tier}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm">{carrier.offerSentTime}</span>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {getStatusIcon(carrier.acceptanceStatus)}
                                        {getStatusBadge(carrier.acceptanceStatus)}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {carrier.responseTime ? (
                                        <span className="text-sm">{carrier.responseTime}</span>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Active and Past Loads */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Active and Past Loads</CardTitle>
                <CardDescription>
                  {latestLoads.length === 0
                    ? "No loads have been processed through this waterfall yet"
                    : `Latest 5 loads processed through this waterfall`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestLoads.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium">No processed loads</p>
                    <p className="text-sm">This waterfall hasn't processed any loads yet.</p>
                    {waterfall.status === "Not Triggered" && (
                      <p className="text-sm mt-2">Trigger the waterfall to start processing loads.</p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Load ID</TableHead>
                          <TableHead>Origin ZIP</TableHead>
                          <TableHead>Destination ZIP</TableHead>
                          <TableHead>Pickup Date/Time</TableHead>
                          <TableHead>Delivery Date/Time</TableHead>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Commodity</TableHead>
                          <TableHead>Assigned Carrier</TableHead>
                          <TableHead>Final Rate</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Booking Date</TableHead>
                          <TableHead>Execution Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {latestLoads.map((load) => (
                          <TableRow key={load.id}>
                            <TableCell className="font-medium">{load.id}</TableCell>
                            <TableCell>{load.originZip}</TableCell>
                            <TableCell>{load.destinationZip}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{load.pickupDateTime.split(" ")[0]}</div>
                                <div className="text-muted-foreground">{load.pickupDateTime.split(" ")[1]}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{load.deliveryDateTime.split(" ")[0]}</div>
                                <div className="text-muted-foreground">{load.deliveryDateTime.split(" ")[1]}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{load.equipmentType}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{load.shipmentMode}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">{load.weight}</TableCell>
                            <TableCell className="text-sm">{load.commodity}</TableCell>
                            <TableCell className="font-medium">{load.assignedCarrier}</TableCell>
                            <TableCell className="font-medium text-green-600">
                              $
                              {load.finalRate.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={load.status === "Completed" ? "default" : "secondary"}
                                className={
                                  load.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }
                              >
                                {load.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{load.bookingDate}</TableCell>
                            <TableCell className="text-sm">{load.executionTime}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logs Modal */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execution Logs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                { time: "2024-01-15 09:00:00", event: "Waterfall execution started for load LD001", type: "info" },
                {
                  time: "2024-01-15 09:00:05",
                  event: "Tier 1 carriers contacted (Swift Transportation, Regional Express)",
                  type: "info",
                },
                {
                  time: "2024-01-15 09:15:00",
                  event: "Swift Transportation accepted offer at $2,150",
                  type: "success",
                },
                { time: "2024-01-15 09:25:00", event: "Regional Express declined offer", type: "warning" },
                {
                  time: "2024-01-15 09:30:00",
                  event: "Load LD001 successfully assigned to Swift Transportation",
                  type: "success",
                },
                { time: "2024-01-15 10:00:00", event: "Waterfall execution completed", type: "info" },
              ].map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                  <div
                    className={`w-3 h-3 rounded-full mt-2 ${
                      log.type === "success"
                        ? "bg-green-500"
                        : log.type === "warning"
                          ? "bg-yellow-500"
                          : log.type === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">{log.event}</p>
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
