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
    let colorClass = "";
    let text = "";
    let icon = null;

    switch (item.maintenance_status) {
      case 'ok':
        colorClass = "bg-success hover:bg-success/80 text-success-foreground";
        text = "Em Estoque";
        icon = <Box className="h-4 w-4" />;
        break;
      case 'low_stock':
        colorClass = "bg-warning hover:bg-warning/80 text-warning-foreground";
        text = "Estoque Baixo";
        icon = <AlertCircle className="h-4 w-4" />;
        break;
      case 'out_of_stock':
        colorClass = "bg-destructive hover:bg-destructive/80 text-destructive-foreground";
        text = "Esgotado";
        icon = <XCircle className="h-4 w-4" />;
        break;
      case 'in_maintenance':
        colorClass = "bg-muted text-muted-foreground";
        text = "Em Manutenção";
        icon = <Wrench className="h-4 w-4" />;
        break;
      case 'defective':
        colorClass = "bg-destructive hover:bg-destructive/80 text-destructive-foreground";
        text = "Com Defeito";
        icon = <Trash2 className="h-4 w-4" />;
        break;
      default:
        colorClass = "border text-foreground";
        text = "Desconhecido";
    }

    return (
      <Badge className={cn("flex items-center gap-1 text-sm md:text-base", colorClass)}>
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
      <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-sm font-bold", colorClass)}>
        {item.current_quantity}
      </span>
    );
  };

  if (isMobile) {
    return (
      <div className="space-y-2">
        {stock.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm md:text-base">
            Nenhum item de estoque encontrado!
          </div>
        ) : (
          stock.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "p-4 border rounded-lg space-y-2",
                index % 2 === 0 ? "bg-blue-50/50 dark:bg-slate-800/50" : "bg-card"
              )}
            >
              <div className="flex justify-between items-center text-base md:text-lg">
                <span className="font-bold">{item.name}</span>
                {getStatusBadge(item)}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estoque:</span>
                {getStockQuantityBadge(item)}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mínimo:</span>
                <span className="font-bold">{item.minimum_stock}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Localização:</span>
                <span className="font-bold">{item.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Patrimônio:</span>
                <span className="font-bold">{item.asset_number || 'N/A'}</span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onWithdraw(item)}
                  disabled={item.current_quantity === 0}
                  className="w-1/3 h-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditClick(item)}
                  className="w-1/3 h-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground w-1/3 h-8"
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
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg font-semibold">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold px-4 text-sm md:text-base w-48">Item</TableHead>
            <TableHead className="font-bold px-4 text-sm md:text-base hidden lg:table-cell">Categoria</TableHead>
            <TableHead className="font-bold px-4 text-sm md:text-base text-center w-24">Estoque</TableHead>
            <TableHead className="font-bold px-4 text-sm md:text-base text-center w-24">Mínimo</TableHead>
            <TableHead className="font-bold px-4 text-sm md:text-base hidden lg:table-cell">Localização</TableHead>
            <TableHead className="font-bold px-4 text-sm md:text-base">Patrimônio</TableHead>
            <TableHead className="font-bold px-4 text-sm md:text-base text-center w-32">Status</TableHead>
            <TableHead className="text-right font-bold px-4 text-sm md:text-base">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stock.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm md:text-base">
                Nenhum item de estoque encontrado!
              </TableCell>
            </TableRow>
          ) : (
            stock.map((item, index) => (
              <TableRow
                key={item.id}
                className={cn(
                  "transition-colors hover:bg-muted/50",
                  index % 2 === 0 ? "bg-blue-50/50 dark:bg-slate-800/50" : "bg-card"
                )}
              >
                <TableCell className="font-bold px-4 text-sm md:text-base">{item.name}</TableCell>
                <TableCell className="px-4 text-sm md:text-base hidden lg:table-cell">{item.category}</TableCell>
                <TableCell className="text-center px-4">
                  {getStockQuantityBadge(item)}
                </TableCell>
                <TableCell className="text-center px-4">
                  <span className="inline-flex items-center rounded-md px-2 py-1 text-sm font-bold bg-muted">
                    {item.minimum_stock}
                  </span>
                </TableCell>
                <TableCell className="px-4 text-sm md:text-base hidden lg:table-cell">{item.location}</TableCell>
                <TableCell className="px-4 text-sm md:text-base">{item.asset_number || 'N/A'}</TableCell>
                <TableCell className="text-center px-4 text-sm md:text-base">{getStatusBadge(item)}</TableCell>
                <TableCell className="text-right px-4">
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
  );
};