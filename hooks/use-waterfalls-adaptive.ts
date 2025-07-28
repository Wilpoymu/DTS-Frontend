import { useWaterfallsBackend } from './use-waterfalls-backend';
import { useWaterfallsDemo } from './use-waterfalls-demo';
import { useIsDemoMode } from './use-demo-config';
import { WaterfallFilters } from '@/services/index';

/**
 * Hook inteligente que usa waterfalls demo o backend según la configuración
 */
export function useWaterfallsAdaptive(initialFilters?: WaterfallFilters) {
  const isDemoMode = useIsDemoMode();
  
  // Usar el hook correspondiente según el modo
  const backendHook = useWaterfallsBackend(initialFilters);
  const demoHook = useWaterfallsDemo(initialFilters);
  
  if (isDemoMode) {
    console.log('🎭 Using waterfalls DEMO mode');
    // Transformar la interfaz del demo para que coincida con el backend
    return {
      ...demoHook,
      // Renombrar funciones para mantener compatibilidad
      fetchWaterfalls: demoHook.getWaterfalls,
      createWaterfall: demoHook.createWaterfall,
      updateWaterfall: demoHook.updateWaterfall,
      deleteWaterfall: demoHook.deleteWaterfall,
      toggleWaterfallStatus: demoHook.toggleWaterfallStatus,
      updateFilters: demoHook.applyFilters,
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
    };
  }
}
