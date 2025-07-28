"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Play, Pause, Plus, Trash2, Save, Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Carrier {
  id: string
  name: string
  tier?: number
  offerSentTime?: string
  acceptanceStatus: "Pending" | "Accepted" | "Declined" | "No Response"
  responseTime?: string
}

interface Tier {
  id: string
  name: string
  carriers: string[]
  responseWindow: number
}

interface LaneDetailsModalProps {
  lane: any
  isOpen: boolean
  onClose: () => void
}

export default function LaneDetailsModal({ lane, isOpen, onClose }: LaneDetailsModalProps) {
  const [waterfallType, setWaterfallType] = useState<"flat" | "tiered" | "hybrid">("tiered")
  const [tiers, setTiers] = useState<Tier[]>([
    { id: "1", name: "Tier 1 - Preferred", carriers: [], responseWindow: 30 },
  ])
  const [hybridCarriers, setHybridCarriers] = useState<string[]>([])
  const [executionStatus, setExecutionStatus] = useState<"waiting" | "in-progress" | "completed">("waiting")
  const [showLogs, setShowLogs] = useState(false)

  const availableCarriers = [
    "Swift Transportation",
    "Regional Express",
    "Cold Chain Logistics",
    "Heavy Haul Specialists",
    "Quick Delivery Co",
    "National Freight",
    "Metro Logistics",
    "Prime Transport",
  ]

  const carrierExecutionData: Carrier[] = [
    {
      id: "1",
      name: "Swift Transportation",
      tier: 1,
      offerSentTime: "2024-01-15 09:00:00",
      acceptanceStatus: "Accepted",
      responseTime: "2024-01-15 09:15:00",
    },
    {
      id: "2",
      name: "Regional Express",
      tier: 1,
      offerSentTime: "2024-01-15 09:00:00",
      acceptanceStatus: "Declined",
      responseTime: "2024-01-15 09:25:00",
    },
    {
      id: "3",
      name: "Cold Chain Logistics",
      tier: 2,
      offerSentTime: "2024-01-15 09:30:00",
      acceptanceStatus: "Pending",
    },
  ]

  const addTier = () => {
    const newTier: Tier = {
      id: Date.now().toString(),
      name: `Tier ${tiers.length + 1}`,
      carriers: [],
      responseWindow: 30,
    }
    setTiers([...tiers, newTier])
  }

  const deleteTier = (tierId: string) => {
    setTiers(tiers.filter((tier) => tier.id !== tierId))
  }

  const updateTier = (tierId: string, field: keyof Tier, value: any) => {
    setTiers(tiers.map((tier) => (tier.id === tierId ? { ...tier, [field]: value } : tier)))
  }

  const addCarrierToTier = (tierId: string, carrier: string) => {
    setTiers(tiers.map((tier) => (tier.id === tierId ? { ...tier, carriers: [...tier.carriers, carrier] } : tier)))
  }

  const removeCarrierFromTier = (tierId: string, carrierIndex: number) => {
    setTiers(
      tiers.map((tier) =>
        tier.id === tierId ? { ...tier, carriers: tier.carriers.filter((_, index) => index !== carrierIndex) } : tier,
      ),
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Declined":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "No Response":
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      default:
        return null
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
      case "No Response":
        return <Badge variant="secondary">No Response</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const hasConfiguredCarriers = () => {
    const tierCarriers = tiers.some((tier) => tier.carriers.length > 0)
    const hybridCarriersExist = waterfallType === "hybrid" && hybridCarriers.length > 0
    return tierCarriers || hybridCarriersExist
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Lane Details - {lane.originZip} → {lane.destinationZip}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lane Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Lane Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Origin ZIP</Label>
                  <p className="text-lg font-semibold">{lane.originZip}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Destination ZIP</Label>
                  <p className="text-lg font-semibold">{lane.destinationZip}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Equipment</Label>
                  <p className="text-lg font-semibold">{lane.equipment}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className="mt-1">{lane.status}</Badge>
                </div>
              </div>
              {lane.load && (
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm font-medium text-gray-600">Load ID</Label>
                  <p className="text-lg font-semibold">{lane.load.id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Tabs */}
          <Tabs defaultValue="waterfall" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="waterfall">Waterfall Configuration</TabsTrigger>
              <TabsTrigger value="execution">Execution Monitor</TabsTrigger>
            </TabsList>

            <TabsContent value="waterfall" className="space-y-6">
              {/* Waterfall Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Waterfall Structure</CardTitle>
                  <CardDescription>Choose how carriers should be organized and contacted</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        waterfallType === "flat" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                      onClick={() => setWaterfallType("flat")}
                    >
                      <h3 className="font-medium">Flat</h3>
                      <p className="text-sm text-gray-600">Sequential carrier contact</p>
                    </div>
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        waterfallType === "tiered" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                      onClick={() => setWaterfallType("tiered")}
                    >
                      <h3 className="font-medium">Tiered</h3>
                      <p className="text-sm text-gray-600">Carriers grouped by priority</p>
                    </div>
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        waterfallType === "hybrid" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                      onClick={() => setWaterfallType("hybrid")}
                    >
                      <h3 className="font-medium">Hybrid</h3>
                      <p className="text-sm text-gray-600">Mix of tiered and individual</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tier Configuration */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Tier Configuration</CardTitle>
                      <CardDescription>Configure carrier tiers and response windows</CardDescription>
                    </div>
                    <Button onClick={addTier} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tier
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tiers.map((tier, index) => (
                    <div key={tier.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <Input
                          value={tier.name}
                          onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                          className="font-medium"
                        />
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Response Window:</Label>
                          <Input
                            type="number"
                            value={tier.responseWindow}
                            onChange={(e) => updateTier(tier.id, "responseWindow", Number.parseInt(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-600">min</span>
                          {tiers.length > 1 && (
                            <Button size="sm" variant="outline" onClick={() => deleteTier(tier.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Carriers in this tier</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tier.carriers.map((carrier, carrierIndex) => (
                            <Badge key={carrierIndex} variant="secondary" className="flex items-center gap-1">
                              {carrier}
                              <button
                                onClick={() => removeCarrierFromTier(tier.id, carrierIndex)}
                                className="ml-1 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={(value) => addCarrierToTier(tier.id, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add carrier to tier" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCarriers
                              .filter((carrier) => !tier.carriers.includes(carrier))
                              .map((carrier) => (
                                <SelectItem key={carrier} value={carrier}>
                                  {carrier}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Hybrid Carriers */}
              {waterfallType === "hybrid" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Individual Carriers</CardTitle>
                    <CardDescription>Carriers outside of tier structure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {hybridCarriers.map((carrier, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {carrier}
                            <button
                              onClick={() => setHybridCarriers(hybridCarriers.filter((_, i) => i !== index))}
                              className="ml-1 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={(value) => setHybridCarriers([...hybridCarriers, value])}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add individual carrier" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCarriers
                            .filter((carrier) => !hybridCarriers.includes(carrier))
                            .map((carrier) => (
                              <SelectItem key={carrier} value={carrier}>
                                {carrier}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <Button disabled={!hasConfiguredCarriers()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Waterfall
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="execution" className="space-y-6">
              {/* Execution Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Execution Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {executionStatus === "waiting" && <Clock className="h-5 w-5 text-gray-600" />}
                          {executionStatus === "in-progress" && <AlertCircle className="h-5 w-5 text-blue-600" />}
                          {executionStatus === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                          <Badge
                            variant={
                              executionStatus === "completed"
                                ? "default"
                                : executionStatus === "in-progress"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              executionStatus === "completed"
                                ? "bg-green-100 text-green-800"
                                : executionStatus === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : ""
                            }
                          >
                            {executionStatus === "waiting"
                              ? "Waiting"
                              : executionStatus === "in-progress"
                                ? "In Progress"
                                : "Completed"}
                          </Badge>
                        </div>
                      </div>
                      {executionStatus === "in-progress" && (
                        <div className="flex-1 max-w-xs">
                          <Progress value={65} className="w-full" />
                          <p className="text-sm text-gray-600 mt-1">Tier 2 in progress...</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {executionStatus === "waiting" && (
                        <Button onClick={() => setExecutionStatus("in-progress")}>
                          <Play className="h-4 w-4 mr-2" />
                          Trigger Waterfall
                        </Button>
                      )}
                      {executionStatus === "in-progress" && (
                        <>
                          <Button variant="outline" onClick={() => setExecutionStatus("waiting")}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Waterfall
                          </Button>
                          <Button variant="outline">Manually Assign Carrier</Button>
                        </>
                      )}
                      <Button variant="outline" onClick={() => setShowLogs(true)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Logs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Carrier Execution Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Carrier Responses</CardTitle>
                  <CardDescription>Real-time tracking of carrier communications</CardDescription>
                </CardHeader>
                <CardContent>
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
                      {carrierExecutionData.map((carrier) => (
                        <TableRow key={carrier.id}>
                          <TableCell className="font-medium">{carrier.name}</TableCell>
                          <TableCell>
                            {carrier.tier ? (
                              <Badge variant="outline">Tier {carrier.tier}</Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {carrier.offerSentTime ? (
                              <span className="text-sm">{carrier.offerSentTime}</span>
                            ) : (
                              <span className="text-gray-400">Not sent</span>
                            )}
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
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
