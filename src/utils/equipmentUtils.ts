import { Equipment, EquipmentStatus } from '@/types/equipment';
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';

function parseDateLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export const getDaysUntilNextCleaning = (equipment: Equipment): number => {
  const today = startOfDay(new Date());
  const lastCleaning = startOfDay(parseDateLocal(equipment.last_cleaning));
  const periodicity = Math.max(1, Number(equipment.periodicity) || 1);
  const nextCleaning = addDays(lastCleaning, periodicity);
  return differenceInCalendarDays(nextCleaning, today);
};

export const getEquipmentStatus = (equipment: Equipment): EquipmentStatus => {
  const daysUntil = getDaysUntilNextCleaning(equipment);
  if (daysUntil < 0) {
    return 'overdue';
  }
  if (daysUntil === 0) {
    return 'overdue';
  }
  if (daysUntil === 1) {
    return 'warning';
  }
  return 'ok';
};

// Esta função foi corrigida para usar o fuso horário local
export const formatDate = (dateString: string): string => {
  try {
    const localDate = parseDateLocal(dateString);
    return localDate.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};