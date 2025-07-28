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

export default function CarrierDirectory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCell, setEditingCell] = useState<{ carrierId: number; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")

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

  const handleToggleStatus = async (carrierId: number, currentStatus: "ACTIVE" | "INACTIVE") => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    const result = await toggleCarrierStatus(carrierId, newStatus)
    if (!result.success) {
      alert(result.error || "Error al cambiar el estado del carrier")
    }
  }

  const handleDeleteCarrier = async (carrierId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este carrier?")) {
      const result = await removeCarrier(carrierId)
      if (!result.success) {
        alert(result.error || "Error al eliminar el carrier")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando carriers...</span>
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
            Reintentar
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
            Directorio de Carriers
          </CardTitle>
          <CardDescription>
            Gestiona y visualiza información de todos los carriers registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, MC, contacto o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Carrier
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>MC</TableHead>
                  <TableHead>Contacto Principal</TableHead>
                  <TableHead>Contacto Secundario</TableHead>
                  <TableHead>Cascadas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarriers.map((carrier) => (
                  <TableRow key={carrier.id}>
                    {/* Estado */}
                    <TableCell>
                      <Badge 
                        variant={carrier.status === "ACTIVE" ? "default" : "secondary"}
                        className={carrier.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {carrier.status}
                      </Badge>
                    </TableCell>

                    {/* Nombre - Editable */}
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

                    {/* MC - Editable */}
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
                          <span className="font-mono text-sm">{carrier.mc}</span>
                          <Edit className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Contacto Principal */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{carrier.primaryContact.name}</div>
                        <div className="text-sm text-gray-500">{carrier.primaryContact.phone}</div>
                        <div className="text-sm text-gray-500">{carrier.primaryContact.email}</div>
                      </div>
                    </TableCell>

                    {/* Contacto Secundario */}
                    <TableCell>
                      {carrier.secondaryContact ? (
                        <div className="space-y-1">
                          <div className="font-medium">{carrier.secondaryContact.name}</div>
                          <div className="text-sm text-gray-500">{carrier.secondaryContact.phone}</div>
                          <div className="text-sm text-gray-500">{carrier.secondaryContact.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin contacto secundario</span>
                      )}
                    </TableCell>

                    {/* Cascadas */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {carrier.waterfall?.length || 0} cascadas
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(carrier.id, carrier.status)}
                        >
                          {carrier.status === "ACTIVE" ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCarrier(carrier.id)}
                          className="text-red-600 hover:text-red-700"
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
              {searchTerm ? "No se encontraron carriers que coincidan con la búsqueda." : "No hay carriers registrados."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
