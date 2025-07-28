// Utilidades para loads en localStorage

const LOADS_KEY = 'localLoads';

import { useGenericLocalStorage } from "@/components/carrier-waterfalls/shared/hooks/useGenericLocalStorage";
import { fetchLoads } from "@/lib/loads-api";

export function saveLocalLoads(loads) {
  localStorage.setItem(LOADS_KEY, JSON.stringify(loads));
}

export function getLocalLoads() {
  return JSON.parse(localStorage.getItem(LOADS_KEY) || '[]');
}

export function updateLocalLoad(loadId, update) {
  const loads = getLocalLoads();
  const idx = loads.findIndex(l => l.id === loadId);
  if (idx !== -1) {
    loads[idx] = { ...loads[idx], ...update };
    saveLocalLoads(loads);
  }
}

export function autoAssociateAllLocalLoadsToWaterfalls() {
  const loads = getLocalLoads();
  const savedWaterfalls = JSON.parse(localStorage.getItem("carrierWaterfalls") || "[]");
  const updatedLoads = loads.map(load => {
    const match = savedWaterfalls.find(
      wf =>
        wf.lane &&
        wf.lane.originZip.toString().trim() === load.originZip.toString().trim() &&
        wf.lane.destinationZip.toString().trim() === load.destinationZip.toString().trim()
    );
    if (match) {
      console.log(`✔️ Load ${load.id} associated to Waterfall ${match.lane.id}`);
      return { ...load, waterfallId: match.lane.id.toString().trim() };
    } else {
      console.warn(`❌ No match for Load ${load.id}`);
    }
    return load;
  });
  saveLocalLoads(updatedLoads);
}

export async function importFirst20LoadsFromBackend() {
  const backendLoads = await fetchLoads();
  const first20 = backendLoads.slice(0, 20).map(l => ({
    id: l.id.toString(),
    status: l.status === "BOOK_COVERED" ? "Booked Covered" : "Booked not Covered",
    estimatedPickupDateTime: l.pickupDate ? new Date(l.pickupDate).toLocaleString() : "",
    actualPickupDateTime: undefined,
    estimatedDeliveryDateTime: l.estimatedDeliveryDate ? new Date(l.estimatedDeliveryDate).toLocaleString() : "",
    actualDeliveryDateTime: undefined,
    equipment: l.waterfall?.equipmentType || "-",
    assignedCarrier: l.waterfallCarrierId ? l.waterfallCarrierId.toString() : undefined,
    rate: "-",
    bookingDateTime: l.createdAt ? new Date(l.createdAt).toLocaleString() : "",
    waterfallId: l.waterfallId ? l.waterfallId.toString() : "",
    waterfallName: l.waterfall?.name || "-",
    originZip: l.originZip,
    destinationZip: l.destinationZip,
    laneId: undefined,
    assignedTier: undefined
  }));
  saveLocalLoads(first20);
} 