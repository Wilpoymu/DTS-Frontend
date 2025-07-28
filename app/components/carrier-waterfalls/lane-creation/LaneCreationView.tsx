"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Eye, MapPin } from "lucide-react"
import { Lane } from "../shared/types"

interface LaneCreationViewProps {
  savedWaterfalls: Lane[]
  onCreateLane: (lane: Lane) => void
  onViewWaterfallDetails: (lane: Lane) => void
}

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
      return (
        <Badge className="text-dts-black bg-dts-neongreen" variant="secondary">
          Completed
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function LaneCreationView({ 
  savedWaterfalls, 
  onCreateLane, 
  onViewWaterfallDetails 
}: LaneCreationViewProps) {
  const [originZip, setOriginZip] = useState("")
  const [destinationZip, setDestinationZip] = useState("")
  const [equipmentType, setEquipmentType] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [waterfallCurrentPage, setWaterfallCurrentPage] = useState(1)
  const waterfallsPerPage = 10

  // Mock data for demo - in real app this would come from props or API
  const mockWaterfalls: Lane[] = [
    {
      id: "1",
      originZip: "90210",
      destinationZip: "10001",
      equipment: "Dry Van",
      status: "Triggered",
      quotedLoads: 12,
      creationDate: "2024-01-10",
      waterfall: {
        id: "wf-1",
        status: "Active",
        items: [],
      },
    },
    {
      id: "2",
      originZip: "60601",
      destinationZip: "48201",
      equipment: "Refrigerated",
      status: "Triggered",
      quotedLoads: 8,
      creationDate: "2024-01-12",
    },
    {
      id: "3",
      originZip: "77001",
      destinationZip: "75201",
      equipment: "Flatbed",
      status: "Completed",
      quotedLoads: 5,
      creationDate: "2024-01-08",
    },
    {
      id: "4",
      originZip: "33101",
      destinationZip: "30301",
      equipment: "Dry Van",
      status: "Paused",
      quotedLoads: 15,
      creationDate: "2024-01-15",
    },
    {
      id: "5",
      originZip: "94102",
      destinationZip: "98101",
      equipment: "Refrigerated",
      status: "Not Triggered",
      quotedLoads: 0,
      creationDate: "2024-01-18",
    },
  ]

  const allWaterfalls = [...savedWaterfalls, ...mockWaterfalls]
  const filteredWaterfalls = statusFilter === "all" 
    ? allWaterfalls 
    : allWaterfalls.filter((waterfall) => waterfall.status === statusFilter)

  const totalWaterfallPages = Math.ceil(filteredWaterfalls.length / waterfallsPerPage)
  const waterfallStartIndex = (waterfallCurrentPage - 1) * waterfallsPerPage
  const waterfallEndIndex = waterfallStartIndex + waterfallsPerPage
  const currentWaterfalls = filteredWaterfalls.slice(waterfallStartIndex, waterfallEndIndex)

  const handleWaterfallPreviousPage = () => setWaterfallCurrentPage((prev) => Math.max(prev - 1, 1))
  const handleWaterfallNextPage = () => setWaterfallCurrentPage((prev) => Math.min(prev + 1, totalWaterfallPages))
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setWaterfallCurrentPage(1)
  }

  const createLane = () => {
    if (originZip && destinationZip && equipmentType) {
      const newLane: Lane = {
        id: Date.now().toString(),
        originZip,
        destinationZip,
        equipment: equipmentType,
        status: "Draft",
        quotedLoads: Math.floor(Math.random() * 20) + 1,
        creationDate: new Date().toISOString().split("T")[0],
      }
      onCreateLane(newLane)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Carrier Waterfalls</h1>
        <p className="text-gray-600 mt-2">Create and configure carrier waterfall dispatch sequences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Create new waterfall</CardTitle>
          <CardDescription>
            Begin by selecting the origin, destination, and equipment type to define the Lane
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
            <div className="mb-4">
              <Label className="text-base font-semibold text-gray-700">Lane Configuration</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin-zip">Origin ZIP Code</Label>
                <Input
                  id="origin-zip"
                  placeholder="Enter ZIP code"
                  value={originZip}
                  onChange={(e) => setOriginZip(e.target.value)}
                />
                {originZip && getLocationFromZip(originZip) && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {getLocationFromZip(originZip)?.city}, {getLocationFromZip(originZip)?.state}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination-zip">Destination ZIP Code</Label>
                <Input
                  id="destination-zip"
                  placeholder="Enter ZIP code"
                  value={destinationZip}
                  onChange={(e) => setDestinationZip(e.target.value)}
                />
                {destinationZip && getLocationFromZip(destinationZip) && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {getLocationFromZip(destinationZip)?.city}, {getLocationFromZip(destinationZip)?.state}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-type">Equipment Type</Label>
                <Select value={equipmentType} onValueChange={setEquipmentType}>
                  <SelectTrigger id="equipment-type">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dry Van">Dry Van</SelectItem>
                    <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                    <SelectItem value="Flatbed">Flatbed</SelectItem>
                    <SelectItem value="Step Deck">Step Deck</SelectItem>
                    <SelectItem value="Lowboy">Lowboy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={createLane}
              disabled={!originZip || !destinationZip || !equipmentType}
              className="px-8"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Existing Waterfalls</CardTitle>
              <CardDescription>Manage and view existing waterfall configurations</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Triggered">Triggered</SelectItem>
                  <SelectItem value="Not Triggered">Not Triggered</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lane</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quoted Loads</TableHead>
                  <TableHead>Creation Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentWaterfalls.map((waterfall) => {
                  const originLocation = getLocationFromZip(waterfall.originZip)
                  const destinationLocation = getLocationFromZip(waterfall.destinationZip)
                  return (
                    <TableRow key={waterfall.id}>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {originLocation
                              ? `${originLocation.city}, ${originLocation.state}`
                              : waterfall.originZip}{" "}
                            →{" "}
                            {destinationLocation
                              ? `${destinationLocation.city}, ${destinationLocation.state}`
                              : waterfall.destinationZip}
                          </div>
                          <div className="text-xs text-gray-500">
                            {waterfall.originZip} → {waterfall.destinationZip}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{waterfall.equipment}</TableCell>
                      <TableCell>{getStatusBadge(waterfall.status)}</TableCell>
                      <TableCell>{waterfall.quotedLoads}</TableCell>
                      <TableCell>{waterfall.creationDate}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewWaterfallDetails(waterfall)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {totalWaterfallPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWaterfallPreviousPage}
                  disabled={waterfallCurrentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Page {waterfallCurrentPage} of {totalWaterfallPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWaterfallNextPage}
                  disabled={waterfallCurrentPage === totalWaterfallPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
