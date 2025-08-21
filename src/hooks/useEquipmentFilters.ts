import { useState, useMemo } from 'react';
import { Equipment, EquipmentFilters } from '@/types/equipment';

export const useEquipmentFilters = (equipment: Equipment[]) => {
  const [filters, setFilters] = useState<EquipmentFilters>({
    status: 'all',
    sector: 'all',
    responsible: 'all',
    searchTerm: '',
  });

  // Since filtering is now done on the server, we just return the original list.
  // The filtering logic in this hook is now obsolete.
  const filteredEquipment = useMemo(() => {
    return equipment;
  }, [equipment]);

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
    filteredEquipment, // This now just returns the unfiltered list from the server
    uniqueSectors,
    uniqueResponsibles,
    clearFilters
  };
};