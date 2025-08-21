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

// Nova interface para o perfil do usuário
export interface UserProfile {
  id: string;
  full_name: string | null;
  permissions: {
    can_add: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_mark_cleaned: boolean;
    can_manage_users: boolean;
  };
  email: string;
}

export interface EquipmentFilters {
  status?: EquipmentStatus | 'all';
  sector?: string;
  responsible?: string;
  searchTerm?: string;
}

export type EquipmentStatus = 'ok' | 'overdue' | 'warning';