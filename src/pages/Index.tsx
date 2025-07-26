import { useState } from 'react';
import { useEquipment } from '@/hooks/useEquipment';
import { Equipment } from '@/types/equipment';
import { EquipmentTable } from '@/components/EquipmentTable';
import { EquipmentForm } from '@/components/EquipmentForm';
import { HistoryModal } from '@/components/HistoryModal';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const {
    equipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    markAsCleaned,
    getEquipmentHistory,
  } = useEquipment();

  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

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

  const handleSubmitEquipment = (equipmentData: Omit<Equipment, 'id' | 'createdAt'>) => {
    if (formMode === 'create') {
      addEquipment(equipmentData);
      toast({
        title: "Equipamento criado",
        description: "O equipamento foi adicionado com sucesso.",
      });
    } else if (editingEquipment) {
      updateEquipment(editingEquipment.id, equipmentData);
      toast({
        title: "Equipamento atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    }
  };

  const handleDeleteEquipment = (id: string) => {
    deleteEquipment(id);
    toast({
      title: "Equipamento removido",
      description: "O equipamento foi excluído do sistema.",
    });
  };

  const handleMarkCleaned = (id: string) => {
    markAsCleaned(id);
    toast({
      title: "Limpeza registrada",
      description: "A limpeza foi marcada como concluída.",
    });
  };

  const handleViewHistory = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsHistoryOpen(true);
  };

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
          <Button onClick={handleCreateEquipment} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Equipamento
          </Button>
        </div>

        <EquipmentTable
          equipment={equipment}
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
