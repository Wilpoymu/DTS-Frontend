import { useCarriers } from './use-carriers';
import { useCarriersDemo } from './use-carriers-demo';
import { useIsDemoMode } from './use-demo-config';
import { CarrierFilters } from '@/services/index';

/**
 * Hook inteligente que usa carriers demo o backend según la configuración
 */
export function useCarriersAdaptive(initialFilters?: CarrierFilters) {
  const isDemoMode = useIsDemoMode();
  
  // Usar el hook correspondiente según el modo
  const backendHook = useCarriers(initialFilters);
  const demoHook = useCarriersDemo(initialFilters);
  
  if (isDemoMode) {
    console.log('🎭 Using carriers DEMO mode');
    return demoHook;
  } else {
    console.log('🌐 Using carriers BACKEND mode');
    return backendHook;
  }
}
