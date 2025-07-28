import httpClient from './http-client';

// Types for backend API
export interface WaterfallCarrier {
  carrierId: number;
  rate: number;
  order: number;
  responseWindow: number;
  dailyCapacity: string;
}

export interface CreateWaterfallRequest {
  originZip: string;
  destinationZip: string;
  equipmentType: 'DRY_VAN' | 'REFERIGERATED' | 'FLATBED' | 'TANKER';
  carriers: WaterfallCarrier[];
}

export interface UpdateWaterfallRequest extends CreateWaterfallRequest {
  id: number;
}

export interface WaterfallResponse {
  id: number;
  originZip: string;
  destinationZip: string;
  equipmentType: string;
  status: 'NOT_TRIGGERED' | 'TRIGGERED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
  carriers?: WaterfallCarrier[]; // Opcional ya que puede no estar incluido en todas las respuestas
  _count?: {
    loads: number;
  };
}

export interface WaterfallFilters {
  status?: string;
  originZip?: string;
  destinationZip?: string;
  equipmentType?: string;
}

class WaterfallsService {
  private baseUrl = '/waterfall';

  // Obtener todos los waterfalls
  async getWaterfalls(filters?: WaterfallFilters): Promise<WaterfallResponse[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.originZip) params.append('originZip', filters.originZip);
    if (filters?.destinationZip) params.append('destinationZip', filters.destinationZip);
    if (filters?.equipmentType) params.append('equipmentType', filters.equipmentType);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    const response = await httpClient.get<WaterfallResponse[]>(url);
    return response.data;
  }

  // Obtener un waterfall por ID
  async getWaterfallById(id: number): Promise<WaterfallResponse> {
    const response = await httpClient.get<WaterfallResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Crear un nuevo waterfall
  async createWaterfall(data: CreateWaterfallRequest): Promise<WaterfallResponse> {
    const response = await httpClient.post<WaterfallResponse>(this.baseUrl, data);
    return response.data;
  }

  // Actualizar un waterfall existente
  async updateWaterfall(id: number, data: Omit<UpdateWaterfallRequest, 'id'>): Promise<WaterfallResponse> {
    const response = await httpClient.put<WaterfallResponse>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Eliminar un waterfall
  async deleteWaterfall(id: number): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  // Activar/pausar un waterfall
  async toggleWaterfallStatus(id: number, status: 'ACTIVE' | 'PAUSED'): Promise<WaterfallResponse> {
    const response = await httpClient.put<WaterfallResponse>(`${this.baseUrl}/${id}/status`, { status });
    return response.data;
  }

  // Función para mapear tipos de equipo desde el frontend al backend
  static mapEquipmentType(frontendType: string): 'DRY_VAN' | 'REFERIGERATED' | 'FLATBED' | 'TANKER' {
    const mapping: { [key: string]: 'DRY_VAN' | 'REFERIGERATED' | 'FLATBED' | 'TANKER' } = {
      'Dry Van': 'DRY_VAN',
      'Refrigerated': 'REFERIGERATED', // Nota: el backend espera REFERIGERATED (sin la R)
      'Flatbed': 'FLATBED',
      'Step Deck': 'TANKER', // Mapear Step Deck a TANKER por ahora
      'Lowboy': 'TANKER' // Mapear Lowboy a TANKER por ahora
    };
    return mapping[frontendType] || 'DRY_VAN';
  }

  // Función para mapear tipos de equipo desde el backend al frontend
  static mapEquipmentTypeFromBackend(backendType: string): string {
    const mapping: { [key: string]: string } = {
      'DRY_VAN': 'Dry Van',
      'REFERIGERATED': 'Refrigerated', // Nota: el backend envía REFERIGERATED
      'FLATBED': 'Flatbed',
      'TANKER': 'Tanker'
    };
    return mapping[backendType] || backendType;
  }
}

export default new WaterfallsService();
