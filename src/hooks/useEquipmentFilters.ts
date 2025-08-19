import { useState, useMemo } from 'react';
import { Equipment, EquipmentFilters } from '@/types/equipment';
import { getEquipmentStatus } from '@/utils/equipmentUtils';

export const useEquipmentFilters = (equipment: Equipment[]) => {
  const [filters, setFilters] = useState<EquipmentFilters>({
    status: 'all',
    sector: 'all',
    responsible: 'all',
    searchTerm: '',
  });

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      // Status filter
      if (filters.status && filters.status !== 'all') {
        const status = getEquipmentStatus(item);
        if (status !== filters.status) return false;
      }

      // Sector filter
      if (filters.sector && filters.sector !== 'all' && item.sector !== filters.sector) {
        return false;
      }

      // Responsible filter
      if (filters.responsible && filters.responsible !== 'all' && item.responsible !== filters.responsible) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!item.name.toLowerCase().includes(searchLower) &&
            !item.sector.toLowerCase().includes(searchLower) &&
            !item.responsible.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [equipment, filters]);

  const uniqueSectors = useMemo(() => {
    return Array.from(new Set(equipment.map(item => item.sector))).sort();
  }, [equipment]);

  const uniqueResponsibles = useMemo(() => {
    return Array.from(new Set(equipment.map(item => item.responsible))).sort();
  }, [equipment]);

  const clearFilters = () => {
    setFilters({
      status: 'all',
      sector: 'all',
      responsible: 'all',
      searchTerm: '',
    });
  };

  return {
    filters,
    setFilters,
    filteredEquipment,
    uniqueSectors,
    uniqueResponsibles,
    clearFilters
  };
};