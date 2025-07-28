"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Plus, Search, Trash2, Save, Users, Clock } from "lucide-react"
import LaneDetailsModal from "./lane-details-modal"

interface Lane {
  id: string
  originZip: string
  destinationZip: string
  equipment: string
  status: "Draft" | "Active" | "Paused" | "Completed"
  waterfall?: Waterfall
  quotedLoads: number
}

interface Carrier {
  id: string
  name: string
  mcNumber: string
  contactEmail: string
  assignedRep?: string
  availabilityDays?: string
}

interface WaterfallItem {
  id: string
  type: "carrier" | "tier"
  carrier?: Carrier
  carriers?: Carrier[]
  responseWindow: number
  tierName?: string
}

interface Waterfall {
  id: string
  items: WaterfallItem[]
  status: "Draft" | "Active"
}

interface Load {
  id: string
  pickup: string
  delivery: string
  status: "Available" | "Pending" | "Assigned"
}

interface WaterfallStep {
  id: string
  name: string
  criteria: string
  priority: number
  enabled: boolean
}

export default function CarrierMatching() {
  const [currentStep, setCurrentStep] = useState<"lane-creation" | "waterfall-config">("lane-creation")
  const [originZip, setOriginZip] = useState("")
  const [destinationZip, setDestinationZip] = useState("")
  const [equipmentType, setEquipmentType] = useState("")
  const [currentLane, setCurrentLane] = useState<Lane | null>(null)
  const [waterfallItems, setWaterfallItems] = useState<WaterfallItem[]>([])
  const [showCarrierSearch, setShowCarrierSearch] = useState(false)
  const [showCarrierDetails, setShowCarrierDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null)
  const [addingToTier, setAddingToTier] = useState<string | null>(null)
  const [eligibleLoads, setEligibleLoads] = useState<Load[]>([])
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [showLoads, setShowLoads] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "paused" | "completed">("idle")
  const [executionProgress, setExecutionProgress] = useState(0)
  const [showLaneDetails, setShowLaneDetails] = useState(false)
  const [selectedLaneForDetails, setSelectedLaneForDetails] = useState<any>(null)

  // Mock data
  const availableCarriers: Carrier[] = [
    {
      id: "1",
      name: "Swift Transportation",
      mcNumber: "MC789012",
      contactEmail: "dispatch@swift.com",
      assignedRep: "Sarah Johnson",
      availabilityDays: "Mon-Fri",
    },
    {
      id: "2",
      name: "Regional Express",
      mcNumber: "MC890123",
      contactEmail: "ops@regional.com",
      assignedRep: "Mike Wilson",
      availabilityDays: "Mon-Sat",
    },
    {
      id: "3",
      name: "Cold Chain Logistics",
      mcNumber: "MC901234",
      contactEmail: "coldchain@logistics.com",
      assignedRep: "Sarah Johnson",
      availabilityDays: "24/7",
    },
    {
      id: "4",
      name: "Heavy Haul Specialists",
      mcNumber: "MC012345",
      contactEmail: "dispatch@heavyhaul.com",
      assignedRep: "Tom Anderson",
      availabilityDays: "Mon-Fri",
    },
  ]

  const pastLanes: Lane[] = [
    {
      id: "1",
      originZip: "90210",
      destinationZip: "10001",
      equipment: "Dry Van",
      status: "Active",
      quotedLoads: 12,
    },
    {
      id: "2",
      originZip: "60601",
      destinationZip: "48201",
      equipment: "Refrigerated",
      status: "Active",
      quotedLoads: 8,
    },
    {
      id: "3",
      originZip: "77001",
      destinationZip: "75201",
      equipment: "Flatbed",
      status: "Completed",
      quotedLoads: 5,
    },
  ]

  const mockLoads: Load[] = [
    { id: "LD001", pickup: "2024-01-15", delivery: "2024-01-17", status: "Available" },
    { id: "LD002", pickup: "2024-01-16", delivery: "2024-01-18", status: "Available" },
    { id: "LD003", pickup: "2024-01-17", delivery: "2024-01-19", status: "Pending" },
    { id: "LD004", pickup: "2024-01-18", delivery: "2024-01-20", status: "Available" },
  ]

  const waterfallSteps: WaterfallStep[] = [
    { id: "1", name: "Preferred Carriers", criteria: "Rating >= 4.5, On-time >= 95%", priority: 1, enabled: true },
    { id: "2", name: "Regional Carriers", criteria: "Local to lane, Rating >= 4.0", priority: 2, enabled: true },
    { id: "3", name: "Backup Carriers", criteria: "Available capacity, Rating >= 3.5", priority: 3, enabled: true },
    { id: "4", name: "Spot Market", criteria: "Market rate +10%", priority: 4, enabled: false },
  ]

  const createLane = () => {
    if (originZip && destinationZip && equipmentType) {
      const newLane: Lane = {
        id: Date.now().toString(),
        originZip,
        destinationZip,
        equipment: equipmentType,
        status: "Draft",
        quotedLoads: Math.floor(Math.random() * 20) + 1, // Mock quoted loads
      }
      setCurrentLane(newLane)
      setCurrentStep("waterfall-config")
    }
  }

  const addCarrier = () => {
    setShowCarrierSearch(true)
    setAddingToTier(null)
  }

  const addTier = () => {
    const newTier: WaterfallItem = {
      id: Date.now().toString(),
      type: "tier",
      carriers: [],
      responseWindow: 30,
      tierName: `Tier ${waterfallItems.filter((item) => item.type === "tier").length + 1}`,
    }
    setWaterfallItems([...waterfallItems, newTier])
  }

  const addCarrierToTier = (tierId: string) => {
    setAddingToTier(tierId)
    setShowCarrierSearch(true)
  }

  const selectCarrier = (carrier: Carrier) => {
    setSelectedCarrier(carrier)
    setEditingCarrier({ ...carrier })
    setShowCarrierSearch(false)
    setShowCarrierDetails(true)
  }

  const saveCarrierDetails = () => {
    if (editingCarrier && selectedCarrier) {
      // Update carrier in available carriers list
      const updatedCarrier = { ...editingCarrier }

      if (addingToTier) {
        // Add to specific tier
        setWaterfallItems(
          waterfallItems.map((item) =>
            item.id === addingToTier && item.type === "tier"
              ? { ...item, carriers: [...(item.carriers || []), updatedCarrier] }
              : item,
          ),
        )
        setAddingToTier(null)
      } else {
        // Add as standalone carrier
        const newCarrierItem: WaterfallItem = {
          id: Date.now().toString(),
          type: "carrier",
          carrier: updatedCarrier,
          responseWindow: 30,
        }
        setWaterfallItems([...waterfallItems, newCarrierItem])
      }

      setShowCarrierDetails(false)
      setSelectedCarrier(null)
      setEditingCarrier(null)
    }
  }

  const removeWaterfallItem = (itemId: string) => {
    setWaterfallItems(waterfallItems.filter((item) => item.id !== itemId))
  }

  const removeCarrierFromTier = (tierId: string, carrierIndex: number) => {
    setWaterfallItems(
      waterfallItems.map((item) =>
        item.id === tierId && item.type === "tier"
          ? { ...item, carriers: item.carriers?.filter((_, index) => index !== carrierIndex) }
          : item,
      ),
    )
  }

  const updateResponseWindow = (itemId: string, window: number) => {
    setWaterfallItems(waterfallItems.map((item) => (item.id === itemId ? { ...item, responseWindow: window } : item)))
  }

  const updateTierName = (itemId: string, name: string) => {
    setWaterfallItems(waterfallItems.map((item) => (item.id === itemId ? { ...item, tierName: name } : item)))
  }

  const saveWaterfall = () => {
    if (currentLane && waterfallItems.length > 0) {
      const waterfall: Waterfall = {
        id: Date.now().toString(),
        items: waterfallItems,
        status: "Draft",
      }
      setCurrentLane({ ...currentLane, waterfall })
      // Here you would typically save to backend
      alert("Waterfall saved as Draft!")
    }
  }

  const handleViewEligibleLoads = () => {
    if (originZip && destinationZip && equipmentType) {
      setEligibleLoads(mockLoads)
      setShowLoads(true)
    }
  }

  const handleSelectLoad = (load: Load) => {
    setSelectedLoad(load)
  }

  const handleExecution = () => {
    if (executionStatus === "idle" || executionStatus === "paused") {
      setExecutionStatus("running")
      const interval = setInterval(() => {
        setExecutionProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setExecutionStatus("completed")
            return 100
          }
          return prev + 10
        })
      }, 500)
    } else if (executionStatus === "running") {
      setExecutionStatus("paused")
    }
  }

  const handleReset = () => {
    setExecutionStatus("idle")
    setExecutionProgress(0)
  }

  const filteredCarriers = availableCarriers.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.mcNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "Draft":
        return <Badge className="bg-blue-100 text-blue-800">Draft</Badge>
      case "Paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
      case "Completed":
        return <Badge variant="secondary">Completed</Badge>
      case "Available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "Assigned":
        return <Badge variant="secondary">Assigned</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewLaneDetails = (lane: any) => {
    setSelectedLaneForDetails(lane)
    setShowLaneDetails(true)
  }

  const handleViewNewLaneDetails = () => {
    if (selectedLoad) {
      setSelectedLaneForDetails({
        id: "new",
        originZip,
        destinationZip,
        equipment: equipmentType,
        status: "New",
        load: selectedLoad,
      })
      setShowLaneDetails(true)
    }
  }

  return (
    <div className="space-y-6">
      {currentStep === "lane-creation" && (
        <>
          {/* Lane Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Create New Lane
              </CardTitle>
              <CardDescription>Define a lane by selecting origin, destination, and equipment type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="origin-zip">Origin ZIP</Label>
                  <Input
                    id="origin-zip"
                    placeholder="Enter origin ZIP"
                    value={originZip}
                    onChange={(e) => setOriginZip(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="destination-zip">Destination ZIP</Label>
                  <Input
                    id="destination-zip"
                    placeholder="Enter destination ZIP"
                    value={destinationZip}
                    onChange={(e) => setDestinationZip(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="equipment-type">Equipment Type</Label>
                  <Select value={equipmentType} onValueChange={setEquipmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry-van">Dry Van</SelectItem>
                      <SelectItem value="refrigerated">Refrigerated</SelectItem>
                      <SelectItem value="flatbed">Flatbed</SelectItem>
                      <SelectItem value="tanker">Tanker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={createLane}
                  disabled={!originZip || !destinationZip || !equipmentType}
                  className="px-8"
                >
                  Create Lane & Configure Waterfall
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {currentStep === "waterfall-config" && currentLane && (
        <>
          {/* Lane Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Lane: {currentLane.originZip} → {currentLane.destinationZip}
                  </CardTitle>
                  <CardDescription>
                    Equipment: {currentLane.equipment} • {currentLane.quotedLoads} quoted loads found
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep("lane-creation")}>
                    Back to Lane Creation
                  </Button>
                  <Button onClick={saveWaterfall} disabled={waterfallItems.length === 0}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Waterfall as Draft
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Waterfall Configuration */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Waterfall Configuration</CardTitle>
                  <CardDescription>
                    Configure carrier dispatch sequence with response windows. Mix individual carriers and tiers as
                    needed.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={addCarrier}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Carrier
                  </Button>
                  <Button variant="outline" onClick={addTier}>
                    <Users className="h-4 w-4 mr-2" />
                    Add Tier
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {waterfallItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No carriers or tiers configured yet.</p>
                  <p className="text-sm">Add carriers individually or group them in tiers to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {waterfallItems.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          {item.type === "carrier" && item.carrier && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{item.carrier.name}</h3>
                                  <p className="text-sm text-gray-600">MC: {item.carrier.mcNumber}</p>
                                  <p className="text-sm text-gray-600">{item.carrier.contactEmail}</p>
                                  {item.carrier.assignedRep && (
                                    <p className="text-sm text-gray-600">Rep: {item.carrier.assignedRep}</p>
                                  )}
                                </div>
                                <Button size="sm" variant="outline" onClick={() => removeWaterfallItem(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <Label className="text-sm">Response Window:</Label>
                                <Input
                                  type="number"
                                  value={item.responseWindow}
                                  onChange={(e) => updateResponseWindow(item.id, Number.parseInt(e.target.value))}
                                  className="w-20"
                                />
                                <span className="text-sm text-gray-600">minutes</span>
                              </div>
                            </div>
                          )}

                          {item.type === "tier" && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={item.tierName || ""}
                                    onChange={(e) => updateTierName(item.id, e.target.value)}
                                    className="font-medium w-48"
                                  />
                                  <Badge variant="outline">{item.carriers?.length || 0} carriers</Badge>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => removeWaterfallItem(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex items-center gap-2 mb-3">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <Label className="text-sm">Tier Response Window:</Label>
                                <Input
                                  type="number"
                                  value={item.responseWindow}
                                  onChange={(e) => updateResponseWindow(item.id, Number.parseInt(e.target.value))}
                                  className="w-20"
                                />
                                <span className="text-sm text-gray-600">minutes (applies to all carriers in tier)</span>
                              </div>

                              <div className="space-y-2">
                                {item.carriers?.map((carrier, carrierIndex) => (
                                  <div
                                    key={carrierIndex}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                  >
                                    <div>
                                      <p className="font-medium text-sm">{carrier.name}</p>
                                      <p className="text-xs text-gray-600">
                                        MC: {carrier.mcNumber} • {carrier.contactEmail}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeCarrierFromTier(item.id, carrierIndex)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addCarrierToTier(item.id)}
                                  className="w-full"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Carrier to Tier
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Main Selection Panel */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Create new lane
          </CardTitle>
          <CardDescription>Select lane and equipment type to view eligible loads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="origin-zip">Origin ZIP</Label>
              <Input
                id="origin-zip"
                placeholder="Enter origin ZIP"
                value={originZip}
                onChange={(e) => setOriginZip(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="destination-zip">Destination ZIP</Label>
              <Input
                id="destination-zip"
                placeholder="Enter destination ZIP"
                value={destinationZip}
                onChange={(e) => setDestinationZip(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="equipment-type">Equipment Type</Label>
              <Select value={equipmentType} onValueChange={setEquipmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry-van">Dry Van</SelectItem>
                  <SelectItem value="refrigerated">Refrigerated</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="tanker">Tanker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleViewEligibleLoads}
              disabled={!originZip || !destinationZip || !equipmentType}
              className="px-8"
            >
              View Eligible Loads
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Active & Past Lanes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Past Lanes</CardTitle>
          <CardDescription>Monitor and manage your existing lanes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origin ZIP</TableHead>
                <TableHead>Destination ZIP</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quoted Loads</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastLanes.map((lane) => (
                <TableRow key={lane.id}>
                  <TableCell className="font-medium">{lane.originZip}</TableCell>
                  <TableCell>{lane.destinationZip}</TableCell>
                  <TableCell>{lane.equipment}</TableCell>
                  <TableCell>{getStatusBadge(lane.status)}</TableCell>
                  <TableCell>{lane.quotedLoads}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {lane.status === "Active" && (
                        <Button size="sm" variant="outline">
                          Pause
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Eligible Loads Table */}
      {/* {showLoads && (
        <Card>
          <CardHeader>
            <CardTitle>Eligible Loads</CardTitle>
            <CardDescription>
              Loads matching {originZip} → {destinationZip} for {equipmentType}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Load ID</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligibleLoads.map((load) => (
                  <TableRow key={load.id}>
                    <TableCell className="font-medium">{load.id}</TableCell>
                    <TableCell>{load.pickup}</TableCell>
                    <TableCell>{load.delivery}</TableCell>
                    <TableCell>{getStatusBadge(load.status)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSelectLoad(load)}
                        variant={selectedLoad?.id === load.id ? "default" : "outline"}
                      >
                        {selectedLoad?.id === load.id ? "Selected" : "Select"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )} */}

      {/* Load Configuration Panel */}
      {/* {selectedLoad && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <CardTitle>Load Configuration - {selectedLoad.id}</CardTitle>
              <CardDescription>Configure carrier matching for selected load</CardDescription>
            </div>
            <Button onClick={handleViewNewLaneDetails} variant="outline">
              View Full Details
            </Button>
          </div>
          <CardContent>
            <Tabs defaultValue="waterfall" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="waterfall">Waterfall Configuration</TabsTrigger>
                <TabsTrigger value="execution">Execution Monitor</TabsTrigger>
              </TabsList>

              <TabsContent value="waterfall" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Carrier Selection Priority</h3>
                  {waterfallSteps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                          {step.priority}
                        </div>
                        <div>
                          <p className="font-medium">{step.name}</p>
                          <p className="text-sm text-gray-600">{step.criteria}</p>
                        </div>
                      </div>
                      <Badge variant={step.enabled ? "default" : "secondary"}>
                        {step.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Additional Criteria</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Min rating" />
                    <Input placeholder="Max rate" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="execution" className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleExecution} variant={executionStatus === "running" ? "secondary" : "default"}>
                    {executionStatus === "running" ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        {executionStatus === "paused" ? "Resume" : "Start Matching"}
                      </>
                    )}
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{executionProgress}%</span>
                  </div>
                  <Progress value={executionProgress} className="w-full" />
                </div>

                <div className="space-y-2">
                  <Label>Execution Status</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          executionStatus === "completed"
                            ? "default"
                            : executionStatus === "running"
                              ? "secondary"
                              : executionStatus === "paused"
                                ? "outline"
                                : "secondary"
                        }
                      >
                        {executionStatus.charAt(0).toUpperCase() + executionStatus.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {executionStatus === "idle" && <p>Ready to start carrier matching for {selectedLoad.id}</p>}
                      {executionStatus === "running" && <p>Searching for carriers in waterfall sequence...</p>}
                      {executionStatus === "paused" && <p>Execution paused - click Resume to continue</p>}
                      {executionStatus === "completed" && (
                        <div>
                          <p>✓ Matching completed successfully</p>
                          <p>✓ Found 3 qualified carriers</p>
                          <p>✓ Best rate: $1,850</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )} */}
      {showLaneDetails && selectedLaneForDetails && (
        <LaneDetailsModal
          lane={selectedLaneForDetails}
          isOpen={showLaneDetails}
          onClose={() => setShowLaneDetails(false)}
        />
      )}

      {/* Carrier Search Modal */}
      <Dialog open={showCarrierSearch} onOpenChange={setShowCarrierSearch}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Search and Select Carrier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by carrier name or MC number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier Name</TableHead>
                    <TableHead>MC Number</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Assigned Rep</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCarriers.map((carrier) => (
                    <TableRow key={carrier.id}>
                      <TableCell className="font-medium">{carrier.name}</TableCell>
                      <TableCell>{carrier.mcNumber}</TableCell>
                      <TableCell>{carrier.contactEmail}</TableCell>
                      <TableCell>{carrier.assignedRep || "-"}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => selectCarrier(carrier)}>
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Carrier Details Modal */}
      <Dialog open={showCarrierDetails} onOpenChange={setShowCarrierDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review and Update Carrier Details</DialogTitle>
          </DialogHeader>
          {editingCarrier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Carrier Name</Label>
                  <Input value={editingCarrier.name} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label>MC Number</Label>
                  <Input value={editingCarrier.mcNumber} disabled className="bg-gray-50" />
                </div>
              </div>
              <div>
                <Label>Contact Email *</Label>
                <Input
                  type="email"
                  value={editingCarrier.contactEmail}
                  onChange={(e) => setEditingCarrier({ ...editingCarrier, contactEmail: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Assigned Rep (Optional)</Label>
                <Select
                  value={editingCarrier.assignedRep || ""}
                  onValueChange={(value) => setEditingCarrier({ ...editingCarrier, assignedRep: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rep" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Wilson">Mike Wilson</SelectItem>
                    <SelectItem value="Tom Anderson">Tom Anderson</SelectItem>
                    <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Availability Days (Optional)</Label>
                <Input
                  value={editingCarrier.availabilityDays || ""}
                  onChange={(e) => setEditingCarrier({ ...editingCarrier, availabilityDays: e.target.value })}
                  placeholder="e.g., Mon-Fri, 24/7"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCarrierDetails(false)}>
                  Cancel
                </Button>
                <Button onClick={saveCarrierDetails} disabled={!editingCarrier.contactEmail}>
                  Add to Waterfall
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
