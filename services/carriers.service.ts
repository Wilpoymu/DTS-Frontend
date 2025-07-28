import httpClient from './http-client';

// Types
export interface Contact {
  name: string;
  phone: string;
  email: string;
}

export interface Carrier {
  id: number;
  name: string;
  mc: string;
  status: "ACTIVE" | "INACTIVE";
  primaryContact: Contact;
  secondaryContact?: Contact;
  waterfall?: any[];
  averageRate?: string;
  responseWindow?: number;
  assignedRep?: string;
  acceptanceRate?: number;
  onTimePickup?: number;
  onTimeDelivery?: number;
}

export interface CreateCarrierRequest {
  name: string;
  mc: string;
  primaryContact: Contact;
  secondaryContact?: Contact;
  averageRate?: string;
  responseWindow?: number;
  assignedRep?: string;
  acceptanceRate?: number;
  onTimePickup?: number;
  onTimeDelivery?: number;
}

export interface UpdateCarrierRequest {
  id: number;
  name: string;
  mc: string;
  status: "ACTIVE" | "INACTIVE";
  primaryContact: Contact;
  secondaryContact?: Contact;
  averageRate?: string;
  responseWindow?: number;
  assignedRep?: string;
  acceptanceRate?: number;
  onTimePickup?: number;
  onTimeDelivery?: number;
}

export interface CarrierFilters {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  assignedRep?: string;
}

class CarriersService {
  private readonly basePath = '/carrier';

  /**
   * Get all carriers with optional filtering
   */
  async getCarriers(filters?: CarrierFilters): Promise<Carrier[]> {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.assignedRep) {
      params.append('assignedRep', filters.assignedRep);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    const response = await httpClient.get<Carrier[]>(url);
    return response.data;
  }

  /**
   * Get a single carrier by ID
   */
  async getCarrier(id: number): Promise<Carrier> {
    const response = await httpClient.get<Carrier>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Create a new carrier
   */
  async createCarrier(carrierData: CreateCarrierRequest): Promise<Carrier> {
    const response = await httpClient.post<Carrier>(this.basePath, carrierData);
    return response.data;
  }

  /**
   * Update an existing carrier using PUT method with ID in URL
   */
  async updateCarrier(id: number, carrierData: Omit<UpdateCarrierRequest, 'id'>): Promise<Carrier> {
    const response = await httpClient.put<Carrier>(`${this.basePath}/${id}`, carrierData);
    return response.data;
  }

  /**
   * Delete a carrier
   */
  async deleteCarrier(id: number): Promise<void> {
    await httpClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Toggle carrier status using PUT method with ID in URL
   */
  async toggleCarrierStatus(id: number, currentCarrier: Carrier): Promise<Carrier> {
    const newStatus: "ACTIVE" | "INACTIVE" = currentCarrier.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    const updateData = {
      name: currentCarrier.name,
      mc: currentCarrier.mc,
      status: newStatus,
      primaryContact: { ...currentCarrier.primaryContact },
      secondaryContact: currentCarrier.secondaryContact ? { ...currentCarrier.secondaryContact } : undefined,
      averageRate: currentCarrier.averageRate || "$0.00/mile",
      responseWindow: currentCarrier.responseWindow || 30,
      assignedRep: currentCarrier.assignedRep || "Unassigned",
      acceptanceRate: currentCarrier.acceptanceRate || 0,
      onTimePickup: currentCarrier.onTimePickup || 0,
      onTimeDelivery: currentCarrier.onTimeDelivery || 0
    };

    return this.updateCarrier(id, updateData);
  }
}

// Export singleton instance
const carriersService = new CarriersService();
export default carriersService;
