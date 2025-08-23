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

// Define um tipo específico para os status de manutenção do estoque
export type MaintenanceStatus = 'ok' | 'low_stock' | 'out_of_stock' | 'in_maintenance' | 'defective';

// Nova interface para os itens de estoque
export interface StockItem {
  id: string;
  name: string;
  category: string;
  current_quantity: number;
  minimum_stock: number;
  location: string;
  asset_number: string | null;
  maintenance_status: MaintenanceStatus;
  created_at: string;
  updated_at: string;
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
    can_manage_stock: boolean; // Nova permissão adicionada
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