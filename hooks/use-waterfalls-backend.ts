import { useState, useEffect, useCallback } from 'react';
import { waterfallsService, WaterfallResponse, CreateWaterfallRequest, WaterfallFilters } from '@/services/index';
import { mapEquipmentFromBackend } from '@/lib/waterfall-backend-utils';

// Tipos locales para los datos adicionales que se guardan en localStorage
export interface LocalWaterfallData {
  id: string; // ID local (puede diferir del ID del backend)
  backendId?: number; // ID del backend si existe
  autoTierEnabled: boolean;
  customTiers: any[];
  additionalSettings?: any;
  lastSyncedAt?: string;
}

// Tipo combinado que incluye datos del backend y localStorage
export interface CombinedWaterfall extends Omit<WaterfallResponse, 'id' | 'status' | 'equipmentType'> {
  id: string; // ID local
  backendId?: number; // ID del backend
  status: string; // Status en formato del frontend (Draft, Triggered, etc.)
  equipmentType: string; // Equipment type en formato del frontend
  quotedLoads: number; // Número de cargas cotizadas
  creationDate: string; // Fecha de creación en formato YYYY-MM-DD
  autoTierEnabled: boolean;
  customTiers: any[];
  additionalSettings?: any;
  isSynced: boolean; // Indica si está sincronizado con el backend
  waterfall?: {
    id: string;
    status: "Draft" | "Active";
    items: any[];
    autoTierEnabled: boolean;
    customTiers: any[];
  };
}

export function useWaterfallsBackend(initialFilters?: WaterfallFilters) {
  const [waterfalls, setWaterfalls] = useState<CombinedWaterfall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WaterfallFilters>(initialFilters || {});
  const [isMounted, setIsMounted] = useState(false);

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clave para localStorage
  const LOCAL_STORAGE_KEY = 'dts-waterfall-local-data';

  // Funciones para localStorage
  const getLocalData = useCallback((): LocalWaterfallData[] => {
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') {
      return [];
    }
    
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading local waterfall data:', error);
      return [];
    }
  }, []);

  const saveLocalData = useCallback((data: LocalWaterfallData[]) => {
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving local waterfall data:', error);
    }
  }, []);

  const updateLocalData = useCallback((localId: string, updates: Partial<LocalWaterfallData>) => {
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') {
      return;
    }
    
    const localData = getLocalData();
    const index = localData.findIndex(item => item.id === localId);
    
    if (index !== -1) {
      localData[index] = { ...localData[index], ...updates };
    } else {
      localData.push({ id: localId, autoTierEnabled: false, customTiers: [], ...updates });
    }
    
    saveLocalData(localData);
  }, [getLocalData, saveLocalData]);

  // Combinar datos del backend con localStorage
  const combineWaterfallData = useCallback((backendWaterfalls: WaterfallResponse[]): CombinedWaterfall[] => {
    const localData = isMounted ? getLocalData() : [];
    
    return backendWaterfalls.map(backendItem => {
      const localId = `backend-${backendItem.id}`;
      const localItem = localData.find(local => 
        local.backendId === backendItem.id || local.id === localId
      );

      // Mapear status del backend al formato del frontend
      let frontendStatus: string = backendItem.status;
      if (backendItem.status === 'NOT_TRIGGERED') {
        frontendStatus = 'Draft';
      } else if (backendItem.status === 'TRIGGERED') {
        frontendStatus = 'Triggered';
      }

      return {
        ...backendItem,
        id: localId,
        backendId: backendItem.id,
        status: frontendStatus,
        equipmentType: mapEquipmentFromBackend(backendItem.equipmentType),
        quotedLoads: backendItem._count?.loads || 0,
        creationDate: new Date(backendItem.createdAt).toISOString().split("T")[0],
        autoTierEnabled: localItem?.autoTierEnabled || false,
        customTiers: localItem?.customTiers || [],
        additionalSettings: localItem?.additionalSettings,
        isSynced: true,
        // Agregar propiedades del waterfall si existen
        waterfall: backendItem.carriers ? {
          id: `wf-${backendItem.id}`,
          status: frontendStatus as "Draft" | "Active",
          items: backendItem.carriers || [],
          autoTierEnabled: localItem?.autoTierEnabled || false,
          customTiers: localItem?.customTiers || []
        } : undefined
      };
    });
  }, [getLocalData, isMounted]);

  // Obtener waterfalls del backend
  const fetchWaterfalls = useCallback(async (newFilters?: WaterfallFilters) => {
    try {
      setLoading(true);
      setError(null);
      const filtersToUse = newFilters || filters;
      const backendData = await waterfallsService.getWaterfalls(filtersToUse);
      const combinedData = combineWaterfallData(backendData);
      setWaterfalls(combinedData);
    } catch (err: any) {
      setError(err.message || 'Error fetching waterfalls');
      console.error('Error in useWaterfallsBackend:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, combineWaterfallData]);

  // Crear waterfall (guardar en backend y localStorage)
  const createWaterfall = useCallback(async (
    waterfallData: CreateWaterfallRequest,
    localData: { autoTierEnabled: boolean; customTiers: any[]; additionalSettings?: any }
  ) => {
    try {
      setLoading(true);
      
      // Crear en el backend
      const backendWaterfall = await waterfallsService.createWaterfall(waterfallData);
      
      // Guardar datos locales
      const localId = `backend-${backendWaterfall.id}`;
      updateLocalData(localId, {
        id: localId,
        backendId: backendWaterfall.id,
        autoTierEnabled: localData.autoTierEnabled,
        customTiers: localData.customTiers,
        additionalSettings: localData.additionalSettings,
        lastSyncedAt: new Date().toISOString()
      });

      // Actualizar lista local
      await fetchWaterfalls();
      
      return { success: true, data: backendWaterfall };
    } catch (err: any) {
      console.error('Error creating waterfall:', err);
      return { success: false, error: err.message || 'Error creating waterfall' };
    } finally {
      setLoading(false);
    }
  }, [updateLocalData, fetchWaterfalls]);

  // Actualizar waterfall
  const updateWaterfall = useCallback(async (
    localId: string,
    waterfallData: Omit<CreateWaterfallRequest, 'id'>,
    localData: { autoTierEnabled: boolean; customTiers: any[]; additionalSettings?: any }
  ) => {
    try {
      setLoading(true);
      
      const currentWaterfall = waterfalls.find(w => w.id === localId);
      if (!currentWaterfall?.backendId) {
        throw new Error('Backend ID not found for waterfall');
      }

      // Actualizar en el backend
      const backendWaterfall = await waterfallsService.updateWaterfall(currentWaterfall.backendId, waterfallData);
      
      // Actualizar datos locales
      updateLocalData(localId, {
        autoTierEnabled: localData.autoTierEnabled,
        customTiers: localData.customTiers,
        additionalSettings: localData.additionalSettings,
        lastSyncedAt: new Date().toISOString()
      });

      // Actualizar lista local
      await fetchWaterfalls();
      
      return { success: true, data: backendWaterfall };
    } catch (err: any) {
      console.error('Error updating waterfall:', err);
      return { success: false, error: err.message || 'Error updating waterfall' };
    } finally {
      setLoading(false);
    }
  }, [waterfalls, updateLocalData, fetchWaterfalls]);

  // Eliminar waterfall
  const deleteWaterfall = useCallback(async (localId: string) => {
    try {
      const currentWaterfall = waterfalls.find(w => w.id === localId);
      if (!currentWaterfall?.backendId) {
        throw new Error('Backend ID not found for waterfall');
      }

      // Eliminar del backend
      await waterfallsService.deleteWaterfall(currentWaterfall.backendId);
      
      // Eliminar datos locales
      const localData = getLocalData();
      const filteredLocalData = localData.filter(item => 
        item.id !== localId && item.backendId !== currentWaterfall.backendId
      );
      saveLocalData(filteredLocalData);

      // Actualizar lista local
      await fetchWaterfalls();
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting waterfall:', err);
      return { success: false, error: err.message || 'Error deleting waterfall' };
    }
  }, [waterfalls, getLocalData, saveLocalData, fetchWaterfalls]);

  // Cambiar status del waterfall
  const toggleWaterfallStatus = useCallback(async (localId: string, status: 'ACTIVE' | 'PAUSED') => {
    try {
      const currentWaterfall = waterfalls.find(w => w.id === localId);
      if (!currentWaterfall?.backendId) {
        throw new Error('Backend ID not found for waterfall');
      }

      // Actualizar en el backend
      const backendWaterfall = await waterfallsService.toggleWaterfallStatus(currentWaterfall.backendId, status);
      
      // Actualizar lista local
      await fetchWaterfalls();
      
      return { success: true, data: backendWaterfall };
    } catch (err: any) {
      console.error('Error toggling waterfall status:', err);
      return { success: false, error: err.message || 'Error toggling waterfall status' };
    }
  }, [waterfalls, fetchWaterfalls]);

  // Actualizar solo datos locales (sin sincronizar con backend)
  const updateLocalDataOnly = useCallback((localId: string, localUpdates: { autoTierEnabled?: boolean; customTiers?: any[]; additionalSettings?: any }) => {
    updateLocalData(localId, localUpdates);
    
    // Actualizar el estado local inmediatamente
    setWaterfalls(prev => prev.map(waterfall => 
      waterfall.id === localId 
        ? { ...waterfall, ...localUpdates }
        : waterfall
    ));
  }, [updateLocalData]);

  // Sincronizar datos específicos entre backend y localStorage
  const syncWaterfallData = useCallback(async (localId: string) => {
    try {
      const currentWaterfall = waterfalls.find(w => w.id === localId);
      if (!currentWaterfall?.backendId) {
        console.warn('No backend ID found for waterfall:', localId);
        return { success: false, error: 'No backend ID found' };
      }

      // Obtener datos más recientes del backend
      const backendWaterfall = await waterfallsService.getWaterfallById(currentWaterfall.backendId);
      
      // Obtener datos locales actuales
      const localData = getLocalData();
      const currentLocalData = localData.find(item => 
        item.id === localId || item.backendId === currentWaterfall.backendId
      );

      // Marcar como sincronizado
      updateLocalData(localId, {
        lastSyncedAt: new Date().toISOString()
      });

      // Actualizar waterfall en la lista con datos del backend + localStorage
      const updatedWaterfall: CombinedWaterfall = {
        ...backendWaterfall,
        id: localId,
        backendId: backendWaterfall.id,
        status: backendWaterfall.status === 'NOT_TRIGGERED' ? 'Draft' : 
                backendWaterfall.status === 'TRIGGERED' ? 'Triggered' : backendWaterfall.status,
        equipmentType: mapEquipmentFromBackend(backendWaterfall.equipmentType),
        quotedLoads: backendWaterfall._count?.loads || 0,
        creationDate: new Date(backendWaterfall.createdAt).toISOString().split("T")[0],
        autoTierEnabled: currentLocalData?.autoTierEnabled || false,
        customTiers: currentLocalData?.customTiers || [],
        additionalSettings: currentLocalData?.additionalSettings,
        isSynced: true,
        waterfall: backendWaterfall.carriers ? {
          id: `wf-${backendWaterfall.id}`,
          status: (backendWaterfall.status === 'NOT_TRIGGERED' ? 'Draft' : 'Active') as "Draft" | "Active",
          items: backendWaterfall.carriers || [],
          autoTierEnabled: currentLocalData?.autoTierEnabled || false,
          customTiers: currentLocalData?.customTiers || []
        } : undefined
      };

      // Actualizar en el estado local
      setWaterfalls(prev => prev.map(w => w.id === localId ? updatedWaterfall : w));
      
      return { success: true, data: updatedWaterfall };
    } catch (err: any) {
      console.error('Error syncing waterfall data:', err);
      return { success: false, error: err.message || 'Error syncing data' };
    }
  }, [waterfalls, getLocalData, updateLocalData]);

  // Sincronizar todos los waterfalls
  const syncAllWaterfalls = useCallback(async () => {
    try {
      setLoading(true);
      
      // Refrescar desde el backend
      await fetchWaterfalls();
      
      // Marcar todos como sincronizados
      const localData = getLocalData();
      const updatedLocalData = localData.map(item => ({
        ...item,
        lastSyncedAt: new Date().toISOString()
      }));
      saveLocalData(updatedLocalData);
      
      return { success: true };
    } catch (err: any) {
      console.error('Error syncing all waterfalls:', err);
      return { success: false, error: err.message || 'Error syncing all waterfalls' };
    } finally {
      setLoading(false);
    }
  }, [fetchWaterfalls, getLocalData, saveLocalData]);

  // Verificar si hay datos no sincronizados
  const checkSyncStatus = useCallback(() => {
    // Solo ejecutar en el cliente cuando esté montado
    if (!isMounted || typeof window === 'undefined') {
      return {
        hasUnsyncedData: false,
        unsyncedCount: 0,
        unsyncedItems: []
      };
    }
    
    const localData = getLocalData();
    const unsyncedItems = localData.filter(item => {
      if (!item.lastSyncedAt) return true;
      
      const lastSync = new Date(item.lastSyncedAt);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return lastSync < fiveMinutesAgo;
    });
    
    return {
      hasUnsyncedData: unsyncedItems.length > 0,
      unsyncedCount: unsyncedItems.length,
      unsyncedItems
    };
  }, [getLocalData, isMounted]);

  // Reparar inconsistencias entre backend y localStorage
  const repairDataInconsistencies = useCallback(async () => {
    try {
      console.log('🔧 Starting data consistency repair...');
      
      // Obtener datos frescos del backend
      const backendData = await waterfallsService.getWaterfalls();
      const localData = getLocalData();
      
      // Encontrar datos locales que no tienen correspondencia en el backend
      const orphanedLocalData = localData.filter(localItem => {
        if (!localItem.backendId) return false;
        return !backendData.some(backendItem => backendItem.id === localItem.backendId);
      });
      
      // Limpiar datos locales huérfanos
      if (orphanedLocalData.length > 0) {
        console.log(`🧹 Cleaning ${orphanedLocalData.length} orphaned local data entries`);
        const cleanedLocalData = localData.filter(localItem => 
          !orphanedLocalData.some(orphan => orphan.id === localItem.id)
        );
        saveLocalData(cleanedLocalData);
      }
      
      // Asegurar que todos los waterfalls del backend tengan entrada local
      backendData.forEach(backendItem => {
        const localId = `backend-${backendItem.id}`;
        const hasLocalEntry = localData.some(localItem => 
          localItem.backendId === backendItem.id || localItem.id === localId
        );
        
        if (!hasLocalEntry) {
          console.log(`📝 Creating missing local entry for backend waterfall ${backendItem.id}`);
          updateLocalData(localId, {
            id: localId,
            backendId: backendItem.id,
            autoTierEnabled: false,
            customTiers: [],
            lastSyncedAt: new Date().toISOString()
          });
        }
      });
      
      console.log('✅ Data consistency repair completed');
      return { success: true };
    } catch (err: any) {
      console.error('❌ Error during data consistency repair:', err);
      return { success: false, error: err.message || 'Repair failed' };
    }
  }, [getLocalData, saveLocalData, updateLocalData]);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters: WaterfallFilters) => {
    setFilters(newFilters);
    fetchWaterfalls(newFilters);
  }, [fetchWaterfalls]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isMounted) {
      fetchWaterfalls();
    }
  }, [isMounted]);

  return {
    waterfalls,
    loading,
    error,
    filters,
    fetchWaterfalls,
    createWaterfall,
    updateWaterfall,
    deleteWaterfall,
    toggleWaterfallStatus,
    updateLocalDataOnly,
    updateFilters,
    // Funciones de sincronización
    syncWaterfallData,
    syncAllWaterfalls,
    checkSyncStatus,
    repairDataInconsistencies
  };
}
