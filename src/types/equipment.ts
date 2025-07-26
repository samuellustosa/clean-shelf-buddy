export interface Equipment {
  id: string;
  name: string;
  sector: string;
  responsible: string;
  periodicity: number; // days
  lastCleaning: string; // ISO date string
  createdAt: string;
}

export interface CleaningHistory {
  id: string;
  equipmentId: string;
  cleaningDate: string; // ISO date string
  responsibleBy: string;
  createdAt: string;
}

export type EquipmentStatus = 'ok' | 'overdue';