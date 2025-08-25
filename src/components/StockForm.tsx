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
        name: item.name.toUpperCase(),
        category: item.category.toUpperCase(),
        current_quantity: item.current_quantity,
        minimum_stock: item.minimum_stock,
        location: item.location.toUpperCase(),
        asset_number: item.asset_number?.toUpperCase() || '',
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
      [id]: (type === 'number') ? parseInt(value) || 0 : value.toUpperCase()
    }));
  };
  
  const handleSelectChange = (key: 'category' | 'parent_item_id' | 'maintenance_status', value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const categories = ['Periféricos', 'Toners', 'Cabos', 'Equipamentos', 'Outros'].map(c => c.toUpperCase());
  
  const maintenanceStatusMap = {
    ok: 'Em estoque',
    in_maintenance: 'Em manutenção',
    defective: 'Com defeito'
  };

  const maintenanceStatusOptions = ['in_maintenance', 'defective'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'ADICIONAR ITEM DE ESTOQUE' : 'EDITAR ITEM DE ESTOQUE'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">NOME DO ITEM</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: MOUSE ÓPTICO"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">CATEGORIA</Label>
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
              <Label htmlFor="current_quantity">QUANTIDADE EM ESTOQUE</Label>
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
              <Label htmlFor="minimum_stock">ESTOQUE MÍNIMO</Label>
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
            <Label htmlFor="location">LOCALIZAÇÃO</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: ARMÁRIO 1, GAVETA 2"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset_number">NÚMERO DE PATRIMÔNIO (OPCIONAL)</Label>
            <Input
              id="asset_number"
              value={formData.asset_number}
              onChange={handleChange}
              placeholder="Ex: 123456"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maintenance_status">STATUS DE MANUTENÇÃO</Label>
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
                    {maintenanceStatusMap[status as keyof typeof maintenanceStatusMap].toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="parent_item_id">ITEM PAI (AGRUPAR)</Label>
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
                      {p.name.toUpperCase()}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              CANCELAR
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'ADICIONAR' : 'SALVAR'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};