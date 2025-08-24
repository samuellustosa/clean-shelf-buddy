// src/types/equipment.ts
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

// NOVA INTERFACE: Adicionado parent_item_id para o agrupamento
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
  parent_item_id: string | null; // Novo campo para agrupar itens
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
    can_manage_stock: boolean;
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

// Interface para dados de retirada
export interface WithdrawalData {
  item_id: string;
  quantity: number;
  reason: string;
  responsible: string;
}

// Nova interface para o histórico de estoque
export interface StockHistory {
  id: string;
  item_id: string;
  change: number; // Quantidade positiva (entrada) ou negativa (saída)
  reason: string | null;
  responsible_by: string;
  created_at: string;
}