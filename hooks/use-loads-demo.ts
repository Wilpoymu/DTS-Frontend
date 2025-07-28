import { useState, useEffect, useCallback } from 'react';
import { Load, CreateLoadRequest, UpdateLoadRequest, LoadFilters } from '@/services/index';
import { SAMPLE_LOADS, autoInitializeDemoData } from '@/lib/demo-data-initializer';

const LOADS_STORAGE_KEY = 'demo-loads';

/**
 * Convertir un string waterfallId a un número para compatibilidad con backend
 */
function stringToNumericId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Transformar datos de muestra al formato compatible con la interfaz Load del backend
 */
function transformSampleLoadsToBackendFormat(): Load[] {
  return SAMPLE_LOADS.map((sampleLoad, index) => ({
    id: index + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pickupDate: sampleLoad.estimatedPickupDateTime ? new Date(sampleLoad.estimatedPickupDateTime).toISOString() : new Date().toISOString(),
    estimatedDeliveryDate: sampleLoad.estimatedDeliveryDateTime ? new Date(sampleLoad.estimatedDeliveryDateTime).toISOString() : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    originZip: sampleLoad.originZip || "00000",
    destinationZip: sampleLoad.destinationZip || "00000",
    accepted: sampleLoad.status === "Booked Covered",
    waterfallCarrierId: null, // Por ahora simplificamos esto
    waterfallId: sampleLoad.waterfallId ? stringToNumericId(sampleLoad.waterfallId) : null,
    status: sampleLoad.status === "Booked Covered" ? "BOOK_COVERED" : "BOOK_NOT_COVERED",
    waterfall: sampleLoad.waterfallId ? { id: sampleLoad.waterfallId, name: sampleLoad.waterfallName || "Unknown" } : null
  }));
}

/**
 * Cargar loads desde localStorage con fallback a datos de muestra
 */
function loadLoadsFromLocalStorage(): Load[] {
  try {
    if (typeof window === 'undefined') return transformSampleLoadsToBackendFormat();
    
    const stored = localStorage.getItem(LOADS_STORAGE_KEY);
    if (stored) {
      const parsedLoads = JSON.parse(stored);
      console.log('📦 Loads loaded from localStorage:', parsedLoads.length);
      return parsedLoads;
    } else {
      console.log('📦 No loads in localStorage, using sample data');
      const transformedLoads = transformSampleLoadsToBackendFormat();
      // Guardar los datos transformados en localStorage para la próxima vez
      saveLoadsToLocalStorage(transformedLoads);
      return transformedLoads;
    }
  } catch (error) {
    console.error('❌ Error loading loads from localStorage:', error);
    return transformSampleLoadsToBackendFormat();
  }
}

/**
 * Guardar loads en localStorage
 */
function saveLoadsToLocalStorage(loads: Load[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOADS_STORAGE_KEY, JSON.stringify(loads));
      console.log('💾 Saved loads to localStorage:', loads.length);
    }
  } catch (error) {
    console.error('❌ Error saving loads to localStorage:', error);
  }
}

/**
 * Filtrar loads según criterios
 */
function filterLoads(loads: Load[], filters: LoadFilters): Load[] {
  return loads.filter(load => {
    if (filters.status && load.status !== filters.status) {
      return false;
    }
    
    if (filters.originZip && !load.originZip.includes(filters.originZip)) {
      return false;
    }
    
    if (filters.destinationZip && !load.destinationZip.includes(filters.destinationZip)) {
      return false;
    }
    
    if (filters.accepted !== undefined && load.accepted !== filters.accepted) {
      return false;
    }
    
    if (filters.dateFrom) {
      const loadDate = new Date(load.pickupDate);
      const fromDate = new Date(filters.dateFrom);
      if (loadDate < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const loadDate = new Date(load.pickupDate);
      const toDate = new Date(filters.dateTo);
      if (loadDate > toDate) return false;
    }
    
    return true;
  });
}

/**
 * Hook para gestionar loads en modo demo usando localStorage
 */
export function useLoadsDemo(initialFilters?: LoadFilters) {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LoadFilters>(initialFilters || {});

  const fetchLoads = useCallback(async (newFilters?: LoadFilters) => {
    try {
      console.log('🔄 Fetching loads in demo mode...');
      setLoading(true);
      setError(null);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allLoads = loadLoadsFromLocalStorage();
      const filtersToUse = newFilters || filters;
      const filteredLoads = filterLoads(allLoads, filtersToUse);
      
      console.log('✅ Demo loads fetched:', {
        total: allLoads.length,
        filtered: filteredLoads.length,
        filters: filtersToUse
      });
      
      setLoads(filteredLoads);
    } catch (err: any) {
      setError(err.message || 'Error fetching loads');
      console.error('❌ Error in fetchLoads:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createLoad = async (loadData: CreateLoadRequest): Promise<{ success: boolean; load?: Load; error?: string }> => {
    try {
      console.log('➕ Creating new load in demo mode:', loadData);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allLoads = loadLoadsFromLocalStorage();
      const newId = Math.max(...allLoads.map(l => l.id), 0) + 1;
      
      const newLoad: Load = {
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pickupDate: loadData.pickupDate,
        estimatedDeliveryDate: loadData.estimatedDeliveryDate,
        originZip: loadData.originZip,
        destinationZip: loadData.destinationZip,
        accepted: false,
        waterfallCarrierId: null,
        waterfallId: null,
        status: "BOOK_NOT_COVERED",
        waterfall: null
      };
      
      const updatedLoads = [...allLoads, newLoad];
      saveLoadsToLocalStorage(updatedLoads);
      
      // Actualizar la lista local si coincide con los filtros
      const filteredLoads = filterLoads(updatedLoads, filters);
      setLoads(filteredLoads);
      
      console.log('✅ Demo load created successfully');
      return { success: true, load: newLoad };
    } catch (err: any) {
      console.error('❌ Error creating load:', err);
      return { success: false, error: err.message || 'Error creating load' };
    }
  };

  const updateLoad = async (id: number, updateData: UpdateLoadRequest): Promise<{ success: boolean; load?: Load; error?: string }> => {
    try {
      console.log('✏️ Updating load in demo mode:', id, updateData);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allLoads = loadLoadsFromLocalStorage();
      const loadIndex = allLoads.findIndex(l => l.id === id);
      
      if (loadIndex === -1) {
        throw new Error('Load not found');
      }
      
      const updatedLoad: Load = {
        ...allLoads[loadIndex],
        ...updateData,
        id, // Mantener el ID original
        updatedAt: new Date().toISOString()
      };
      
      const updatedLoads = [...allLoads];
      updatedLoads[loadIndex] = updatedLoad;
      
      saveLoadsToLocalStorage(updatedLoads);
      setLoads(prev => prev.map(load => 
        load.id === id ? updatedLoad : load
      ));
      
      console.log('✅ Load updated successfully:', updatedLoad);
      return { success: true, load: updatedLoad };
    } catch (err: any) {
      console.error('❌ Error updating load:', err);
      return { success: false, error: err.message || 'Error updating load' };
    }
  };

  const deleteLoad = async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🗑️ Deleting load in demo mode:', id);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allLoads = loadLoadsFromLocalStorage();
      const updatedLoads = allLoads.filter(l => l.id !== id);
      
      saveLoadsToLocalStorage(updatedLoads);
      setLoads(prev => prev.filter(load => load.id !== id));
      
      console.log('✅ Load deleted successfully');
      return { success: true };
    } catch (err: any) {
      console.error('❌ Error deleting load:', err);
      return { success: false, error: err.message || 'Error deleting load' };
    }
  };

  const acceptLoad = async (id: number): Promise<{ success: boolean; load?: Load; error?: string }> => {
    try {
      console.log('✅ Accepting load in demo mode:', id);
      return await updateLoad(id, { accepted: true, status: "BOOK_COVERED" });
    } catch (err: any) {
      console.error('❌ Error accepting load:', err);
      return { success: false, error: err.message || 'Error accepting load' };
    }
  };

  const rejectLoad = async (id: number, reason?: string): Promise<{ success: boolean; load?: Load; error?: string }> => {
    try {
      console.log('❌ Rejecting load in demo mode:', id, reason);
      return await updateLoad(id, { accepted: false, status: "BOOK_NOT_COVERED" });
    } catch (err: any) {
      console.error('❌ Error rejecting load:', err);
      return { success: false, error: err.message || 'Error rejecting load' };
    }
  };

  const getLoadById = async (id: number): Promise<Load | null> => {
    try {
      console.log('🔍 Getting load by ID in demo mode:', id);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const allLoads = loadLoadsFromLocalStorage();
      const load = allLoads.find(l => l.id === id);
      
      return load || null;
    } catch (err: any) {
      console.error('❌ Error getting load by ID:', err);
      return null;
    }
  };

  const applyFilters = (newFilters: LoadFilters) => {
    setFilters(newFilters);
    fetchLoads(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    fetchLoads(emptyFilters);
  };

  const refresh = () => {
    fetchLoads();
  };

  useEffect(() => {
    fetchLoads();
  }, [fetchLoads]);

  return {
    loads,
    loading,
    error,
    filters,
    fetchLoads,
    createLoad,
    updateLoad,
    deleteLoad,
    acceptLoad,
    rejectLoad,
    getLoadById,
    applyFilters,
    clearFilters,
    refresh
  };
}
