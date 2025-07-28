"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { useCarriersAdaptive } from "@/hooks/use-carriers-adaptive"
import { CreateCarrierRequest } from "@/services/index"

interface CreateCarrierModalProps {
  trigger?: React.ReactNode
  onCarrierCreated?: () => void
}

export default function CreateCarrierModal({ trigger, onCarrierCreated }: CreateCarrierModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCarrierRequest>({
    name: "",
    mc: "",
    primaryContact: {
      name: "",
      phone: "",
      email: ""
    },
    secondaryContact: {
      name: "",
      phone: "",
      email: ""
    }
  })
  const [hasSecondaryContact, setHasSecondaryContact] = useState(false)

  const { addCarrier } = useCarriersAdaptive()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSubmit: CreateCarrierRequest = {
        ...formData,
        secondaryContact: hasSecondaryContact ? formData.secondaryContact : undefined
      }

      const result = await addCarrier(dataToSubmit)
      
      if (result.success) {
        setOpen(false)
        resetForm()
        onCarrierCreated?.()
      } else {
        alert(result.error || "Error creating carrier")
      }
    } catch (error) {
      console.error("Error creating carrier:", error)
      alert("Error creating carrier")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      mc: "",
      primaryContact: {
        name: "",
        phone: "",
        email: ""
      },
      secondaryContact: {
        name: "",
        phone: "",
        email: ""
      }
    })
    setHasSecondaryContact(false)
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.includes("primaryContact.")) {
      const contactField = field.replace("primaryContact.", "")
      setFormData(prev => ({
        ...prev,
        primaryContact: {
          ...prev.primaryContact,
          [contactField]: value
        }
      }))
    } else if (field.includes("secondaryContact.")) {
      const contactField = field.replace("secondaryContact.", "")
      setFormData(prev => ({
        ...prev,
        secondaryContact: {
          ...prev.secondaryContact!,
          [contactField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add Carrier
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Carrier</DialogTitle>
          <DialogDescription>
            Complete the information to add a new carrier to the directory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Carrier Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. Swift Transportation"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mc">MC Number *</Label>
              <Input
                id="mc"
                value={formData.mc}
                onChange={(e) => handleInputChange("mc", e.target.value)}
                placeholder="e.g. MC123456"
                required
              />
            </div>
          </div>

          {/* Primary Contact Section */}

          {/* Contacto Principal */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Primary Contact</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryContactName">Contact Name *</Label>
                <Input
                  id="primaryContactName"
                  value={formData.primaryContact.name}
                  onChange={(e) => handleInputChange("primaryContact.name", e.target.value)}
                  placeholder="e.g. John Smith"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryContactPhone">Phone *</Label>
                  <Input
                    id="primaryContactPhone"
                    value={formData.primaryContact.phone}
                    onChange={(e) => handleInputChange("primaryContact.phone", e.target.value)}
                    placeholder="e.g. +1234567890"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryContactEmail">Email *</Label>
                  <Input
                    id="primaryContactEmail"
                    type="email"
                    value={formData.primaryContact.email}
                    onChange={(e) => handleInputChange("primaryContact.email", e.target.value)}
                    placeholder="e.g. john@example.com"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contacto Secundario */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Secondary Contact</h3>
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hasSecondaryContact}
                  onChange={(e) => setHasSecondaryContact(e.target.checked)}
                  className="rounded border border-gray-300"
                />
                <span>Add secondary contact</span>
              </Label>
            </div>
            
            {hasSecondaryContact && (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryContactName">Contact Name</Label>
                  <Input
                    id="secondaryContactName"
                    value={formData.secondaryContact?.name || ""}
                    onChange={(e) => handleInputChange("secondaryContact.name", e.target.value)}
                    placeholder="e.g. Jane Smith"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryContactPhone">Phone</Label>
                    <Input
                      id="secondaryContactPhone"
                      value={formData.secondaryContact?.phone || ""}
                      onChange={(e) => handleInputChange("secondaryContact.phone", e.target.value)}
                      placeholder="e.g. +1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryContactEmail">Email</Label>
                    <Input
                      id="secondaryContactEmail"
                      type="email"
                      value={formData.secondaryContact?.email || ""}
                      onChange={(e) => handleInputChange("secondaryContact.email", e.target.value)}
                      placeholder="e.g. jane@example.com"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Carrier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
