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
import { useCarriersAdaptive } from "@/hooks/use-carriers-adaptive"
import { Carrier as ApiCarrier } from "@/services/index"
import CreateCarrierModal from "./create-carrier-modal"

interface DailyAvailability {
  id: string
  days: string[]
  capacity: number
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
  } = useCarriersAdaptive()

  const assignedReps = ["Sarah Johnson", "Mike Wilson", "Tom Anderson", "Lisa Chen", "David Martinez"]
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Filtrar carriers basado en el término de búsqueda
  const filteredCarriers = carriers.filter(
    (carrier) => {
      if (!carrier) return false;
      
      const searchLower = searchTerm.toLowerCase();
      
      return (
        (carrier.name || "").toLowerCase().includes(searchLower) ||
        (carrier.mc || "").toLowerCase().includes(searchLower) ||
        (carrier.primaryContact?.name || "").toLowerCase().includes(searchLower) ||
        (carrier.primaryContact?.email || "").toLowerCase().includes(searchLower) ||
        (carrier.secondaryContact?.name || "").toLowerCase().includes(searchLower) ||
        (carrier.secondaryContact?.email || "").toLowerCase().includes(searchLower)
      );
    }
  )

  const startEditing = (carrierId: number, field: string, currentValue: string) => {
    setEditingCell({ carrierId, field })
    setEditValue(currentValue)
  }

  const saveEdit = async () => {
    if (editingCell) {
      // Encontrar el carrier actual para obtener todos sus datos
      const currentCarrier = carriers.find(c => c.id === editingCell.carrierId)
      if (!currentCarrier) return

      // Construir los datos completos del carrier con la actualización (sin ID)
      let updateData: any = {
        name: currentCarrier.name,
        mc: currentCarrier.mc,
        status: currentCarrier.status,
        primaryContact: { ...currentCarrier.primaryContact },
        secondaryContact: currentCarrier.secondaryContact ? { ...currentCarrier.secondaryContact } : undefined,
        averageRate: currentCarrier.averageRate || "$0.00/mile",
        responseWindow: currentCarrier.responseWindow || 30,
        assignedRep: currentCarrier.assignedRep || "Unassigned",
        acceptanceRate: currentCarrier.acceptanceRate || 0,
        onTimePickup: currentCarrier.onTimePickup || 0,
        onTimeDelivery: currentCarrier.onTimeDelivery || 0
      }
      
      // Aplicar la actualización específica
      if (editingCell.field === "name") {
        updateData.name = editValue
      } else if (editingCell.field === "mc") {
        updateData.mc = editValue
      } else if (editingCell.field === "averageRate") {
        // Conservar solo números para el rate y agregar el símbolo $ al guardarlo
        const numericValue = editValue.replace(/[^0-9.]/g, '')
        updateData.averageRate = `$${numericValue}`
      } else if (editingCell.field === "responseWindow") {
        updateData.responseWindow = parseInt(editValue) || 30
      } else if (editingCell.field === "assignedRep") {
        updateData.assignedRep = editValue
      } else if (editingCell.field === "acceptanceRate") {
        updateData.acceptanceRate = parseInt(editValue) || 0
      } else if (editingCell.field === "onTimePickup") {
        updateData.onTimePickup = parseInt(editValue) || 0
      } else if (editingCell.field === "onTimeDelivery") {
        updateData.onTimeDelivery = parseInt(editValue) || 0
      } else if (editingCell.field.includes("primaryContact")) {
        const field = editingCell.field.replace("primaryContact.", "")
        updateData.primaryContact[field] = editValue
      } else if (editingCell.field.includes("secondaryContact")) {
        const field = editingCell.field.replace("secondaryContact.", "")
        if (!updateData.secondaryContact) {
          updateData.secondaryContact = { name: "", phone: "", email: "" }
        }
        updateData.secondaryContact[field] = editValue
      }

      const result = await editCarrier(editingCell.carrierId, updateData)
      if (result.success) {
        setEditingCell(null)
        setEditValue("")
      } else {
        alert(result.error || "Error updating carrier")
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
    // Por ahora usaremos un modal simple, después podemos extender para usar datos del backend
    setEditingCarrierId(carrierId)
    setTempDailyCapacity([]) // Aquí cargaríamos los datos existentes del carrier
    setShowCapacityModal(true)
    setSelectedDays([])
    setDailyCapacity(1)
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

  const saveDailyCapacity = async () => {
    if (editingCarrierId) {
      // Aquí enviarías los datos al backend - por ahora solo cerramos el modal
      // const result = await editCarrier(editingCarrierId, { dailyCapacity: tempDailyCapacity })
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

  const handleToggleStatus = async (carrierId: number, currentStatus: "ACTIVE" | "INACTIVE") => {
    // Encontrar el carrier actual para obtener todos sus datos
    const currentCarrier = carriers.find(c => c.id === carrierId)
    if (!currentCarrier) return

    const result = await toggleCarrierStatus(carrierId, currentCarrier)
    if (!result.success) {
      alert(result.error || "Error changing carrier status")
    }
  }

  const handleDeleteCarrier = async (carrierId: number) => {
    if (confirm("Are you sure you want to delete this carrier?")) {
      const result = await removeCarrier(carrierId)
      if (!result.success) {
        alert(result.error || "Error deleting carrier")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading carriers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">{error}</p>
          <Button onClick={() => fetchCarriers()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Carrier Directory
          </CardTitle>
          <CardDescription>
            Manage and view information for all registered carriers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, MC, contact or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <CreateCarrierModal onCarrierCreated={() => fetchCarriers()} />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="h-10">
                  <TableHead className="w-16 text-xs">Status</TableHead>
                  <TableHead className="w-24 text-xs">MC Number</TableHead>
                  <TableHead className="w-32 text-xs">Name</TableHead>
                  <TableHead className="w-36 text-xs">Main Contact</TableHead>
                  <TableHead className="w-36 text-xs">Secondary Contact</TableHead>
                  <TableHead className="w-16 text-xs">Waterfalls</TableHead>
                  <TableHead className="w-24 text-xs">Rate</TableHead>
                  <TableHead className="w-20 text-xs">Response Window</TableHead>
                  <TableHead className="w-20 text-xs">Daily Capacity</TableHead>
                  <TableHead className="w-28 text-xs">Assigned Rep</TableHead>
                  <TableHead className="w-20 text-xs">% Accept</TableHead>
                  <TableHead className="w-20 text-xs">% Pickup</TableHead>
                  <TableHead className="w-20 text-xs">% Delivery</TableHead>
                  <TableHead className="w-20 text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarriers.map((carrier, index) => (
                  <TableRow key={carrier?.id || `carrier-${index}`}>
                    {/* Status */}
                    <TableCell className="text-xs">
                      <Badge 
                        variant={carrier.status === "ACTIVE" ? "default" : "secondary"}
                        className={`text-xs ${carrier.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {carrier.status}
                      </Badge>
                    </TableCell>

                    {/* MC Number - Editable */}
                    <TableCell className="text-xs">
                      {isEditing(carrier.id, "mc") ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 h-7 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            autoFocus
                          />
                          <Button size="sm" variant="outline" onClick={saveEdit} className="h-7 w-7 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 w-7 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          onClick={() => startEditing(carrier.id, "mc", carrier.mc || "")}
                        >
                          <span className="font-mono text-xs">{carrier.mc || "No MC"}</span>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Name - Editable */}
                    <TableCell className="text-xs">
                      {isEditing(carrier.id, "name") ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-28 h-7 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            autoFocus
                          />
                          <Button size="sm" variant="outline" onClick={saveEdit} className="h-7 w-7 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 w-7 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          onClick={() => startEditing(carrier.id, "name", carrier.name || "")}
                        >
                          <span className="font-medium text-xs">{carrier.name || "No name"}</span>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Main Contact - Editable */}
                    <TableCell className="text-xs">
                      {carrier.primaryContact ? (
                        <div className="space-y-1">
                          {isEditing(carrier.id, "primaryContact.name") ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-28 h-6 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="outline" onClick={saveEdit} className="h-6 w-6 p-0">
                                <Check className="h-2 w-2" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="h-6 w-6 p-0">
                                <X className="h-2 w-2" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="font-medium cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1 text-xs"
                              onClick={() => startEditing(carrier.id, "primaryContact.name", carrier.primaryContact?.name || "")}
                            >
                              {carrier.primaryContact?.name || "No name"}
                              <Edit className="h-2 w-2 text-gray-400" />
                            </div>
                          )}
                          
                          {isEditing(carrier.id, "primaryContact.phone") ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-28 h-6 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="outline" onClick={saveEdit} className="h-6 w-6 p-0">
                                <Check className="h-2 w-2" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="h-6 w-6 p-0">
                                <X className="h-2 w-2" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="text-xs text-gray-500 cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1"
                              onClick={() => startEditing(carrier.id, "primaryContact.phone", carrier.primaryContact?.phone || "")}
                            >
                              {carrier.primaryContact?.phone || "No phone"}
                              <Edit className="h-2 w-2 text-gray-400" />
                            </div>
                          )}
                          
                          {carrier.primaryContact?.email && (
                            <div className="text-xs text-gray-500 mt-1">{carrier.primaryContact.email}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No primary contact</span>
                      )}
                    </TableCell>

                    {/* Secondary Contact - Editable */}
                    <TableCell className="text-xs">
                      {carrier.secondaryContact ? (
                        <div className="space-y-1">
                          {isEditing(carrier.id, "secondaryContact.name") ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-28 h-6 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="outline" onClick={saveEdit} className="h-6 w-6 p-0">
                                <Check className="h-2 w-2" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="h-6 w-6 p-0">
                                <X className="h-2 w-2" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="font-medium cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1 text-xs"
                              onClick={() => startEditing(carrier.id, "secondaryContact.name", carrier.secondaryContact?.name || "")}
                            >
                              {carrier.secondaryContact?.name || "No name"}
                              <Edit className="h-2 w-2 text-gray-400" />
                            </div>
                          )}
                          
                          {isEditing(carrier.id, "secondaryContact.phone") ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-28 h-6 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="outline" onClick={saveEdit} className="h-6 w-6 p-0">
                                <Check className="h-2 w-2" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="h-6 w-6 p-0">
                                <X className="h-2 w-2" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="text-xs text-gray-500 cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1"
                              onClick={() => startEditing(carrier.id, "secondaryContact.phone", carrier.secondaryContact?.phone || "")}
                            >
                              {carrier.secondaryContact?.phone || "No phone"}
                              <Edit className="h-2 w-2 text-gray-400" />
                            </div>
                          )}
                          
                          {isEditing(carrier.id, "secondaryContact.email") ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-28 h-6 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="outline" onClick={saveEdit} className="h-6 w-6 p-0">
                                <Check className="h-2 w-2" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="h-6 w-6 p-0">
                                <X className="h-2 w-2" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="text-xs text-gray-500 cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1 mt-1"
                              onClick={() => startEditing(carrier.id, "secondaryContact.email", carrier.secondaryContact?.email || "")}
                            >
                              {carrier.secondaryContact?.email || "No email"}
                              <Edit className="h-2 w-2 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className="text-gray-400 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1"
                          onClick={() => startEditing(carrier.id, "secondaryContact.name", "")}
                        >
                          Add secondary contact
                          <Edit className="h-2 w-2 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Waterfalls Assigned */}
                    <TableCell className="text-xs">
                      <Badge variant="secondary" className="text-xs">
                        {carrier.waterfall?.length || 0}
                      </Badge>
                    </TableCell>

                    {/* Rate - Editable */}
                    <TableCell className="text-xs">
                      {isEditing(carrier.id, "averageRate") ? (
                        <div className="flex items-center gap-1">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                            <Input
                              type="number"
                              value={editValue.replace(/[^0-9.]/g, '')}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 h-7 pl-6 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit()
                                if (e.key === "Escape") cancelEdit()
                              }}
                              autoFocus
                            />
                          </div>
                          <Button size="sm" variant="outline" onClick={saveEdit} className="h-7 w-7 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 w-7 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1"
                          onClick={() => startEditing(carrier.id, "averageRate", (carrier.averageRate || "0").replace(/[^0-9.]/g, ''))}
                        >
                          <span className="text-xs">${carrier.averageRate?.replace(/[^0-9.]/g, '') || "0"}</span>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Response Window - Editable */}
                    <TableCell className="text-xs">
                      {isEditing(carrier.id, "responseWindow") ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-12 h-7 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            autoFocus
                          />
                          <span className="text-xs text-gray-600">min</span>
                          <Button size="sm" variant="outline" onClick={saveEdit} className="h-7 w-7 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 w-7 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1"
                          onClick={() => startEditing(carrier.id, "responseWindow", (carrier.responseWindow || 30).toString())}
                        >
                          <span className="text-xs">{carrier.responseWindow || 30} min</span>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Daily Capacity */}
                    <TableCell className="text-xs">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCapacityModal(carrier.id)}
                        className="h-7 text-xs px-2"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Config
                      </Button>
                    </TableCell>

                    {/* Assigned Rep - Editable Dropdown */}
                    <TableCell className="text-xs">
                      {isEditing(carrier.id, "assignedRep") ? (
                        <div className="flex items-center gap-1">
                          <Select
                            value={editValue}
                            onValueChange={(value) => setEditValue(value)}
                          >
                            <SelectTrigger className="w-24 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {assignedReps.map((rep) => (
                                <SelectItem key={rep} value={rep} className="text-xs">
                                  {rep}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" onClick={saveEdit} className="h-7 w-7 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 w-7 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1"
                          onClick={() => startEditing(carrier.id, "assignedRep", carrier.assignedRep || "Unassigned")}
                        >
                          <span className="text-xs">{carrier.assignedRep || "Unassigned"}</span>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* % Acceptance - Editable */}
                    <TableCell className="text-xs">
                      {isEditing(carrier.id, "acceptanceRate") ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-12 h-7 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            autoFocus
                          />
                          <span className="text-xs text-gray-600">%</span>
                          <Button size="sm" variant="outline" onClick={saveEdit} className="h-7 w-7 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 w-7 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1"
                          onClick={() => startEditing(carrier.id, "acceptanceRate", (carrier.acceptanceRate || 0).toString())}
                        >
                          <span className="text-xs">{carrier.acceptanceRate || 0}%</span>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* % On Time Pickup - Editable */}
                    <TableCell className="text-xs">
                      {isEditing(carrier.id, "onTimePickup") ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-12 h-7 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            autoFocus
                          />
                          <span className="text-xs text-gray-600">%</span>
                          <Button size="sm" variant="outline" onClick={saveEdit} className="h-7 w-7 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 w-7 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1"
                          onClick={() => startEditing(carrier.id, "onTimePickup", (carrier.onTimePickup || 0).toString())}
                        >
                          <span className="text-xs">{carrier.onTimePickup || 0}%</span>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* % On Time Delivery - Editable */}
                    <TableCell className="text-xs">
                      {isEditing(carrier.id, "onTimeDelivery") ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-12 h-7 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            autoFocus
                          />
                          <span className="text-xs text-gray-600">%</span>
                          <Button size="sm" variant="outline" onClick={saveEdit} className="h-7 w-7 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 w-7 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-1"
                          onClick={() => startEditing(carrier.id, "onTimeDelivery", (carrier.onTimeDelivery || 0).toString())}
                        >
                          <span className="text-xs">{carrier.onTimeDelivery || 0}%</span>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(carrier.id, carrier.status)}
                          className="h-7 text-xs px-2"
                        >
                          {carrier.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCarrier(carrier.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCarriers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No carriers found matching the search criteria." : "No carriers registered yet."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Capacity Modal */}
      <Dialog open={showCapacityModal} onOpenChange={setShowCapacityModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configure Daily Capacity</DialogTitle>
            <DialogDescription>
              Set up daily capacity rules for this carrier. Each rule specifies which days and how many loads the carrier can handle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Rules */}
            <div>
              <h3 className="text-lg font-medium mb-4">Current Rules</h3>
              {tempDailyCapacity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No rules configured yet</p>
              ) : (
                <div className="space-y-2">
                  {tempDailyCapacity.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{rule.days.join(", ")}</span>
                        <span className="text-gray-500 ml-2">- {rule.capacity} loads per day</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeDailyCapacityRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Rule */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Add New Rule</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Days Selection */}
                <div>
                  <Label className="text-base font-medium">Select Days</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {daysOfWeek.map((day) => (
                      <Label key={day} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={selectedDays.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
                        />
                        <span>{day}</span>
                      </Label>
                    ))}
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <Label htmlFor="capacity" className="text-base font-medium">
                    Daily Capacity (loads)
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(parseInt(e.target.value) || 1)}
                    className="mt-2"
                  />
                </div>
              </div>

              <Button
                onClick={addDailyCapacityRule}
                disabled={selectedDays.length === 0 || dailyCapacity < 1}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cancelDailyCapacity}>
              Cancel
            </Button>
            <Button onClick={saveDailyCapacity}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
