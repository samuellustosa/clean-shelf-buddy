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
import { Pencil, Trash2, Box, Wrench, AlertCircle, XCircle, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { StockCard } from './StockCard';
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

interface StockTableProps {
  stock: StockItem[];
  onEdit: (item: StockItem) => void;
  onDelete: (id: string) => void;
  onWithdraw: (item: StockItem) => void;
  userPermissions: UserProfile['permissions'] | null;
}

export const StockTable: React.FC<StockTableProps> = ({
  stock,
  onEdit,
  onDelete,
  onWithdraw,
  userPermissions,
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

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
    let variant: "default" | "destructive" | "secondary" | "outline" | null = "default";
    let colorClass = "";
    let text = "";
    let icon = null;

    switch (item.maintenance_status) {
      case 'ok':
        variant = "default";
        colorClass = "bg-success hover:bg-success/80 text-success-foreground";
        text = "Em Estoque";
        icon = <Box className="h-4 w-4" />;
        break;
      case 'low_stock':
        variant = "default";
        colorClass = "bg-warning hover:bg-warning/80 text-warning-foreground";
        text = "Estoque Baixo";
        icon = <AlertCircle className="h-4 w-4" />;
        break;
      case 'out_of_stock':
        variant = "destructive";
        colorClass = "bg-destructive hover:bg-destructive/80 text-destructive-foreground";
        text = "Esgotado";
        icon = <XCircle className="h-4 w-4" />;
        break;
      case 'in_maintenance':
        variant = "secondary";
        colorClass = "bg-muted text-muted-foreground";
        text = "Em Manutenção";
        icon = <Wrench className="h-4 w-4" />;
        break;
      case 'defective':
        variant = "destructive";
        colorClass = "bg-destructive text-destructive-foreground hover:bg-destructive/80";
        text = "Com Defeito";
        icon = <Trash2 className="h-4 w-4" />;
        break;
      default:
        variant = "outline";
        text = "Desconhecido";
    }

    return (
      <Badge variant={variant} className={cn("flex items-center gap-1", colorClass)}>
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

  return (
    <>
      {isMobile ? (
        <div className="space-y-4">
          {stock.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum item de estoque encontrado!
            </div>
          ) : (
            stock.map((item) => (
              <StockCard
                key={item.id}
                item={item}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onWithdraw={() => onWithdraw(item)}
                userPermissions={userPermissions}
              />
            ))
          )}
        </div>
      ) : (
        <div className="border rounded-lg font-semibold">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Item</TableHead>
                <TableHead className="font-bold">Categoria</TableHead>
                <TableHead className="font-bold text-center">Estoque</TableHead>
                <TableHead className="font-bold text-center">Estoque Mínimo</TableHead>
                <TableHead className="font-bold">Localização</TableHead>
                <TableHead className="font-bold">Patrimônio</TableHead>
                <TableHead className="font-bold text-center">Status</TableHead>
                <TableHead className="text-right font-bold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum item de estoque encontrado!
                  </TableCell>
                </TableRow>
              ) : (
                stock.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "transition-colors hover:bg-muted/50 border-b border-gray-500",
                      index % 2 === 0 ? "bg-blue-50/50 dark:bg-slate-800/50" : "bg-card"
                    )}
                  >
                    <TableCell className="font-bold">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-center">
                      {getStockQuantityBadge(item)}
                    </TableCell>
                    <TableCell className={cn("text-center font-bold")}>
                      <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-bold bg-muted")}>
                        {item.minimum_stock}
                      </span>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.asset_number || 'N/A'}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(item)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onWithdraw(item)}
                          disabled={item.current_quantity === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleDeleteClick(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};