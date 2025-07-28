import { useState, useEffect } from 'react';
import { WaterfallResponse, CreateWaterfallRequest, UpdateWaterfallRequest, WaterfallFilters, WaterfallCarrier } from '@/services/index';
import { SAMPLE_LANES, autoInitializeDemoData } from '@/lib/demo-data-initializer';

const WATERFALLS_STORAGE_KEY = 'demo-waterfalls';

/**
 * Transformar datos de muestra a formato WaterfallResponse del backend
 */
function transformSampleLanesToWaterfallFormat(): WaterfallResponse[] {
  return SAMPLE_LANES.map((lane, index) => ({
    id: parseInt(lane.id.replace(/\D/g, '') || (index + 1).toString()), // Extraer números del ID
    originZip: lane.originZip,
    destinationZip: lane.destinationZip,
    equipmentType: mapEquipmentToBackend(lane.equipment),
    status: mapStatusToBackend(lane.status),
    createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(),
    updatedAt: new Date(Date.now() - (index * 12 * 60 * 60 * 1000)).toISOString(),
    carriers: lane.waterfall?.items?.map((item, itemIndex) => ({
      carrierId: item.carrier ? parseInt(item.carrier.id) : 1,
      rate: 2000 + (itemIndex * 100), // Rate simulado
      order: itemIndex + 1,
      responseWindow: item.responseWindow || 30,
      dailyCapacity: "1" // Capacidad por defecto
    })) || [],
    _count: {
      loads: lane.quotedLoads || 0
    }
  }));
}

/**
 * Mapear tipo de equipo del demo al backend
 */
function mapEquipmentToBackend(equipment: string): 'DRY_VAN' | 'REFERIGERATED' | 'FLATBED' | 'TANKER' {
  const mapping: { [key: string]: 'DRY_VAN' | 'REFERIGERATED' | 'FLATBED' | 'TANKER' } = {
    'Dry Van': 'DRY_VAN',
    'Reefer': 'REFERIGERATED',
    'Refrigerated': 'REFERIGERATED',
    'Flatbed': 'FLATBED',
    'Step Deck': 'TANKER',
    'Tanker': 'TANKER'
  };
  return mapping[equipment] || 'DRY_VAN';
}

/**
 * Mapear status del demo al backend
 */
function mapStatusToBackend(status: string): 'NOT_TRIGGERED' | 'TRIGGERED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT' {
  const mapping: { [key: string]: 'NOT_TRIGGERED' | 'TRIGGERED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT' } = {
    'Draft': 'DRAFT',
    'Active': 'ACTIVE',
    'Paused': 'PAUSED',
    'Completed': 'COMPLETED'
  };
  return mapping[status] || 'DRAFT';
}

/**
 * Cargar waterfalls desde localStorage con fallback a datos de muestra
 */
function loadWaterfallsFromLocalStorage(): WaterfallResponse[] {
  try {
    if (typeof window === 'undefined') return transformSampleLanesToWaterfallFormat();
    
    const stored = localStorage.getItem(WATERFALLS_STORAGE_KEY);
    if (stored) {
      const parsedWaterfalls = JSON.parse(stored);
      console.log('📦 Waterfalls loaded from localStorage:', parsedWaterfalls.length);
      return parsedWaterfalls;
    } else {
      console.log('📦 No waterfalls in localStorage, using sample data');
      const transformedWaterfalls = transformSampleLanesToWaterfallFormat();
      // Guardar los datos transformados en localStorage para la próxima vez
      saveWaterfallsToLocalStorage(transformedWaterfalls);
      return transformedWaterfalls;
    }
  } catch (error) {
    console.error('❌ Error loading waterfalls from localStorage:', error);
    return transformSampleLanesToWaterfallFormat();
  }
}

/**
 * Guardar waterfalls en localStorage
 */
function saveWaterfallsToLocalStorage(waterfalls: WaterfallResponse[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WATERFALLS_STORAGE_KEY, JSON.stringify(waterfalls));
      console.log('💾 Saved waterfalls to localStorage:', waterfalls.length);
    }
  } catch (error) {
    console.error('❌ Error saving waterfalls to localStorage:', error);
  }
}

/**
 * Filtrar waterfalls según criterios
 */
function filterWaterfalls(waterfalls: WaterfallResponse[], filters: WaterfallFilters): WaterfallResponse[] {
  return waterfalls.filter(waterfall => {
    if (filters.status && waterfall.status !== filters.status) {
      return false;
    }
    
    if (filters.originZip && !waterfall.originZip.includes(filters.originZip)) {
      return false;
    }
    
    if (filters.destinationZip && !waterfall.destinationZip.includes(filters.destinationZip)) {
      return false;
    }
    
    if (filters.equipmentType && waterfall.equipmentType !== filters.equipmentType) {
      return false;
    }
    
    return true;
  });
}

/**
 * Hook para gestionar waterfalls en modo demo usando localStorage
 */
export function useWaterfallsDemo(initialFilters?: WaterfallFilters) {
  const [waterfalls, setWaterfalls] = useState<WaterfallResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WaterfallFilters>(initialFilters || {});

  const getWaterfalls = async (newFilters?: WaterfallFilters) => {
    try {
      console.log('🔄 Fetching waterfalls in demo mode...');
      setLoading(true);
      setError(null);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allWaterfalls = loadWaterfallsFromLocalStorage();
      const filtersToUse = newFilters || filters;
      const filteredWaterfalls = filterWaterfalls(allWaterfalls, filtersToUse);
      
      console.log('✅ Demo waterfalls fetched:', {
        total: allWaterfalls.length,
        filtered: filteredWaterfalls.length,
        filters: filtersToUse
      });
      
      setWaterfalls(filteredWaterfalls);
    } catch (err: any) {
      setError(err.message || 'Error fetching waterfalls');
      console.error('❌ Error in getWaterfalls:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWaterfallById = async (id: number): Promise<WaterfallResponse | null> => {
    try {
      console.log('🔍 Getting waterfall by ID in demo mode:', id);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const allWaterfalls = loadWaterfallsFromLocalStorage();
      const waterfall = allWaterfalls.find(w => w.id === id);
      
      return waterfall || null;
    } catch (err: any) {
      console.error('❌ Error getting waterfall by ID:', err);
      return null;
    }
  };

  const createWaterfall = async (data: CreateWaterfallRequest): Promise<WaterfallResponse> => {
    try {
      console.log('➕ Creating new waterfall in demo mode:', data);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allWaterfalls = loadWaterfallsFromLocalStorage();
      const newId = Math.max(...allWaterfalls.map(w => w.id), 0) + 1;
      
      const newWaterfall: WaterfallResponse = {
        id: newId,
        originZip: data.originZip,
        destinationZip: data.destinationZip,
        equipmentType: data.equipmentType,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        carriers: data.carriers,
        _count: {
          loads: 0
        }
      };
      
      const updatedWaterfalls = [...allWaterfalls, newWaterfall];
      saveWaterfallsToLocalStorage(updatedWaterfalls);
      
      // Actualizar la lista local si coincide con los filtros
      const filteredWaterfalls = filterWaterfalls(updatedWaterfalls, filters);
      setWaterfalls(filteredWaterfalls);
      
      console.log('✅ Demo waterfall created successfully');
      return newWaterfall;
    } catch (err: any) {
      console.error('❌ Error creating waterfall:', err);
      throw err;
    }
  };

  const updateWaterfall = async (id: number, data: Omit<UpdateWaterfallRequest, 'id'>): Promise<WaterfallResponse> => {
    try {
      console.log('✏️ Updating waterfall in demo mode:', id, data);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allWaterfalls = loadWaterfallsFromLocalStorage();
      const waterfallIndex = allWaterfalls.findIndex(w => w.id === id);
      
      if (waterfallIndex === -1) {
        throw new Error('Waterfall not found');
      }
      
      const updatedWaterfall: WaterfallResponse = {
        ...allWaterfalls[waterfallIndex],
        ...data,
        id, // Mantener el ID original
        updatedAt: new Date().toISOString()
      };
      
      const updatedWaterfalls = [...allWaterfalls];
      updatedWaterfalls[waterfallIndex] = updatedWaterfall;
      
      saveWaterfallsToLocalStorage(updatedWaterfalls);
      setWaterfalls(prev => prev.map(waterfall => 
        waterfall.id === id ? updatedWaterfall : waterfall
      ));
      
      console.log('✅ Waterfall updated successfully:', updatedWaterfall);
      return updatedWaterfall;
    } catch (err: any) {
      console.error('❌ Error updating waterfall:', err);
      throw err;
    }
  };

  const deleteWaterfall = async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting waterfall in demo mode:', id);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allWaterfalls = loadWaterfallsFromLocalStorage();
      const updatedWaterfalls = allWaterfalls.filter(w => w.id !== id);
      
      saveWaterfallsToLocalStorage(updatedWaterfalls);
      setWaterfalls(prev => prev.filter(waterfall => waterfall.id !== id));
      
      console.log('✅ Waterfall deleted successfully');
    } catch (err: any) {
      console.error('❌ Error deleting waterfall:', err);
      throw err;
    }
  };

  const toggleWaterfallStatus = async (id: number, status: 'ACTIVE' | 'PAUSED'): Promise<WaterfallResponse> => {
    try {
      console.log('🔄 Toggling waterfall status in demo mode:', id, status);
      
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allWaterfalls = loadWaterfallsFromLocalStorage();
      const waterfallIndex = allWaterfalls.findIndex(w => w.id === id);
      
      if (waterfallIndex === -1) {
        throw new Error('Waterfall not found');
      }
      
      const updatedWaterfall: WaterfallResponse = {
        ...allWaterfalls[waterfallIndex],
        status,
        updatedAt: new Date().toISOString()
      };
      
      const updatedWaterfalls = [...allWaterfalls];
      updatedWaterfalls[waterfallIndex] = updatedWaterfall;
      
      saveWaterfallsToLocalStorage(updatedWaterfalls);
      setWaterfalls(prev => prev.map(waterfall => 
        waterfall.id === id ? updatedWaterfall : waterfall
      ));
      
      console.log('✅ Waterfall status updated successfully:', updatedWaterfall);
      return updatedWaterfall;
    } catch (err: any) {
      console.error('❌ Error toggling waterfall status:', err);
      throw err;
    }
  };

  const applyFilters = (newFilters: WaterfallFilters) => {
    setFilters(newFilters);
    getWaterfalls(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    getWaterfalls(emptyFilters);
  };

  const refresh = () => {
    getWaterfalls();
  };

  useEffect(() => {
    getWaterfalls();
  }, []);

  return {
    waterfalls,
    loading,
    error,
    filters,
    getWaterfalls,
    getWaterfallById,
    createWaterfall,
    updateWaterfall,
    deleteWaterfall,
    toggleWaterfallStatus,
    applyFilters,
    clearFilters,
    refresh
  };
}
