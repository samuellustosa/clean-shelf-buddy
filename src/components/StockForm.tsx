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
import { StockItem, MaintenanceStatus } from '@/types/equipment';

interface StockFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    item: Omit<StockItem, 'id' | 'created_at' | 'updated_at' | 'maintenance_status'>,
    maintenanceStatus: MaintenanceStatus
  ) => void;
  item?: StockItem;
  mode: 'create' | 'edit';
  parentItems: StockItem[];
  initialParentId?: string | null;
}

export const StockForm: React.FC<StockFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  mode,
  parentItems,
  initialParentId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    current_quantity: 0,
    minimum_stock: 0,
    location: '',
    asset_number: '',
    parent_item_id: null as string | null,
    maintenance_status: 'ok' as MaintenanceStatus,
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
        parent_item_id: item.parent_item_id || null,
        maintenance_status: item.maintenance_status || 'ok',
      });
    } else if (mode === 'create' && isOpen) {
      setFormData({
        name: '',
        category: '',
        current_quantity: 0,
        minimum_stock: 0,
        location: '',
        asset_number: '',
        parent_item_id: initialParentId || null,
        maintenance_status: 'ok',
      });
    }
  }, [item, mode, isOpen, initialParentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { maintenance_status, ...dataWithoutStatus } = formData;
    onSubmit(dataWithoutStatus, maintenance_status);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: (type === 'number') ? parseInt(value) || 0 : value
    }));
  };
  
  const handleSelectChange = (key: 'category' | 'parent_item_id' | 'maintenance_status', value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const categories = ['Periféricos', 'Toners', 'Cabos', 'Equipamentos', 'Outros'];
  
  const maintenanceStatusMap = {
    ok: 'Em estoque',
    in_maintenance: 'Em manutenção',
    defective: 'Com defeito'
  };

  const maintenanceStatusOptions = ['in_maintenance', 'defective'];

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
          
          <div className="space-y-2">
            <Label htmlFor="maintenance_status">Status de Manutenção</Label>
            <Select
              value={formData.maintenance_status === 'ok' ? 'null' : formData.maintenance_status}
              onValueChange={(value) => handleSelectChange('maintenance_status', value === 'null' ? 'ok' as MaintenanceStatus : value as MaintenanceStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Nenhum (Em estoque)</SelectItem>
                {maintenanceStatusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {maintenanceStatusMap[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="parent_item_id">Item Pai (Agrupar)</Label>
            <Select
              value={formData.parent_item_id || "null"}
              onValueChange={(value) => handleSelectChange('parent_item_id', value === "null" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um item pai (Opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Nenhum (Item principal)</SelectItem>
                {parentItems
                  .filter(p => p.id !== item?.id)
                  .map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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