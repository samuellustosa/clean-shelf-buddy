import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Equipment } from '@/types/equipment';

interface EquipmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (equipment: Omit<Equipment, 'id' | 'createdAt'>) => void;
  equipment?: Equipment;
  mode: 'create' | 'edit';
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipment,
  mode,
}) => {
  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    sector: equipment?.sector || '',
    responsible: equipment?.responsible || '',
    periodicity: equipment?.periodicity || 7,
    lastCleaning: equipment?.lastCleaning ? equipment.lastCleaning.split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      sector: formData.sector,
      responsible: formData.responsible,
      periodicity: formData.periodicity,
      lastCleaning: new Date(formData.lastCleaning).toISOString(),
    });
    onClose();
    setFormData({
      name: '',
      sector: '',
      responsible: '',
      periodicity: 7,
      lastCleaning: new Date().toISOString().split('T')[0],
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Adicionar Equipamento' : 'Editar Equipamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Equipamento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Freezer Vertical"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sector">Setor</Label>
            <Input
              id="sector"
              value={formData.sector}
              onChange={(e) => handleChange('sector', e.target.value)}
              placeholder="Ex: Congelados"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Input
              id="responsible"
              value={formData.responsible}
              onChange={(e) => handleChange('responsible', e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="periodicity">Periodicidade (dias)</Label>
            <Input
              id="periodicity"
              type="number"
              min="1"
              value={formData.periodicity}
              onChange={(e) => handleChange('periodicity', parseInt(e.target.value))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastCleaning">Data da Última Limpeza</Label>
            <Input
              id="lastCleaning"
              type="date"
              value={formData.lastCleaning}
              onChange={(e) => handleChange('lastCleaning', e.target.value)}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Criar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};