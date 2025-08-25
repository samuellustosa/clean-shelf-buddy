import { StockItem, UserProfile } from '@/types/equipment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Minus, ChevronRight, Plus, Box, Wrench, AlertCircle, XCircle } from 'lucide-react';
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
import { useState } from 'react';

interface StockCardProps {
  item: StockItem;
  onEdit: (item: StockItem) => void;
  onDelete: (id: string) => void;
  onWithdraw: (item: StockItem) => void;
  onAddChild: (parentId: string) => void;
  userPermissions: UserProfile['permissions'] | null;
  childItems: StockItem[];
}

export const StockCard: React.FC<StockCardProps> = ({
  item,
  onEdit,
  onDelete,
  onWithdraw,
  onAddChild,
  userPermissions,
  childItems,
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = childItems.length > 0;
  const isParent = !item.parent_item_id && hasChildren;
  const isStandaloneItem = !item.parent_item_id && !hasChildren;
  const isChildItem = !!item.parent_item_id;
  const shouldShowDetails = isStandaloneItem || isChildItem;

  const handleEditClick = (stockItem: StockItem) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    onEdit(stockItem);
  };

  const handleDeleteClick = (id: string) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para deletar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    onDelete(id);
  };
  
  const handleWithdrawClick = (stockItem: StockItem) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para retirar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    onWithdraw(stockItem);
  };
  
  const handleAddChildClick = (parentId: string) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para adicionar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    onAddChild(parentId);
  };

  const getStatusBadge = (status: string) => {
    let colorClass = "";
    let text = "";
    let icon = null;

    switch (status) {
      case 'ok':
        colorClass = "bg-success hover:bg-success/80 text-success-foreground";
        text = "Em Estoque";
        icon = <Box className="h-3 w-3" />;
        break;
      case 'low_stock':
        colorClass = "bg-warning hover:bg-warning/80 text-warning-foreground";
        text = "Estoque Baixo";
        icon = <AlertCircle className="h-3 w-3" />;
        break;
      case 'out_of_stock':
        colorClass = "bg-destructive hover:bg-destructive/80 text-destructive-foreground";
        text = "Esgotado";
        icon = <XCircle className="h-3 w-3" />;
        break;
      case 'in_maintenance':
        colorClass = "bg-muted text-muted-foreground";
        text = "Em Manutenção";
        icon = <Wrench className="h-3 w-3" />;
        break;
      case 'defective':
        colorClass = "bg-destructive hover:bg-destructive/80 text-destructive-foreground";
        text = "Com Defeito";
        icon = <Trash2 className="h-3 w-3" />;
        break;
      default:
        colorClass = "border text-foreground";
        text = "Desconhecido";
    }

    return (
      <Badge className={cn("flex items-center gap-1 text-xs whitespace-nowrap px-2 py-1", colorClass)}>
        {icon}
        {text}
      </Badge>
    );
  };

  const getStockQuantityBadge = (stockItem: StockItem) => {
    let colorClass = "bg-success text-success-foreground";
    if (stockItem.current_quantity <= stockItem.minimum_stock && stockItem.current_quantity > 0) {
      colorClass = "bg-warning text-warning-foreground";
    } else if (stockItem.current_quantity === 0) {
      colorClass = "bg-destructive text-destructive-foreground";
    }
    return (
      <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-bold", colorClass)}>
        {stockItem.current_quantity}
      </span>
    );
  };

  const renderItemDetails = (stockItem: StockItem, isChild = false) => {
    const hasChildrenInDetails = childItems.some(c => c.parent_item_id === stockItem.id);
    const isExpandableParentInDetails = !stockItem.parent_item_id && hasChildrenInDetails;
    const isStandaloneItem = !stockItem.parent_item_id && !hasChildrenInDetails;
    const isChildItem = !!stockItem.parent_item_id;
    const shouldShowDetails = isStandaloneItem || isChildItem;
  
    return (
      <div key={stockItem.id} className={cn(
        "p-4 border rounded-lg space-y-2",
        isChild ? "bg-muted/30" : "bg-card",
        isChild && "ml-4"
      )}>
        <div className="flex justify-between items-center text-sm">
          <span className="font-bold flex items-center gap-2">
            {isExpandableParentInDetails && (
              <ChevronRight
                className={cn("h-3 w-3 transition-transform duration-200 cursor-pointer", { "rotate-90": isExpanded })}
                onClick={() => setIsExpanded(!isExpanded)}
              />
            )}
            {stockItem.name}
          </span>
          {shouldShowDetails && getStatusBadge(stockItem.maintenance_status)}
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Estoque:</span>
          {getStockQuantityBadge(stockItem)}
        </div>
        {shouldShowDetails && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Mínimo:</span>
              <span className="font-bold">{stockItem.minimum_stock}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Localização:</span>
              <span className="font-bold">{stockItem.location}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Patrimônio:</span>
              <span className="font-bold">{stockItem.asset_number || 'N/A'}</span>
            </div>
          </>
        )}
        <div className="flex justify-end gap-2 mt-4">
          {isExpandableParentInDetails && userPermissions?.can_manage_stock && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAddChildClick(stockItem.id)}
              title="Adicionar Sub-Item"
              className="w-1/3 h-7"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
          {shouldShowDetails && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleWithdrawClick(stockItem)}
              disabled={stockItem.current_quantity === 0}
              className={cn("h-7", isParent ? "w-1/3" : "w-1/2")}
            >
              <Minus className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditClick(stockItem)}
            className={cn("h-7", isParent ? "w-1/3" : "w-1/2")}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className={cn("text-destructive hover:bg-destructive hover:text-destructive-foreground h-7", isParent ? "w-1/3" : "w-1/2")}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso irá remover permanentemente o item de estoque "{stockItem.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteClick(stockItem.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {renderItemDetails(item)}
      {isExpanded && childItems.map(child => renderItemDetails(child, true))}
    </>
  );
};