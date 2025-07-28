// Demo Configuration
// Configuración para controlar el modo demo de la aplicación

export interface DemoConfig {
  enabled: boolean;
  showDemoIndicators: boolean;
  bypassAuthentication: boolean;
  defaultRedirect: string;
}

// Configuración del modo demo
export const DEMO_CONFIG: DemoConfig = {
  // Habilitar/deshabilitar modo demo
  enabled: true,
  
  // Mostrar indicadores visuales de que estamos en modo demo
  showDemoIndicators: true,
  
  // Saltar completamente la autenticación
  bypassAuthentication: true,
  
  // Página por defecto cuando se accede a la raíz
  defaultRedirect: '/carrier-waterfalls'
};

// Función helper para verificar si estamos en modo demo
export const isDemoMode = (): boolean => {
  return DEMO_CONFIG.enabled;
};

// Función helper para verificar si debemos mostrar indicadores
export const showDemoIndicators = (): boolean => {
  return DEMO_CONFIG.enabled && DEMO_CONFIG.showDemoIndicators;
};

// Función helper para verificar si debemos saltar autenticación
export const bypassAuth = (): boolean => {
  return DEMO_CONFIG.enabled && DEMO_CONFIG.bypassAuthentication;
};

// Función helper para obtener la redirección por defecto
export const getDefaultRedirect = (): string => {
  return DEMO_CONFIG.defaultRedirect;
};

/* 
INSTRUCCIONES DE USO:

Para habilitar modo demo:
1. Cambiar DEMO_CONFIG.enabled = true
2. Reiniciar la aplicación

Para deshabilitar modo demo (volver a producción):
1. Cambiar DEMO_CONFIG.enabled = false  
2. Cambiar DEMO_CONFIG.bypassAuthentication = false
3. Reiniciar la aplicación

Para mostrar/ocultar indicadores visuales:
- Cambiar DEMO_CONFIG.showDemoIndicators = true/false

Para cambiar página por defecto:
- Modificar DEMO_CONFIG.defaultRedirect
*/
