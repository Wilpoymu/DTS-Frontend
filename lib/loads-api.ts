import { loadsService, Load } from '@/services';

// Re-exportar el tipo Load para compatibilidad
export type { Load as BackendLoad } from '@/services';

export async function fetchLoads(): Promise<Load[]> {
  try {
    const response = await loadsService.getLoads();
    return response.data;
  } catch (error: any) {
    throw error;
  }
} 