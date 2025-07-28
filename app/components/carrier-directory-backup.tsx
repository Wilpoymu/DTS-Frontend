"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Edit, Check, X, Save, Plus, Trash2, AlertTriangle, Clock, Users, Loader2 } from "lucide-react"
import { useCarriers } from "@/hooks/use-carriers"
import { Carrier as ApiCarrier } from "@/services/index"

interface DailyAvailability {
  id: string
  days: string[]
  capacity: number
}

interface AvailabilityWindow {
  id: string
  dayRange: string
  startTime: string
  endTime: string
}

export default function CarrierDirectory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCell, setEditingCell] = useState<{ carrierId: number; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showCapacityModal, setShowCapacityModal] = useState(false)
  const [editingCarrierId, setEditingCarrierId] = useState<number | null>(null)
  const [tempDailyCapacity, setTempDailyCapacity] = useState<DailyAvailability[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [dailyCapacity, setDailyCapacity] = useState<number>(1)

  // Hook para manejar carriers desde el backend
  const { 
    carriers, 
    loading, 
    error, 
    fetchCarriers, 
    editCarrier, 
    removeCarrier,
    toggleCarrierStatus 
  } = useCarriers()

  const [carriers, setCarriers] = useState<Carrier[]>([
    {
      id: "1",
      name: "Swift Transportation",
      mc: "MC789012",
      mainContactName: "John Smith",
      mainContactPhone: "(555) 123-4567",
      mainContactEmail: "john.smith@swift.com",
      secondaryContactName: "Jane Smith",
      secondaryContactPhone: "(555) 123-4568",
      secondaryContactEmail: "jane.smith@swift.com",
      waterfallsAssigned: 3,
      averageRate: "$2.15/mile",
      responseWindow: 30,
      dailyCapacity: [
        { id: "1", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], capacity: 5 },
        { id: "2", days: ["Saturday"], capacity: 2 },
      ],
      assignedRep: "Sarah Johnson",
      acceptanceRate: 85,
      onTimePickup: 92,
      onTimeDelivery: 88,
    },
    {
      id: "2",
      name: "Regional Express",
      mc: "MC890123",
      mainContactName: "Mike Davis",
      mainContactPhone: "(555) 234-5678",
      mainContactEmail: "mike.davis@regional.com",
      secondaryContactName: "Mary Davis",
      secondaryContactPhone: "(555) 234-5679",
      secondaryContactEmail: "mary.davis@regional.com",
      waterfallsAssigned: 2,
      averageRate: "$2.08/mile",
      responseWindow: 45,
      dailyCapacity: [{ id: "1", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], capacity: 8 }],
      assignedRep: "Mike Wilson",
      acceptanceRate: 78,
      onTimePickup: 95,
      onTimeDelivery: 90,
    },
    {
      id: "3",
      name: "Cold Chain Logistics",
      mc: "MC901234",
      mainContactName: "Lisa Brown",
      mainContactPhone: "(555) 345-6789",
      mainContactEmail: "lisa.brown@coldchain.com",
      secondaryContactName: "Bob Brown",
      secondaryContactPhone: "(555) 345-6790",
      secondaryContactEmail: "bob.brown@coldchain.com",
      waterfallsAssigned: 1,
      averageRate: "$2.45/mile",
      responseWindow: 20,
      dailyCapacity: [{ id: "1", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], capacity: 3 }],
      assignedRep: "Sarah Johnson",
      acceptanceRate: 92,
      onTimePickup: 89,
      onTimeDelivery: 94,
    },
    {
      id: "4",
      name: "Heavy Haul Specialists",
      mc: "MC012345",
      mainContactName: "Robert Wilson",
      mainContactPhone: "(555) 456-7890",
      mainContactEmail: "robert.wilson@heavyhaul.com",
      secondaryContactName: "Rebecca Wilson",
      secondaryContactPhone: "(555) 456-7891",
      secondaryContactEmail: "rebecca.wilson@heavyhaul.com",
      waterfallsAssigned: 4,
      averageRate: "$3.12/mile",
      responseWindow: 60,
      dailyCapacity: [{ id: "1", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], capacity: 4 }],
      assignedRep: "Tom Anderson",
      acceptanceRate: 82,
      onTimePickup: 87,
      onTimeDelivery: 85,
    },
    {
      id: "5",
      name: "Quick Delivery Co",
      mc: "MC123456",
      mainContactName: "Jennifer Lee",
      mainContactPhone: "(555) 567-8901",
      mainContactEmail: "jennifer.lee@quickdelivery.com",
      secondaryContactName: "James Lee",
      secondaryContactPhone: "(555) 567-8902",
      secondaryContactEmail: "james.lee@quickdelivery.com",
      waterfallsAssigned: 2,
      averageRate: "$1.98/mile",
      responseWindow: 25,
      dailyCapacity: [{ id: "1", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], capacity: 6 }],
      assignedRep: "Mike Wilson",
      acceptanceRate: 75,
      onTimePickup: 93,
      onTimeDelivery: 91,
    },
  const assignedReps = ["Sarah Johnson", "Mike Wilson", "Tom Anderson", "Lisa Chen", "David Martinez"]
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Filtrar carriers basado en el término de búsqueda
  const filteredCarriers = carriers.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.mc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.primaryContact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.primaryContact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (carrier.secondaryContact?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (carrier.secondaryContact?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const startEditing = (carrierId: number, field: string, currentValue: string) => {
    setEditingCell({ carrierId, field })
    setEditValue(currentValue)
  }

  const saveEdit = async () => {
    if (editingCell) {
      // Determinar qué campos actualizar basado en el field
      let updateData: any = {}
      
      if (editingCell.field === "name") {
        updateData.name = editValue
      } else if (editingCell.field === "mc") {
        updateData.mc = editValue
      } else if (editingCell.field.includes("primaryContact")) {
        const field = editingCell.field.replace("primaryContact.", "")
        const carrier = carriers.find(c => c.id === editingCell.carrierId)
        if (carrier) {
          updateData.primaryContact = {
            ...carrier.primaryContact,
            [field]: editValue
          }
        }
      } else if (editingCell.field.includes("secondaryContact")) {
        const field = editingCell.field.replace("secondaryContact.", "")
        const carrier = carriers.find(c => c.id === editingCell.carrierId)
        if (carrier && carrier.secondaryContact) {
          updateData.secondaryContact = {
            ...carrier.secondaryContact,
            [field]: editValue
          }
        }
      }

      const result = await editCarrier(editingCell.carrierId, updateData)
      if (result.success) {
        setEditingCell(null)
        setEditValue("")
      } else {
        alert(result.error || "Error al actualizar el carrier")
      }
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const isEditing = (carrierId: number, field: string) => {
    return editingCell?.carrierId === carrierId && editingCell?.field === field
  }

  const openCapacityModal = (carrierId: number) => {
    setEditingCarrierId(carrierId)
    setTempDailyCapacity([]) // Por ahora vacío, podríamos extender el backend para esto
    setShowCapacityModal(true)
    setSelectedDays([])
    setDailyCapacity(1)
  }
  }

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const addDailyCapacityRule = () => {
    if (selectedDays.length > 0 && dailyCapacity > 0) {
      const newRule: DailyAvailability = {
        id: Date.now().toString(),
        days: [...selectedDays],
        capacity: dailyCapacity,
      }
      setTempDailyCapacity([...tempDailyCapacity, newRule])
      setSelectedDays([])
      setDailyCapacity(1)
    }
  }

  const removeDailyCapacityRule = (ruleId: string) => {
    setTempDailyCapacity(tempDailyCapacity.filter((rule) => rule.id !== ruleId))
  }

  const saveDailyCapacity = () => {
    if (editingCarrierId) {
      setCarriers(
        carriers.map((carrier) =>
          carrier.id === editingCarrierId ? { ...carrier, dailyCapacity: tempDailyCapacity } : carrier,
        ),
      )
      setShowCapacityModal(false)
      setEditingCarrierId(null)
      setTempDailyCapacity([])
      setSelectedDays([])
      setDailyCapacity(1)
    }
  }

  const cancelDailyCapacity = () => {
    setShowCapacityModal(false)
    setEditingCarrierId(null)
    setTempDailyCapacity([])
    setSelectedDays([])
    setDailyCapacity(1)
  }

  const formatDailyCapacity = (capacityRules: DailyAvailability[]): string => {
    if (capacityRules.length === 0) return "No rules configured"
    return `${capacityRules.length} rule${capacityRules.length !== 1 ? 's' : ''} configured`
  }

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Carrier Directory</CardTitle>
          <CardDescription>Manage your carrier network and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search carriers by name, MC, contact, or assigned rep..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {/* <div className="flex gap-2">
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Carrier Table */}
      <Card>
        <CardHeader>
          <CardTitle>Carriers ({filteredCarriers.length})</CardTitle>
          <CardDescription>Click on editable fields to modify carrier information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MC Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Main Contact</TableHead>
                  <TableHead>Secondary Contact</TableHead>
                  <TableHead>Waterfalls Assigned</TableHead>
                  <TableHead>Average Rate</TableHead>
                  <TableHead>Response Window</TableHead>
                  <TableHead>Daily Capacity</TableHead>
                  <TableHead>Assigned Rep</TableHead>
                  <TableHead>% Acceptance</TableHead>
                  <TableHead>% On-time Pickup</TableHead>
                  <TableHead>% On-time Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarriers.map((carrier) => (
                  <TableRow key={carrier.id}>
                    {/* MC Number - Editable */}
                    <TableCell>
                      {isEditing(carrier.id, "mc") ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-w-[120px]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            autoFocus
                          />
                          <Button size="sm" variant="outline" onClick={saveEdit}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          onClick={() => startEditing(carrier.id, "mc", carrier.mc)}
                        >
                          <Badge variant="outline" className="font-mono text-xs">
                            {carrier.mc}
                          </Badge>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Name - Editable */}
                    <TableCell>
                      {isEditing(carrier.id, "name") ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-w-[180px]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            autoFocus
                          />
                          <Button size="sm" variant="outline" onClick={saveEdit}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          onClick={() => startEditing(carrier.id, "name", carrier.name)}
                        >
                          <span className="font-medium">{carrier.name}</span>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Main Contact - Editable */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {isEditing(carrier.id, "mainContactName") ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="min-w-[150px]"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="outline" onClick={saveEdit}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                              onClick={() => startEditing(carrier.id, "mainContactName", carrier.mainContactName)}
                            >
                              <span className="font-medium text-sm">{carrier.mainContactName}</span>
                              <Edit className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{carrier.mainContactPhone}</div>
                        <div className="flex items-center gap-2">
                          {isEditing(carrier.id, "mainContactEmail") ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="email"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="min-w-[200px]"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="outline" onClick={saveEdit}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                              onClick={() =>
                                startEditing(carrier.id, "mainContactEmail", carrier.mainContactEmail)
                              }
                            >
                              <span className="text-sm text-blue-600">{carrier.mainContactEmail}</span>
                              <Edit className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Secondary Contact - Editable */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {isEditing(carrier.id, "secondaryContactName") ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="min-w-[150px]"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="outline" onClick={saveEdit}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                              onClick={() => startEditing(carrier.id, "secondaryContactName", carrier.secondaryContactName)}
                            >
                              <span className="font-medium text-sm">{carrier.secondaryContactName}</span>
                              <Edit className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{carrier.secondaryContactPhone}</div>
                        <div className="flex items-center gap-2">
                          {isEditing(carrier.id, "secondaryContactEmail") ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="email"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="min-w-[200px]"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="outline" onClick={saveEdit}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                              onClick={() =>
                                startEditing(carrier.id, "secondaryContactEmail", carrier.secondaryContactEmail)
                              }
                            >
                              <span className="text-sm text-blue-600">{carrier.secondaryContactEmail}</span>
                              <Edit className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Waterfalls Assigned - Read only */}
                    <TableCell>
                      <Badge variant="secondary">{carrier.waterfallsAssigned}</Badge>
                    </TableCell>

                    {/* Average Rate - Read only */}
                    <TableCell>
                      <span className="font-medium text-green-600">{carrier.averageRate}</span>
                    </TableCell>

                    {/* Response Window - Editable */}
                    <TableCell>
                      {isEditing(carrier.id, "responseWindow") ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-w-[100px]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            autoFocus
                          />
                          <span className="text-sm text-gray-500">min</span>
                          <Button size="sm" variant="outline" onClick={saveEdit}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          onClick={() => startEditing(carrier.id, "responseWindow", carrier.responseWindow.toString())}
                        >
                          <Badge variant="outline">{carrier.responseWindow} min</Badge>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Daily Capacity - Editable with Modal */}
                    <TableCell className="text-xs">
                      <Button
                        variant="outline"
                        onClick={() => openCapacityModal(carrier.id)}
                        className="h-6 px-2 text-xs"
                      >
                        {formatDailyCapacity(carrier.dailyCapacity)}
                      </Button>
                    </TableCell>

                    {/* Assigned Rep - Editable */}
                    <TableCell>
                      {isEditing(carrier.id, "assignedRep") ? (
                        <div className="flex items-center gap-2">
                          <Select value={editValue} onValueChange={setEditValue}>
                            <SelectTrigger className="min-w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {assignedReps.map((rep) => (
                                <SelectItem key={rep} value={rep}>
                                  {rep}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" onClick={saveEdit}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          onClick={() => startEditing(carrier.id, "assignedRep", carrier.assignedRep)}
                        >
                          <Badge variant="secondary">{carrier.assignedRep}</Badge>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* % Acceptance - Read only */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{carrier.acceptanceRate}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full" 
                            style={{ width: `${carrier.acceptanceRate}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* % On-time Pickup - Read only */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{carrier.onTimePickup}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full" 
                            style={{ width: `${carrier.onTimePickup}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* % On-time Delivery - Read only */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{carrier.onTimeDelivery}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-purple-500 rounded-full" 
                            style={{ width: `${carrier.onTimeDelivery}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Capacity Modal */}
      <Dialog open={showCapacityModal} onOpenChange={setShowCapacityModal}>
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
                  {tempDailyCapacity.length === 0 
                    ? "No capacity rules configured" 
                    : `${tempDailyCapacity.length} rule(s) configured`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tempDailyCapacity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No capacity rules configured yet.</p>
                    <p className="text-xs mt-1">Add rules above to set daily truck limits.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tempDailyCapacity.map((rule) => (
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
    </div>
  )
}
