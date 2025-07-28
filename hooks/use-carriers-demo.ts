import { useState, useEffect } from 'react';
import { Carrier, CreateCarrierRequest, UpdateCarrierRequest, CarrierFilters } from '@/services/index';
import { getDemoCarriers, SAMPLE_CARRIERS } from '@/lib/demo-data-initializer';

/**
 * Hook para gestionar carriers en modo demo usando localStorage
 * Fallback a los datos de muestra si no hay datos en localStorage
 */
export function useCarriersDemo(initialFilters?: CarrierFilters) {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CarrierFilters>(initialFilters || {});

  const loadCarriersFromLocalStorage = () => {
    try {
      console.log('🚚 Loading carriers from localStorage...');
      let demoCarriers = getDemoCarriers();
      
      // Si no hay datos en localStorage, usar los datos de muestra
      if (demoCarriers.length === 0) {
        console.log('📦 No carriers in localStorage, using sample data');
        demoCarriers = SAMPLE_CARRIERS;
        
        // Guardar los datos de muestra en localStorage
        localStorage.setItem('demo-carriers', JSON.stringify(demoCarriers));
      }
      
      // Transformar los datos para que sean compatibles con la interfaz Carrier del backend
      const transformedCarriers: Carrier[] = demoCarriers.map((carrier, index) => ({
        id: parseInt(carrier.id),
        name: carrier.name,
        mc: carrier.mcNumber,
        status: "ACTIVE" as const,
        primaryContact: {
          name: carrier.contactName || "",
          phone: carrier.secondaryContactName ? `(555) ${1000 + index * 100}-${index * 111}` : "",
          email: carrier.contactEmail
        },
        secondaryContact: carrier.secondaryContactName ? {
          name: carrier.secondaryContactName,
          phone: `(555) ${2000 + index * 100}-${index * 222}`,
          email: carrier.secondaryContactEmail || ""
        } : undefined,
        averageRate: `$${(carrier.rate || 2000) / 1000}/mile`,
        responseWindow: 30,
        assignedRep: carrier.assignedRep || "Unassigned",
        acceptanceRate: carrier.acceptancePercentage || 85,
        onTimePickup: carrier.onTimePickupPercentage || 90,
        onTimeDelivery: carrier.onTimeDeliveryPercentage || 88
        // Removido createdAt y updatedAt porque no están en la interfaz Carrier
      }));
      
      console.log('✅ Loaded carriers from demo:', transformedCarriers.length);
      return transformedCarriers;
    } catch (err) {
      console.error('❌ Error loading carriers from localStorage:', err);
      return [];
    }
  };

  const saveCarriersToLocalStorage = (carriersToSave: Carrier[]) => {
    try {
      // Transformar de vuelta al formato de demo
      const demoFormat = carriersToSave.map(carrier => ({
        id: carrier.id.toString(),
        name: carrier.name,
        mcNumber: carrier.mc,
        contactEmail: carrier.primaryContact?.email || "",
        contactName: carrier.primaryContact?.name || "",
        secondaryContactName: carrier.secondaryContact?.name || "",
        secondaryContactEmail: carrier.secondaryContact?.email || "",
        assignedRep: carrier.assignedRep || "",
        rate: parseFloat(carrier.averageRate?.replace(/[^0-9.]/g, '') || '2000') * 1000,
        acceptancePercentage: carrier.acceptanceRate || 85,
        onTimePickupPercentage: carrier.onTimePickup || 90,
        onTimeDeliveryPercentage: carrier.onTimeDelivery || 88,
        availability: []
      }));
      
      localStorage.setItem('demo-carriers', JSON.stringify(demoFormat));
      console.log('💾 Saved carriers to localStorage:', demoFormat.length);
    } catch (err) {
      console.error('❌ Error saving carriers to localStorage:', err);
    }
  };

  const fetchCarriers = async (newFilters?: CarrierFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching carriers in demo mode...');
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allCarriers = loadCarriersFromLocalStorage();
      
      // Aplicar filtros
      const filtersToUse = newFilters || filters;
      let filteredCarriers = allCarriers;
      
      if (filtersToUse.search) {
        const searchLower = filtersToUse.search.toLowerCase();
        filteredCarriers = filteredCarriers.filter(carrier => 
          carrier.name.toLowerCase().includes(searchLower) ||
          carrier.mc.toLowerCase().includes(searchLower) ||
          carrier.primaryContact?.name?.toLowerCase().includes(searchLower) ||
          carrier.primaryContact?.email?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filtersToUse.status) {
        filteredCarriers = filteredCarriers.filter(carrier => 
          carrier.status === filtersToUse.status
        );
      }
      
      if (filtersToUse.assignedRep) {
        filteredCarriers = filteredCarriers.filter(carrier => 
          carrier.assignedRep === filtersToUse.assignedRep
        );
      }
      
      setCarriers(filteredCarriers);
      console.log('✅ Carriers loaded successfully:', filteredCarriers.length);
    } catch (err: any) {
      setError(err.message || 'Error fetching carriers');
      console.error('❌ Error in fetchCarriers:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCarrier = async (carrierData: CreateCarrierRequest) => {
    try {
      console.log('➕ Adding new carrier in demo mode:', carrierData);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allCarriers = loadCarriersFromLocalStorage();
      const newId = Math.max(...allCarriers.map(c => c.id), 0) + 1;
      
      const newCarrier: Carrier = {
        id: newId,
        name: carrierData.name,
        mc: carrierData.mc,
        status: "ACTIVE", // CreateCarrierRequest no incluye status, usar por defecto
        primaryContact: carrierData.primaryContact,
        secondaryContact: carrierData.secondaryContact,
        averageRate: carrierData.averageRate || "$2.00/mile",
        responseWindow: carrierData.responseWindow || 30,
        assignedRep: carrierData.assignedRep || "Unassigned",
        acceptanceRate: carrierData.acceptanceRate || 0,
        onTimePickup: carrierData.onTimePickup || 0,
        onTimeDelivery: carrierData.onTimeDelivery || 0
        // Removido createdAt y updatedAt porque no están en la interfaz Carrier
      };
      
      const updatedCarriers = [...allCarriers, newCarrier];
      saveCarriersToLocalStorage(updatedCarriers);
      setCarriers(prev => [...prev, newCarrier]);
      
      console.log('✅ Carrier added successfully:', newCarrier);
      return { success: true, data: newCarrier };
    } catch (err: any) {
      console.error('❌ Error creating carrier:', err);
      return { success: false, error: err.message || 'Error creating carrier' };
    }
  };

  const editCarrier = async (id: number, carrierData: Omit<UpdateCarrierRequest, 'id'>) => {
    try {
      console.log('✏️ Editing carrier in demo mode:', id, carrierData);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allCarriers = loadCarriersFromLocalStorage();
      const carrierIndex = allCarriers.findIndex(c => c.id === id);
      
      if (carrierIndex === -1) {
        throw new Error('Carrier not found');
      }
      
      const updatedCarrier: Carrier = {
        ...allCarriers[carrierIndex],
        ...carrierData,
        id // Mantener el ID original
        // Removido updatedAt porque no está en la interfaz Carrier
      };
      
      const updatedCarriers = [...allCarriers];
      updatedCarriers[carrierIndex] = updatedCarrier;
      
      saveCarriersToLocalStorage(updatedCarriers);
      setCarriers(prev => prev.map(carrier => 
        carrier.id === id ? updatedCarrier : carrier
      ));
      
      console.log('✅ Carrier updated successfully:', updatedCarrier);
      return { success: true, data: updatedCarrier };
    } catch (err: any) {
      console.error('❌ Error updating carrier:', err);
      return { success: false, error: err.message || 'Error updating carrier' };
    }
  };

  const removeCarrier = async (id: number) => {
    try {
      console.log('🗑️ Removing carrier in demo mode:', id);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allCarriers = loadCarriersFromLocalStorage();
      const updatedCarriers = allCarriers.filter(c => c.id !== id);
      
      saveCarriersToLocalStorage(updatedCarriers);
      setCarriers(prev => prev.filter(carrier => carrier.id !== id));
      
      console.log('✅ Carrier removed successfully');
      return { success: true };
    } catch (err: any) {
      console.error('❌ Error deleting carrier:', err);
      return { success: false, error: err.message || 'Error deleting carrier' };
    }
  };

  const toggleCarrierStatus = async (id: number, currentCarrier: Carrier) => {
    try {
      console.log('🔄 Toggling carrier status in demo mode:', id);
      
      const newStatus: "ACTIVE" | "INACTIVE" = currentCarrier.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      
      const updateData = {
        name: currentCarrier.name,
        mc: currentCarrier.mc,
        status: newStatus,
        primaryContact: currentCarrier.primaryContact,
        secondaryContact: currentCarrier.secondaryContact,
        averageRate: currentCarrier.averageRate || "$0.00/mile",
        responseWindow: currentCarrier.responseWindow || 30,
        assignedRep: currentCarrier.assignedRep || "Unassigned",
        acceptanceRate: currentCarrier.acceptanceRate || 0,
        onTimePickup: currentCarrier.onTimePickup || 0,
        onTimeDelivery: currentCarrier.onTimeDelivery || 0
      };
      
      return await editCarrier(id, updateData);
    } catch (err: any) {
      console.error('❌ Error toggling carrier status:', err);
      return { success: false, error: err.message || 'Error toggling carrier status' };
    }
  };

  const updateFilters = (newFilters: CarrierFilters) => {
    setFilters(newFilters);
    fetchCarriers(newFilters);
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  return {
    carriers,
    loading,
    error,
    filters,
    fetchCarriers,
    addCarrier,
    editCarrier,
    removeCarrier,
    toggleCarrierStatus,
    updateFilters
  };
}
