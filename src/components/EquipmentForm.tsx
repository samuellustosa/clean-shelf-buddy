import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Equipment } from '@/types/equipment';

interface EquipmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => void;
  equipment?: Equipment;
  mode: 'create' | 'edit';
  uniqueSectors: string[];
  uniqueResponsibles: string[];
}

// Função para obter a data local no formato YYYY-MM-DD
const getLocalDateISO = () => {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; // offset em milissegundos
  return (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
};

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipment,
  mode,
  uniqueSectors,
  uniqueResponsibles,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    responsible: '',
    periodicity: 7,
    last_cleaning: getLocalDateISO()
  });

  useEffect(() => {
    if (mode === 'edit' && equipment) {
      setFormData({
        name: equipment.name,
        sector: equipment.sector,
        responsible: equipment.responsible,
        periodicity: equipment.periodicity,
        last_cleaning: equipment.last_cleaning || getLocalDateISO()
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        sector: '',
        responsible: '',
        periodicity: 7,
        last_cleaning: getLocalDateISO()
      });
    }
  }, [equipment, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      last_cleaning: formData.last_cleaning
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'periodicity' ? parseInt(value) || 0 : value
    }));
  };
  
  const handleSelectChange = (key: 'sector' | 'responsible', value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
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
              onChange={handleChange}
              placeholder="Ex: PDV 00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sector">Setor</Label>
            <Select
              value={formData.sector}
              onValueChange={(value) => handleSelectChange('sector', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
              <SelectContent>
                {uniqueSectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Select
              value={formData.responsible}
              onValueChange={(value) => handleSelectChange('responsible', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {uniqueResponsibles.map(responsible => (
                  <SelectItem key={responsible} value={responsible}>{responsible}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="periodicity">Periodicidade (dias)</Label>
            <Input
              id="periodicity"
              type="number"
              min="1"
              value={formData.periodicity}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_cleaning">Data da Última Limpeza</Label>
            <Input
              id="last_cleaning"
              type="date"
              value={formData.last_cleaning}
              onChange={handleChange}
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