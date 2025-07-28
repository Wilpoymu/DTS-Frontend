import { useState, useEffect } from 'react';
import { carriersService, Carrier, CreateCarrierRequest, UpdateCarrierRequest, CarrierFilters } from '@/services/index';

export function useCarriers(initialFilters?: CarrierFilters) {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CarrierFilters>(initialFilters || {});

  const fetchCarriers = async (newFilters?: CarrierFilters) => {
    try {
      setLoading(true);
      setError(null);
      const filtersToUse = newFilters || filters;
      const data = await carriersService.getCarriers(filtersToUse);
      setCarriers(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching carriers');
      console.error('Error in useCarriers:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCarrier = async (carrierData: CreateCarrierRequest) => {
    try {
      const newCarrier = await carriersService.createCarrier(carrierData);
      setCarriers(prev => [...prev, newCarrier]);
      return { success: true, data: newCarrier };
    } catch (err: any) {
      console.error('Error creating carrier:', err);
      return { success: false, error: err.message || 'Error creating carrier' };
    }
  };

  const editCarrier = async (id: number, carrierData: Omit<UpdateCarrierRequest, 'id'>) => {
    try {
      const updatedCarrier = await carriersService.updateCarrier(id, carrierData);
      setCarriers(prev => prev.map(carrier => 
        carrier.id === id ? updatedCarrier : carrier
      ));
      return { success: true, data: updatedCarrier };
    } catch (err: any) {
      console.error('Error updating carrier:', err);
      return { success: false, error: err.message || 'Error updating carrier' };
    }
  };

  const removeCarrier = async (id: number) => {
    try {
      await carriersService.deleteCarrier(id);
      setCarriers(prev => prev.filter(carrier => carrier.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting carrier:', err);
      return { success: false, error: err.message || 'Error deleting carrier' };
    }
  };

  const toggleCarrierStatus = async (id: number, currentCarrier: Carrier) => {
    try {
      const updatedCarrier = await carriersService.toggleCarrierStatus(id, currentCarrier);
      setCarriers(prev => prev.map(carrier => 
        carrier.id === id ? updatedCarrier : carrier
      ));
      return { success: true, data: updatedCarrier };
    } catch (err: any) {
      console.error('Error toggling carrier status:', err);
      return { success: false, error: err.message || 'Error toggling carrier status' };
    }
  };

  const updateFilters = (newFilters: CarrierFilters) => {
    setFilters(newFilters);
    fetchCarriers(newFilters);
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  return {
    carriers,
    loading,
    error,
    filters,
    fetchCarriers,
    addCarrier,
    editCarrier,
    removeCarrier,
    toggleCarrierStatus,
    updateFilters
  };
}
