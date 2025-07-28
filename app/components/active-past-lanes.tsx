"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getLocalLoads, saveLocalLoads, autoAssociateAllLocalLoadsToWaterfalls, importFirst20LoadsFromBackend } from "@/lib/loads-local";
import { getAssociatedWaterfallId, autoAssociateLoad } from "@/lib/load-waterfall-local";
import { useGenericLocalStorage } from "./carrier-waterfalls/shared/hooks/useGenericLocalStorage";
import { useLoadsAdaptive } from "@/hooks/use-loads-adaptive";
import { useWaterfallsAdaptive } from "@/hooks/use-waterfalls-adaptive";
import { Load as ServiceLoad } from "@/services/index";
import { Lane } from "./carrier-waterfalls/shared/types";
import CarrierWaterfall from "./carrier-waterfalls";

interface Load {
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
  laneId?: string  // ID de la lane específica donde quedó asignada
  assignedTier?: string  // En qué tier del waterfall quedó asignada
}

// Función para transformar loads del servicio al formato del componente
function transformServiceLoadsToComponentFormat(serviceLoads: ServiceLoad[]): Load[] {
  return serviceLoads.map(serviceLoad => ({
    id: serviceLoad.id.toString(),
    status: serviceLoad.accepted ? "Booked Covered" : "Booked not Covered" as "Booked Covered" | "Booked not Covered",
    estimatedPickupDateTime: serviceLoad.pickupDate,
    estimatedDeliveryDateTime: serviceLoad.estimatedDeliveryDate,
    equipment: "Dry Van", // Default value, should come from service
    rate: "$0", // Default value, should come from service
    bookingDateTime: serviceLoad.createdAt,
    waterfallId: serviceLoad.waterfallId ? serviceLoad.waterfallId.toString() : "",
    waterfallName: `${serviceLoad.originZip} → ${serviceLoad.destinationZip}`,
    assignedCarrier: serviceLoad.waterfallCarrierId ? `Carrier ${serviceLoad.waterfallCarrierId}` : undefined,
  }));
}

interface ActivePastLanesProps {
  onNavigateToWaterfall?: (waterfallId: string, loadInfo?: { loadId: string; laneId?: string; assignedTier?: string }) => void
}

export default function ActivePastLanes({ onNavigateToWaterfall }: ActivePastLanesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [loads, setLoads] = useState<Load[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Hook adaptativo para waterfalls
  const { waterfalls: adaptiveWaterfalls } = useWaterfallsAdaptive();

  // Hook adaptativo para loads (funciona tanto en modo demo como backend)
  const { 
    loads: adaptiveLoads, 
    loading: loadsLoading, 
    updateLoad,
    deleteLoad 
  } = useLoadsAdaptive();

  useEffect(() => {
    // Usar los loads adaptativos en lugar de localStorage directo
    if (adaptiveLoads && Array.isArray(adaptiveLoads) && !loadsLoading) {
      try {
        const transformedLoads = transformServiceLoadsToComponentFormat(adaptiveLoads);
        setLoads(transformedLoads);
        setTotalPages(Math.max(1, Math.ceil(transformedLoads.length / limit)));
        setPage(1);
      } catch (error) {
        console.error('Error transforming loads:', error);
        setLoads([]);
      }
    } else if (!loadsLoading) {
      // Si no hay loads o aún no están cargados, establecer array vacío
      setLoads([]);
    }
    setIsLoading(loadsLoading);
  }, [adaptiveLoads, loadsLoading, limit]);

  // Botón para autoasociar loads locales
  function handleAutoAssociate() {
    console.log('Auto-associate function called - using adaptive loads now');
    // En modo demo, los loads ya están asociados
    // autoAssociateAllLocalLoadsToWaterfalls();
    // const updated = getLocalLoads();
    // setLoads(updated);
  }

  async function handleRefreshLoads() {
    console.log('Refresh loads function called - using adaptive loads now');
    // En modo demo, los loads se cargan automáticamente
    // setIsLoading(true);
    // await importFirst20LoadsFromBackend();
    // const updated = getLocalLoads();
    // setLoads(updated);
    // setTotalPages(Math.max(1, Math.ceil(updated.length / limit)));
    // setPage(1);
    // setIsLoading(false);
  }

  const paginatedLoads = loads.slice((page - 1) * limit, page * limit);

  const filteredLoads = paginatedLoads.filter((load) => {
    const matchesSearch = 
      load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.assignedCarrier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.waterfallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.equipment.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || load.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Función para obtener el nombre del waterfall asociado
  function getAssociatedWaterfallName(load: Load) {
    let waterfallId = getAssociatedWaterfallId(load.id);
    if (!waterfallId && adaptiveWaterfalls) {
      // En modo demo, buscar por origin/destination zip
      const matchingWaterfall = adaptiveWaterfalls.find(wf => 
        load.waterfallName.includes(`${wf.originZip} → ${wf.destinationZip}`)
      );
      if (matchingWaterfall) {
        waterfallId = matchingWaterfall.id;
      }
    }
    
    if (adaptiveWaterfalls) {
      const wf = adaptiveWaterfalls.find(wf => wf.id === waterfallId);
      return wf ? `${wf.originZip} → ${wf.destinationZip}` : load.waterfallName || "-";
    }
    
    return load.waterfallName || "-";
  }

  const getStatusBadge = (status: Load["status"]) => {
    switch (status) {
      case "Booked Covered":
        return <Badge className="bg-green-100 text-green-800">Booked Covered</Badge>
      case "Booked not Covered":
        return <Badge className="bg-red-100 text-red-800">Booked not Covered</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateTime = (dateTime: string | undefined, isEstimated: boolean = false) => {
    if (!dateTime) return <span className="text-gray-400 text-sm">—</span>
    
    const [date, time] = dateTime.split(" ")
    return (
      <div className="text-sm">
        <div className="font-medium">
          {isEstimated && <span className="text-xs text-gray-500 mr-1">[EST]</span>}
          {date}
        </div>
        <div className="text-gray-600">{time}</div>
      </div>
    )
  }

  const handleWaterfallClick = (load: Load) => {
    let waterfallId = getAssociatedWaterfallId(load.id);
    if (!waterfallId && adaptiveWaterfalls) {
      // En modo demo, buscar por origin/destination zip
      const matchingWaterfall = adaptiveWaterfalls.find(wf => 
        load.waterfallName.includes(`${wf.originZip} → ${wf.destinationZip}`)
      );
      if (matchingWaterfall) {
        waterfallId = matchingWaterfall.id;
      }
    }
    if (onNavigateToWaterfall && waterfallId) {
      const loadInfo = load.status === "Booked Covered" ? {
        loadId: load.id,
        laneId: load.laneId,
        assignedTier: load.assignedTier
      } : { loadId: load.id }
      onNavigateToWaterfall(waterfallId, loadInfo);
    } else {
      console.log(`Navigate to waterfall: ${waterfallId}`, load);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Loads</CardTitle>
          <CardDescription>View and manage loads with their associated waterfalls</CardDescription>
          <div className="flex gap-2 mt-2">
            <Button onClick={handleAutoAssociate} variant="outline" disabled={isLoading}>Auto-associate Loads to Waterfalls</Button>
            <Button onClick={handleRefreshLoads} variant="outline" disabled={isLoading}>Refresh Loads from Backend</Button>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 mt-2 text-blue-600">
              <span className="animate-spin w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full inline-block" />
              <span>Loading loads...</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search loads by ID, carrier, waterfall, or equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Booked Covered">Booked Covered</SelectItem>
                  <SelectItem value="Booked not Covered">Booked not Covered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loads ({filteredLoads.length})</CardTitle>
          <CardDescription>Current and historical load information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Load ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>[EST] Pickup Date/Time</TableHead>
                  <TableHead>Pickup Date/Time</TableHead>
                  <TableHead>[EST] Delivery Date/Time</TableHead>
                  <TableHead>Delivery Date/Time</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Assigned Carrier</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Booking Date/Time</TableHead>
                  <TableHead>Waterfall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoads.map((load) => (
                  <TableRow key={load.id}>
                    {/* Load ID */}
                    <TableCell>
                      <span className="font-medium text-blue-600">{load.id}</span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {getStatusBadge(load.status)}
                    </TableCell>

                    {/* [EST] Pickup Date/Time */}
                    <TableCell>
                      {formatDateTime(load.estimatedPickupDateTime, true)}
                    </TableCell>

                    {/* Pickup Date/Time */}
                    <TableCell>
                      {formatDateTime(load.actualPickupDateTime)}
                    </TableCell>

                    {/* [EST] Delivery Date/Time */}
                    <TableCell>
                      {formatDateTime(load.estimatedDeliveryDateTime, true)}
                    </TableCell>

                    {/* Delivery Date/Time */}
                    <TableCell>
                      {formatDateTime(load.actualDeliveryDateTime)}
                    </TableCell>

                    {/* Equipment */}
                    <TableCell>
                      <Badge variant="outline">{load.equipment}</Badge>
                    </TableCell>

                    {/* Assigned Carrier */}
                    <TableCell>
                      {load.assignedCarrier ? (
                        <span className="font-medium">{load.assignedCarrier}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Rate */}
                    <TableCell>
                      <span className="font-medium text-green-600">{load.rate}</span>
                    </TableCell>

                    {/* Booking Date/Time */}
                    <TableCell>
                      {formatDateTime(load.bookingDateTime)}
                    </TableCell>

                    {/* Waterfall */}
                    <TableCell>
                      <div className="space-y-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWaterfallClick(load)}
                          className="flex items-center gap-1 text-xs h-8 w-full justify-start"
                        >
                          {getAssociatedWaterfallName(load)}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </Button>
                        {load.status === "Booked Covered" && load.assignedTier && (
                          <div className="text-xs text-gray-500">
                            Assigned: {load.assignedTier}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Paginación */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Back
              </Button>
              <span className="text-sm">Page {page} de {totalPages}</span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={isLoading || page === totalPages}
              >
                Next
              </Button>
            </div>
            {isLoading && <div className="text-center text-gray-500 py-2">Loading...</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
