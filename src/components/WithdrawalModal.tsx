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
import { Textarea } from '@/components/ui/textarea';
import { StockItem } from '@/types/equipment';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StockItem | null;
  onWithdraw: (id: string, withdrawalData: { quantity: number; reason: string; responsible_by: string }) => void;
  uniqueResponsibles: string[];
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  item,
  onWithdraw,
  uniqueResponsibles,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [responsible, setResponsible] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setReason('');
      setResponsible('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (quantity <= 0 || quantity > item.current_quantity) {
      toast({
        title: "Erro de validação",
        description: "A quantidade deve ser maior que zero e não pode exceder o estoque atual.",
        variant: "destructive",
      });
      return;
    }
    
    if (!reason || !responsible) {
      toast({
        title: "Erro de validação",
        description: "Motivo e Responsável são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onWithdraw(item.id, { quantity, reason, responsible_by: responsible });
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Retirar Item de Estoque</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Item: <span className="font-semibold">{item.name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Estoque Atual: <span className="font-semibold">{item.current_quantity}</span>
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade a Retirar</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={item.current_quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Select
              value={responsible}
              onValueChange={(value) => setResponsible(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {uniqueResponsibles.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Utilizado para a manutenção do servidor #123"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive">
              Retirar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};