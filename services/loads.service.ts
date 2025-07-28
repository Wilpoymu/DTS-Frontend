import httpClient, { ApiResponse } from './http-client';

export interface Load {
  id: number;
  createdAt: string;
  updatedAt: string;
  pickupDate: string;
  estimatedDeliveryDate: string;
  originZip: string;
  destinationZip: string;
  accepted: boolean;
  waterfallCarrierId: number | null;
  waterfallId: number | null;
  status: string;
  waterfall: any;
}

export interface CreateLoadRequest {
  pickupDate: string;
  estimatedDeliveryDate: string;
  originZip: string;
  destinationZip: string;
  description?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface UpdateLoadRequest extends Partial<CreateLoadRequest> {
  status?: string;
  accepted?: boolean;
  waterfallCarrierId?: number;
  waterfallId?: number;
}

export interface LoadFilters {
  status?: string;
  originZip?: string;
  destinationZip?: string;
  dateFrom?: string;
  dateTo?: string;
  accepted?: boolean;
  page?: number;
  limit?: number;
}

export interface LoadsResponse {
  loads: Load[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class LoadsService {
  private readonly endpoint = '/load';

  /**
   * Obtener todas las cargas con filtros opcionales
   */
  async getLoads(filters?: LoadFilters): Promise<ApiResponse<Load[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      
      const url = queryParams.toString() 
        ? `${this.endpoint}?${queryParams.toString()}`
        : this.endpoint;
      
      const response = await httpClient.get<Load[]>(url);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener una carga específica por ID
   */
  async getLoadById(id: number): Promise<ApiResponse<Load>> {
    try {
      const response = await httpClient.get<Load>(`${this.endpoint}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear una nueva carga
   */
  async createLoad(loadData: CreateLoadRequest): Promise<ApiResponse<Load>> {
    try {
      const response = await httpClient.post<Load>(this.endpoint, loadData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar una carga existente
   */
  async updateLoad(id: number, updateData: UpdateLoadRequest): Promise<ApiResponse<Load>> {
    try {
      const response = await httpClient.put<Load>(`${this.endpoint}/${id}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar una carga
   */
  async deleteLoad(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await httpClient.delete<{ message: string }>(`${this.endpoint}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Aceptar una carga
   */
  async acceptLoad(id: number): Promise<ApiResponse<Load>> {
    try {
      const response = await httpClient.put<Load>(`${this.endpoint}/${id}/accept`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rechazar una carga
   */
  async rejectLoad(id: number, reason?: string): Promise<ApiResponse<Load>> {
    try {
      const data = reason ? { reason } : undefined;
      const response = await httpClient.put<Load>(`${this.endpoint}/${id}/reject`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener cargas por waterfall
   */
  async getLoadsByWaterfall(waterfallId: number): Promise<ApiResponse<Load[]>> {
    try {
      const response = await httpClient.get<Load[]>(`${this.endpoint}/waterfall/${waterfallId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Instancia singleton del servicio de cargas
export const loadsService = new LoadsService();
export default loadsService;
