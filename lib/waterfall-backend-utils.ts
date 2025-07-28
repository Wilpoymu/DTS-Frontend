import { CreateWaterfallRequest, WaterfallCarrier } from '@/services/index';
import { Lane, WaterfallItem } from '@/app/components/carrier-waterfalls/shared/types';

// Función para mapear tipos de equipo del frontend al backend
export const mapEquipmentTypeToBackend = (frontendType: string): 'DRY_VAN' | 'REFERIGERATED' | 'FLATBED' | 'TANKER' => {
  const mapping: { [key: string]: 'DRY_VAN' | 'REFERIGERATED' | 'FLATBED' | 'TANKER' } = {
    'Dry Van': 'DRY_VAN',
    'Refrigerated': 'REFERIGERATED', // Nota: el backend espera REFERIGERATED
    'Flatbed': 'FLATBED',
    'Step Deck': 'TANKER', // Mapear a TANKER temporalmente
    'Lowboy': 'TANKER' // Mapear a TANKER temporalmente
  };
  return mapping[frontendType] || 'DRY_VAN';
};

// Función para mapear tipos de equipo del backend al frontend
export const mapEquipmentTypeFromBackend = (backendType: string): string => {
  const mapping: { [key: string]: string } = {
    'DRY_VAN': 'Dry Van',
    'REFERIGERATED': 'Refrigerated',
    'FLATBED': 'Flatbed',
    'TANKER': 'Tanker'
  };
  return mapping[backendType] || backendType;
};

// Mapear tipos de equipo de backend a frontend
export const mapEquipmentFromBackend = (backendEquipment: string): string => {
  const mapping: { [key: string]: string } = {
    'DRY_VAN': 'Dry Van',
    'REFRIGERATED': 'Refrigerated',
    'FLATBED': 'Flatbed',
    'STEP_DECK': 'Step Deck',
    'LOWBOY': 'Lowboy'
  };
  return mapping[backendEquipment] || backendEquipment;
};

// Convertir WaterfallItem[] a WaterfallCarrier[] para el backend
export const transformWaterfallItemsToBackend = (waterfallItems: WaterfallItem[]): WaterfallCarrier[] => {
  return waterfallItems.map((item, index) => ({
    carrierId: parseInt(item.carrier?.id || '0'),
    rate: item.carrier?.rate || 0,
    order: index + 1, // El orden se basa en la posición en el array
    responseWindow: item.responseWindow || 30,
    dailyCapacity: (item.carrier as any)?.dailyCapacity?.toString() || '1' // Cast temporal para evitar error de tipo
  }));
};

// Convertir datos del frontend a formato del backend
export const transformLaneToBackendRequest = (
  lane: Lane, 
  waterfallItems: WaterfallItem[]
): CreateWaterfallRequest => {
  return {
    originZip: lane.originZip,
    destinationZip: lane.destinationZip,
    equipmentType: mapEquipmentTypeToBackend(lane.equipment),
    carriers: transformWaterfallItemsToBackend(waterfallItems)
  };
};

// Preparar datos locales para guardar en localStorage
export const prepareLocalData = (
  autoTierEnabled: boolean,
  customTiers: any[],
  additionalSettings?: any
) => {
  return {
    autoTierEnabled,
    customTiers,
    additionalSettings: {
      ...additionalSettings,
      lastModified: new Date().toISOString()
    }
  };
};

// Validar datos antes de enviar al backend
export const validateWaterfallData = (lane: Lane, waterfallItems: WaterfallItem[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar datos básicos del lane
  if (!lane.originZip || lane.originZip.length !== 5) {
    errors.push('Origin ZIP code must be 5 digits');
  }

  if (!lane.destinationZip || lane.destinationZip.length !== 5) {
    errors.push('Destination ZIP code must be 5 digits');
  }

  if (!lane.equipment) {
    errors.push('Equipment type is required');
  }

  // Validar waterfallItems
  if (waterfallItems.length === 0) {
    errors.push('At least one carrier must be added to the waterfall');
  }

  waterfallItems.forEach((item, index) => {
    if (!item.carrier?.id) {
      errors.push(`Carrier ${index + 1}: Carrier ID is required`);
    }

    if (!item.carrier?.rate || item.carrier.rate <= 0) {
      errors.push(`Carrier ${index + 1}: Rate must be greater than 0`);
    }

    if (!item.responseWindow || item.responseWindow <= 0) {
      errors.push(`Carrier ${index + 1}: Response window must be greater than 0`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generar un ID local único
export const generateLocalId = (): string => {
  return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Verificar si un waterfall tiene cambios pendientes de sincronizar
export const hasUnsyncedChanges = (waterfall: any): boolean => {
  return !waterfall.isSynced || !waterfall.backendId;
};

// Preparar mensaje de estado para mostrar al usuario
export const getWaterfallStatusMessage = (waterfall: any): string => {
  if (!waterfall.backendId) {
    return 'Draft - Not saved to server';
  }
  
  if (!waterfall.isSynced) {
    return 'Local changes pending sync';
  }
  
  return 'Synchronized';
};

// Función para limpiar datos obsoletos del localStorage
export const cleanupLocalStorage = (): void => {
  try {
    const LOCAL_STORAGE_KEY = 'dts-waterfall-local-data';
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (stored) {
      const localData = JSON.parse(stored);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Mantener solo datos de los últimos 30 días
      
      const filteredData = localData.filter((item: any) => {
        if (item.lastSyncedAt) {
          const syncDate = new Date(item.lastSyncedAt);
          return syncDate > cutoffDate;
        }
        return true; // Mantener items sin fecha de sincronización
      });
      
      if (filteredData.length !== localData.length) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredData));
        console.log(`Cleaned up ${localData.length - filteredData.length} old waterfall records`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up localStorage:', error);
  }
};
