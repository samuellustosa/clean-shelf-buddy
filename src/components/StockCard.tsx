import { StockItem, UserProfile } from '@/types/equipment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface StockCardProps {
  item: StockItem;
  onEdit: (item: StockItem) => void;
  onDelete: (id: string) => void;
  onWithdraw: (item: StockItem) => void;
  userPermissions: UserProfile['permissions'] | null;
}

export const StockCard: React.FC<StockCardProps> = ({
  item,
  onEdit,
  onDelete,
  onWithdraw,
  userPermissions,
}) => {
  const { toast } = useToast();

  const handleEditClick = () => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    onEdit(item);
  };

  const handleDeleteClick = () => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para deletar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    onDelete(item.id);
  };
  
  const handleWithdrawClick = () => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para retirar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    onWithdraw(item);
  };

  const getStatusBadge = () => {
    let variant: "default" | "destructive" | "secondary" | "outline" | null = "default";
    let colorClass = "";
    let text = "";

    switch (item.maintenance_status) {
      case 'ok':
        variant = "default";
        colorClass = "bg-success text-success-foreground hover:bg-success/80";
        text = "Em Estoque";
        break;
      case 'low_stock':
        variant = "default";
        colorClass = "bg-warning text-warning-foreground hover:bg-warning/80";
        text = "Estoque Baixo";
        break;
      case 'out_of_stock':
        variant = "destructive";
        colorClass = "bg-destructive text-destructive-foreground hover:bg-destructive/80";
        text = "Esgotado";
        break;
      case 'in_maintenance':
        variant = "secondary";
        colorClass = "bg-muted text-muted-foreground";
        text = "Em Manutenção";
        break;
      case 'defective':
        variant = "destructive";
        colorClass = "bg-destructive text-destructive-foreground hover:bg-destructive/80";
        text = "Com Defeito";
        break;
      default:
        variant = "outline";
        text = "Desconhecido";
    }

    return (
      <Badge variant={variant} className={cn(colorClass)}>
        {text}
      </Badge>
    );
  };

  const getCardClassName = () => {
    let borderClass = "border-l-4 ";
    switch (item.maintenance_status) {
        case 'ok':
          borderClass += "border-success bg-success/15";
          break;
        case 'low_stock':
          borderClass += "border-warning bg-warning/40";
          break;
        case 'out_of_stock':
        case 'defective':
          borderClass += "border-destructive bg-destructive/40";
          break;
        case 'in_maintenance':
          borderClass += "border-muted-foreground bg-muted/20";
          break;
        default:
          borderClass += "border-gray-500";
          break;
    }
    return cn("mb-4", borderClass);
  };

  const getStockQuantityBadge = () => {
    let colorClass = "bg-success text-success-foreground";
    if (item.current_quantity <= item.minimum_stock && item.current_quantity > 0) {
      colorClass = "bg-warning text-warning-foreground";
    } else if (item.current_quantity === 0) {
      colorClass = "bg-destructive text-destructive-foreground";
    }
    return (
      <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-bold", colorClass)}>
        {item.current_quantity}
      </span>
    );
  };

  return (
    <Card className={getCardClassName()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          {getStatusBadge()}
        </div>
        <div className="text-sm text-muted-foreground flex justify-between">
          <span>Categoria: {item.category}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm flex justify-between">
            <span className="font-bold">Em estoque:</span>
            {getStockQuantityBadge()}
          </div>
          <div className="text-sm flex justify-between">
            <span className="font-bold">Estoque Mínimo:</span>
            <Badge variant="secondary" className="font-bold">{item.minimum_stock}</Badge>
          </div>
          <div className="text-sm">
            <span className="font-bold">Localização:</span>{' '}
            {item.location}
          </div>
          {item.asset_number && (
            <div className="text-sm">
              <span className="font-bold">Nº de Patrimônio:</span>{' '}
              {item.asset_number}
            </div>
          )}
        </div>
        <div className="flex justify-between gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleWithdrawClick}
            className="w-full"
            disabled={item.current_quantity === 0}
          >
            <Minus className="h-4 w-4 mr-2" /> Retirar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEditClick}
            className="w-full"
          >
            <Pencil className="h-4 w-4 mr-2" /> Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground w-full"
                onClick={() => handleDeleteClick()}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Deletar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso irá remover permanentemente o item de estoque "{item.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(item.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};