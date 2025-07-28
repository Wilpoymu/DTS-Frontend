import { useLoads } from './use-loads';
import { useLoadsDemo } from './use-loads-demo';
import { useIsDemoMode } from './use-demo-config';
import { LoadFilters } from '@/services/index';

/**
 * Hook inteligente que usa loads demo o backend según la configuración
 */
export function useLoadsAdaptive(initialFilters?: LoadFilters) {
  const isDemoMode = useIsDemoMode();
  
  // Usar el hook correspondiente según el modo
  const backendHook = useLoads(initialFilters);
  const demoHook = useLoadsDemo(initialFilters);
  
  if (isDemoMode) {
    console.log('🎭 Using loads DEMO mode');
    return demoHook;
  } else {
    console.log('🌐 Using loads BACKEND mode');
    return backendHook;
  }
}
