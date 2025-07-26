import { useState, useEffect } from 'react';
import { Equipment, CleaningHistory } from '@/types/equipment';

const EQUIPMENT_STORAGE_KEY = 'cleaning-checklist-equipment';
const HISTORY_STORAGE_KEY = 'cleaning-checklist-history';

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [history, setHistory] = useState<CleaningHistory[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEquipment = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);

    if (savedEquipment) {
      setEquipment(JSON.parse(savedEquipment));
    } else {
      // Initialize with sample data
      const sampleEquipment: Equipment[] = [
        {
          id: '1',
          name: 'Freezer Vertical',
          sector: 'Congelados',
          responsible: 'João Silva',
          periodicity: 7,
          lastCleaning: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Balança Digital',
          sector: 'Açougue',
          responsible: 'Maria Santos',
          periodicity: 3,
          lastCleaning: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Câmara Fria',
          sector: 'Frios',
          responsible: 'Pedro Costa',
          periodicity: 14,
          lastCleaning: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          createdAt: new Date().toISOString(),
        },
      ];
      setEquipment(sampleEquipment);
      localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(sampleEquipment));
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveEquipment = (newEquipment: Equipment[]) => {
    setEquipment(newEquipment);
    localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(newEquipment));
  };

  const saveHistory = (newHistory: CleaningHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  };

  const addEquipment = (newEquipment: Omit<Equipment, 'id' | 'createdAt'>) => {
    const newEquipmentItem: Equipment = {
      ...newEquipment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...equipment, newEquipmentItem];
    saveEquipment(updated);
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    const updated = equipment.map(eq => 
      eq.id === id ? { ...eq, ...updates } : eq
    );
    saveEquipment(updated);
  };

  const deleteEquipment = (id: string) => {
    const updated = equipment.filter(eq => eq.id !== id);
    saveEquipment(updated);
    
    // Also remove related history
    const updatedHistory = history.filter(h => h.equipmentId !== id);
    saveHistory(updatedHistory);
  };

  const markAsCleaned = (equipmentId: string) => {
    const now = new Date().toISOString();
    const equipmentItem = equipment.find(eq => eq.id === equipmentId);
    
    // Update equipment last cleaning date
    updateEquipment(equipmentId, { lastCleaning: now });
    
    // Add to history
    const historyEntry: CleaningHistory = {
      id: crypto.randomUUID(),
      equipmentId,
      cleaningDate: now,
      responsibleBy: equipmentItem?.responsible || 'Não informado',
      createdAt: now,
    };
    
    const updatedHistory = [...history, historyEntry];
    saveHistory(updatedHistory);
  };

  const getEquipmentHistory = (equipmentId: string) => {
    return history
      .filter(h => h.equipmentId === equipmentId)
      .sort((a, b) => new Date(b.cleaningDate).getTime() - new Date(a.cleaningDate).getTime());
  };

  return {
    equipment,
    history,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    markAsCleaned,
    getEquipmentHistory,
  };
};