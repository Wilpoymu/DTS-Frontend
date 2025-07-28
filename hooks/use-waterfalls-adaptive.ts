import { useWaterfallsBackend } from './use-waterfalls-backend';
import { useWaterfallsDemo } from './use-waterfalls-demo';
import { useIsDemoMode } from './use-demo-config';
import { WaterfallFilters, CreateWaterfallRequest, UpdateWaterfallRequest } from '@/services/index';

/**
 * Hook inteligente que usa waterfalls demo o backend según la configuración
 */
export function useWaterfallsAdaptive(initialFilters?: WaterfallFilters) {
  const isDemoMode = useIsDemoMode();
  
  // Usar el hook correspondiente según el modo
  const backendHook = useWaterfallsBackend(initialFilters);
  const demoHook = useWaterfallsDemo(initialFilters);
  
  // Función para limpiar el draft temporal del currentWaterfall
  const clearWaterfallDraft = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('currentWaterfall');
        console.log('🧹 Cleared currentWaterfall draft from localStorage');
      } catch (error) {
        console.error('Error clearing waterfall draft:', error);
      }
    }
  };
  
  if (isDemoMode) {
    console.log('🎭 Using waterfalls DEMO mode');
    // Transformar la interfaz del demo para que coincida con el backend
    return {
      ...demoHook,
      // Renombrar funciones para mantener compatibilidad
      fetchWaterfalls: demoHook.getWaterfalls,
      createWaterfall: async (data: CreateWaterfallRequest) => {
        const result = await demoHook.createWaterfall(data);
        // Limpiar draft después de crear exitosamente
        clearWaterfallDraft();
        return result;
      },
      updateWaterfall: async (id: number, data: UpdateWaterfallRequest) => {
        const result = await demoHook.updateWaterfall(id, data);
        // Limpiar draft después de actualizar exitosamente
        clearWaterfallDraft();
        return result;
      },
      deleteWaterfall: demoHook.deleteWaterfall,
      toggleWaterfallStatus: demoHook.toggleWaterfallStatus,
      updateFilters: demoHook.applyFilters,
      clearWaterfallDraft,
    };
  } else {
    console.log('🌐 Using waterfalls BACKEND mode');
    return {
      ...backendHook,
      // Mantener interfaz consistente
      getWaterfalls: backendHook.fetchWaterfalls,
      applyFilters: backendHook.updateFilters,
      clearFilters: () => backendHook.updateFilters({}),
      refresh: () => backendHook.fetchWaterfalls(),
      clearWaterfallDraft,
    };
  }
}
