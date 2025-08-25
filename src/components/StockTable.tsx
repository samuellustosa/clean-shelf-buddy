import * as React from 'react';
import { StockItem, UserProfile } from '@/types/equipment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Box, Wrench, AlertCircle, XCircle, Minus, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { StockCard } from '@/components/StockCard';

interface StockTableProps {
  parentItems: StockItem[];
  childItems: StockItem[];
  onEdit: (item: StockItem) => void;
  onDelete: (id: string) => void;
  onWithdraw: (item: StockItem) => void;
  onAddChild: (parentId: string) => void;
  userPermissions: UserProfile['permissions'] | null;
}

export const StockTable: React.FC<StockTableProps> = ({
  parentItems,
  childItems,
  onEdit,
  onDelete,
  onWithdraw,
  onAddChild,
  userPermissions,
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [expandedParents, setExpandedParents] = React.useState<Set<string>>(new Set());

  const toggleExpand = (parentId: string) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  const handleEditClick = (item: StockItem) => {
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

  const getStatusBadge = (item: StockItem) => {
    let colorClass = "";
    let text = "";
    let icon = null;

    switch (item.maintenance_status) {
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

  const getStockQuantityBadge = (item: StockItem) => {
    let colorClass = "bg-success/50 text-success-foreground";
    if (item.current_quantity <= item.minimum_stock && item.current_quantity > 0) {
      colorClass = "bg-warning/50 text-warning-foreground";
    } else if (item.current_quantity === 0) {
      colorClass = "bg-destructive/50 text-destructive-foreground";
    }
    return (
      <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-bold", colorClass)}>
        {item.current_quantity}
      </span>
    );
  };

  const renderActions = (item: StockItem) => {
    const hasChildren = childItems.some(c => c.parent_item_id === item.id);
    const isStandaloneItem = !item.parent_item_id && !hasChildren;
    const isChildItem = !!item.parent_item_id;
    const isExpandableParent = !item.parent_item_id && hasChildren;

    return (
      <div className="flex justify-end gap-2">
        {isExpandableParent && userPermissions?.can_manage_stock && (
           <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); handleAddChildClick(item.id); }}
            title="Adicionar Sub-Item"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
        {(isStandaloneItem || isChildItem) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onWithdraw(item)}
            disabled={item.current_quantity === 0}
          >
            <Minus className="h-3 w-3" />
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEditClick(item)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                if (!userPermissions?.can_manage_stock) {
                  toast({
                    title: "Permissão negada",
                    description: "Você não tem permissão para deletar itens de estoque.",
                    variant: "destructive"
                  });
                }
              }}
              disabled={!userPermissions?.can_manage_stock}
            >
              <Trash2 className="h-3 w-3" />
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
                onClick={() => handleDeleteClick(item.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  const renderRow = (item: StockItem, index: number, isChildRow = false, parentIndex?: number, childIndex?: number) => {
    const hasChildren = childItems.some(c => c.parent_item_id === item.id);
    const isExpandableParent = !item.parent_item_id && hasChildren;
    const isExpanded = isExpandableParent && expandedParents.has(item.id);
    const isStandaloneItem = !item.parent_item_id && !hasChildren;

    return (
      <TableRow
        key={item.id}
        className={cn(
          "transition-colors hover:bg-muted/50",
          {
            "bg-blue-50/50 dark:bg-slate-800/50": !isChildRow && index % 2 === 0,
            "bg-card": !isChildRow && index % 2 !== 0,
            "bg-muted/30": isChildRow,
            "font-bold": isExpandableParent,
          }
        )}
      >
        <TableCell className="font-bold px-4 text-sm w-12">
          {isChildRow ? `${parentIndex}.${childIndex}` : index + 1}
        </TableCell>
        <TableCell className={cn("px-4 text-sm w-48", { "pl-16": isChildRow })}>
          <div className="flex items-center gap-2">
            {isExpandableParent && (
              <ChevronRight
                className={cn("h-3 w-3 transition-transform duration-200 cursor-pointer", { "rotate-90": isExpanded })}
                onClick={() => toggleExpand(item.id)}
              />
            )}
            {item.name}
          </div>
        </TableCell>
        <TableCell className="px-4 text-sm hidden lg:table-cell">{item.category}</TableCell>
        <TableCell className="text-center px-4">
          {getStockQuantityBadge(item)}
        </TableCell>
        <TableCell className="text-center px-4">
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-bold bg-muted">
            {isExpandableParent ? '-' : item.minimum_stock}
          </span>
        </TableCell>
        <TableCell className="px-4 text-sm hidden lg:table-cell">
          {isExpandableParent ? '-' : item.location}
        </TableCell>
        <TableCell className="px-4 text-sm">
          {isExpandableParent ? '-' : item.asset_number || 'N/A'}
        </TableCell>
        <TableCell className="text-center px-4 text-sm">
          {isExpandableParent ? '-' : getStatusBadge(item)}
        </TableCell>
        <TableCell className="text-right px-4">
          {renderActions(item)}
        </TableCell>
      </TableRow>
    );
  };

  const renderTableBody = () => {
    if (parentItems.length === 0 && childItems.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
            Nenhum item de estoque encontrado!
          </TableCell>
        </TableRow>
      );
    }
    
    let rows: React.ReactNode[] = [];
    parentItems.forEach((item, index) => {
      rows.push(renderRow(item, index));
      const hasChildren = childItems.some(c => c.parent_item_id === item.id);
      const isExpanded = hasChildren && expandedParents.has(item.id);

      if (isExpanded) {
        const childItemsForParent = childItems.filter(c => c.parent_item_id === item.id);
        childItemsForParent.forEach((child, childIndex) => {
          rows.push(renderRow(child, childIndex, true, index + 1, childIndex + 1));
        });
      }
    });

    return rows;
  };

  if (isMobile) {
    return (
      <div className="space-y-2">
        {parentItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum item de estoque encontrado!
          </div>
        ) : (
          parentItems.map((item) => {
            const childItemsForParent = childItems.filter(c => c.parent_item_id === item.id);
            return <StockCard
              key={item.id}
              item={item}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onWithdraw={onWithdraw}
              userPermissions={userPermissions}
              childItems={childItemsForParent}
              onAddChild={handleAddChildClick}
            />;
          })
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg font-semibold">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold px-4 text-xs w-12">Nº</TableHead>
            <TableHead className="font-bold px-4 text-xs w-48">Item</TableHead>
            <TableHead className="font-bold px-4 text-xs hidden lg:table-cell">Categoria</TableHead>
            <TableHead className="font-bold px-4 text-xs text-center w-24">Estoque</TableHead>
            <TableHead className="font-bold px-4 text-xs text-center w-24">Mínimo</TableHead>
            <TableHead className="font-bold px-4 text-xs hidden lg:table-cell">Localização</TableHead>
            <TableHead className="font-bold px-4 text-xs">Patrimônio</TableHead>
            <TableHead className="font-bold px-4 text-xs text-center w-32">Status</TableHead>
            <TableHead className="text-right font-bold px-4 text-xs">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderTableBody()}
        </TableBody>
      </Table>
    </div>
  );
};