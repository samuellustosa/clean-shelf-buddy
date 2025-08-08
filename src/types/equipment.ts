export interface Equipment {
  id: string;
  name: string;
  sector: string;
  responsible: string;
  periodicity: number; // days
  last_cleaning: string; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface CleaningHistory {
  id: string;
  equipment_id: string;
  cleaning_date: string; // ISO date string
  responsible_by: string;
  created_at: string;
}

export interface EquipmentFilters {
  status?: EquipmentStatus | 'all';
  sector?: string;
  responsible?: string;
  searchTerm?: string;
  daysRange?: {
    min?: number;
    max?: number;
  };
}

export type EquipmentStatus = 'ok' | 'overdue';