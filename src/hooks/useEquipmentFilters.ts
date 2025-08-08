import { useState, useMemo } from 'react';
import { Equipment, EquipmentFilters } from '@/types/equipment';
import { getEquipmentStatus, getDaysUntilNextCleaning } from '@/utils/equipmentUtils';

export const useEquipmentFilters = (equipment: Equipment[]) => {
  const [filters, setFilters] = useState<EquipmentFilters>({
    status: 'all',
    sector: '',
    responsible: '',
    searchTerm: '',
    daysRange: {}
  });

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      // Status filter
      if (filters.status && filters.status !== 'all') {
        const status = getEquipmentStatus(item);
        if (status !== filters.status) return false;
      }

      // Sector filter
      if (filters.sector && item.sector !== filters.sector) {
        return false;
      }

      // Responsible filter
      if (filters.responsible && item.responsible !== filters.responsible) {
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

      // Days range filter
      if (filters.daysRange?.min !== undefined || filters.daysRange?.max !== undefined) {
        const daysUntilNext = getDaysUntilNextCleaning(item);
        if (filters.daysRange.min !== undefined && daysUntilNext < filters.daysRange.min) {
          return false;
        }
        if (filters.daysRange.max !== undefined && daysUntilNext > filters.daysRange.max) {
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
      sector: '',
      responsible: '',
      searchTerm: '',
      daysRange: {}
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