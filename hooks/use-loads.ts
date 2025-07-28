import { useState, useEffect, useCallback } from 'react';
import { loadsService, Load, LoadFilters, CreateLoadRequest, UpdateLoadRequest } from '@/services';

export function useLoads(initialFilters?: LoadFilters) {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LoadFilters>(initialFilters || {});

  // Función para cargar loads
  const fetchLoads = useCallback(async (newFilters?: any) => {
    setLoading(true);
    try {
      const appliedFilters = newFilters || filters;
      const response = await loadsService.getLoads(appliedFilters);
      setLoads(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error loading loads');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Función para crear una nueva carga
  const createLoad = async (loadData: CreateLoadRequest): Promise<{ success: boolean; load?: Load; error?: string }> => {

    try {
      const response = await loadsService.createLoad(loadData);
      
      // Actualizar la lista local
      setLoads(prev => [response.data, ...prev]);
      
      return { success: true, load: response.data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Función para actualizar una carga
  const updateLoad = async (id: number, updateData: UpdateLoadRequest): Promise<{ success: boolean; load?: Load; error?: string }> => {

    try {
      const response = await loadsService.updateLoad(id, updateData);
      
      // Actualizar la lista local
      setLoads(prev => prev.map(load => 
        load.id === id ? response.data : load
      ));
      
      return { success: true, load: response.data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Función para eliminar una carga
  const deleteLoad = async (id: number): Promise<{ success: boolean; error?: string }> => {

    try {
      await loadsService.deleteLoad(id);
      
      // Remover de la lista local
      setLoads(prev => prev.filter(load => load.id !== id));
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Función para aceptar una carga
  const acceptLoad = async (id: number): Promise<{ success: boolean; load?: Load; error?: string }> => {

    try {
      const response = await loadsService.acceptLoad(id);
      
      // Actualizar la lista local
      setLoads(prev => prev.map(load => 
        load.id === id ? response.data : load
      ));
      
      return { success: true, load: response.data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Función para rechazar una carga
  const rejectLoad = async (id: number, reason?: string): Promise<{ success: boolean; load?: Load; error?: string }> => {

    try {
      const response = await loadsService.rejectLoad(id, reason);
      
      // Actualizar la lista local
      setLoads(prev => prev.map(load => 
        load.id === id ? response.data : load
      ));
      
      return { success: true, load: response.data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Función para obtener una carga específica
  const getLoadById = async (id: number): Promise<Load | null> => {

    try {
      const response = await loadsService.getLoadById(id);
      return response.data;
    } catch (err: any) {
      return null;
    }
  };

  // Función para aplicar filtros
  const applyFilters = (newFilters: LoadFilters) => {
    fetchLoads(newFilters);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    fetchLoads(emptyFilters);
  };

  // Función para refrescar los datos
  const refresh = () => {
    fetchLoads();
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchLoads();
  }, []); // Solo al montar el componente

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
