import { Equipment, EquipmentStatus } from '@/types/equipment';

export const getEquipmentStatus = (equipment: Equipment): EquipmentStatus => {
  const today = new Date();
  const lastCleaningDate = new Date(equipment.last_cleaning);
  const nextCleaningDate = new Date(lastCleaningDate);
  nextCleaningDate.setDate(lastCleaningDate.getDate() + equipment.periodicity);

  return today > nextCleaningDate ? 'overdue' : 'ok';
};

export const getDaysUntilNextCleaning = (equipment: Equipment): number => {
  const today = new Date();
  const lastCleaningDate = new Date(equipment.last_cleaning);
  const nextCleaningDate = new Date(lastCleaningDate);
  nextCleaningDate.setDate(lastCleaningDate.getDate() + equipment.periodicity);

  const diffTime = nextCleaningDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};