import { useState, useEffect } from 'react';
import { useEquipment } from '@/hooks/useEquipment';
import { useEquipmentFilters } from '@/hooks/useEquipmentFilters';
import { Equipment } from '@/types/equipment';
import { EquipmentTable } from '@/components/EquipmentTable';
import { EquipmentForm } from '@/components/EquipmentForm';
import { HistoryModal } from '@/components/HistoryModal';
import { AdvancedFilters } from '@/components/AdvancedFilters';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const {
    equipment,
    loading,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    markAsCleaned,
    getEquipmentHistory,
  } = useEquipment();

  const {
    filters,
    setFilters,
    filteredEquipment,
    uniqueSectors,
    uniqueResponsibles,
    clearFilters
  } = useEquipmentFilters(equipment);

  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handleCreateEquipment = () => {
    setEditingEquipment(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleSubmitEquipment = (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
    if (formMode === 'create') {
      addEquipment(equipmentData);
    } else if (editingEquipment) {
      updateEquipment(editingEquipment.id, equipmentData);
    }
  };

  const handleDeleteEquipment = (id: string) => {
    deleteEquipment(id);
  };

  const handleMarkCleaned = (id: string) => {
    markAsCleaned(id);
  };

  const handleViewHistory = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsHistoryOpen(true);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const equipmentHistory = selectedEquipment 
    ? getEquipmentHistory(selectedEquipment.id)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-primary" />
              Checklist de Limpeza
            </h1>
            <p className="text-muted-foreground mt-2">
              Controle de limpeza de equipamentos do supermercado
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <Button variant="outline" asChild>
                <Link to="/auth">Entrar</Link>
              </Button>
            ) : (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Conectado: {userEmail ?? 'Usuário'}
                </span>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    toast({ title: 'Você saiu.' });
                  }}
                >
                  Sair
                </Button>
              </>
            )}
            <Button onClick={handleCreateEquipment} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Equipamento
            </Button>
          </div>
        </div>

        <AdvancedFilters
          filters={filters}
          setFilters={setFilters}
          uniqueSectors={uniqueSectors}
          uniqueResponsibles={uniqueResponsibles}
          clearFilters={clearFilters}
          isOpen={isFiltersOpen}
          onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
        />

        <EquipmentTable
          equipment={filteredEquipment}
          onEdit={handleEditEquipment}
          onDelete={handleDeleteEquipment}
          onMarkCleaned={handleMarkCleaned}
          onViewHistory={handleViewHistory}
        />

        <EquipmentForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitEquipment}
          equipment={editingEquipment}
          mode={formMode}
        />

        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          equipment={selectedEquipment}
          history={equipmentHistory}
        />
      </div>
    </div>
  );
};

export default Index;
