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
import { StockItem } from '@/types/equipment';

interface StockFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<StockItem, 'id' | 'created_at' | 'updated_at' | 'maintenance_status'>) => void;
  item?: StockItem;
  mode: 'create' | 'edit';
}

export const StockForm: React.FC<StockFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  mode,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    current_quantity: 0,
    minimum_stock: 0,
    location: '',
    asset_number: '',
  });

  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        name: item.name,
        category: item.category,
        current_quantity: item.current_quantity,
        minimum_stock: item.minimum_stock,
        location: item.location,
        asset_number: item.asset_number || '',
      });
    } else if (mode === 'create' && isOpen) {
      // Reseta o formulário para o estado inicial quando o modo é 'create'
      setFormData({
        name: '',
        category: '',
        current_quantity: 0,
        minimum_stock: 0,
        location: '',
        asset_number: '',
      });
    }
  }, [item, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: (type === 'number') ? parseInt(value) || 0 : value
    }));
  };
  
  const handleSelectChange = (key: 'category', value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Valores de exemplo para categorias. Em uma aplicação real, estes viriam do banco de dados.
  const categories = ['Periféricos', 'Toners', 'Cabos', 'Equipamentos', 'Outros'];
  const maintenanceStatusOptions = ['ok', 'low_stock', 'out_of_stock', 'in_maintenance', 'defective'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Adicionar Item de Estoque' : 'Editar Item de Estoque'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Item</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Mouse Óptico"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_quantity">Quantidade em Estoque</Label>
              <Input
                id="current_quantity"
                type="number"
                min="0"
                value={formData.current_quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Estoque Mínimo</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                value={formData.minimum_stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Armário 1, Gaveta 2"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset_number">Número de Patrimônio (Opcional)</Label>
            <Input
              id="asset_number"
              value={formData.asset_number}
              onChange={handleChange}
              placeholder="Ex: 123456"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Adicionar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};