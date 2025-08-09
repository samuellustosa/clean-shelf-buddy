import { Equipment, EquipmentStatus } from '@/types/equipment';
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';

export const getDaysUntilNextCleaning = (equipment: Equipment): number => {
  const today = startOfDay(new Date());
  const lastCleaning = startOfDay(new Date(equipment.last_cleaning));
  const nextCleaning = addDays(lastCleaning, Math.max(1, Number(equipment.periodicity) || 1));
  return differenceInCalendarDays(nextCleaning, today);
};

export const getEquipmentStatus = (equipment: Equipment): EquipmentStatus => {
  const daysUntil = getDaysUntilNextCleaning(equipment);
  return daysUntil < 0 ? 'overdue' : 'ok';
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};