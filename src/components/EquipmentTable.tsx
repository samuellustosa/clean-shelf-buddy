import { Equipment, UserProfile } from '@/types/equipment';
import { getEquipmentStatus, getDaysUntilNextCleaning, formatDate } from '@/utils/equipmentUtils';
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
import { Pencil, Trash2, CheckCircle, Eye, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { EquipmentCard } from './EquipmentCard';
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

interface EquipmentTableProps {
  equipment: Equipment[];
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
  onMarkCleaned: (id: string) => void;
  onViewHistory: (equipment: Equipment) => void;
  userPermissions: UserProfile['permissions'] | null;
}

export const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipment,
  onEdit,
  onDelete,
  onMarkCleaned,
  onViewHistory,
  userPermissions,
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleEditClick = (item: Equipment) => {
    if (!userPermissions?.can_edit) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar equipamentos.",
        variant: "destructive"
      });
      return;
    }
    onEdit(item);
  };

  const handleDeleteClick = (id: string) => {
    if (!userPermissions?.can_delete) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para deletar equipamentos.",
        variant: "destructive"
      });
      return;
    }
    onDelete(id);
  };
  
  const handleMarkCleanedClick = (id: string) => {
    if (!userPermissions?.can_add) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para registrar limpezas.",
        variant: "destructive"
      });
      return;
    }
    onMarkCleaned(id);
  };

  const getStatusBadge = (equipment: Equipment) => {
    const status = getEquipmentStatus(equipment);
    const daysUntil = getDaysUntilNextCleaning(equipment);

    if (status === 'ok') {
      return (
        <Badge className="bg-success hover:bg-success/80 text-success-foreground">
          Em dia ({daysUntil > 0 ? `${daysUntil} dias` : 'hoje'})
        </Badge>
      );
    } else if (status === 'warning') {
      return (
        <Badge className="bg-warning hover:bg-warning/80 text-warning-foreground">
          Prazo finalizando (1 dia)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-destructive hover:bg-destructive/80 text-destructive-foreground">
          Atrasado ({Math.abs(daysUntil)} dias)
        </Badge>
      );
    }
  };

  const getRowClassName = (equipment: Equipment) => {
    const status = getEquipmentStatus(equipment);
    return cn(
      "transition-colors hover:bg-muted/50 border-b border-gray-500",
      status === 'ok' ? "bg-success/15" : status === 'warning' ? "bg-warning/40" : "bg-destructive/40"
    );
  };

  return (
    <>
      {isMobile ? (
        <div className="space-y-4">
          {equipment.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum equipamento encontrado!
            </div>
          ) : (
            equipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onMarkCleaned={handleMarkCleanedClick}
                onViewHistory={onViewHistory}
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
                <TableHead className="font-bold">Equipamento</TableHead>
                <TableHead className="font-bold">Setor</TableHead>
                <TableHead className="font-bold">Responsável</TableHead>
                <TableHead className="font-bold">Periodicidade</TableHead>
                <TableHead className="font-bold">Última Limpeza</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum equipamento encontrado!
                  </TableCell>
                </TableRow>
              ) : (
                equipment.map((item) => (
                  <TableRow key={item.id} className={getRowClassName(item)}>
                    <TableCell className="font-bold">{item.name}</TableCell>
                    <TableCell>{item.sector}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground font-bold")}>
                        {item.responsible}
                      </span>
                    </TableCell>
                    <TableCell>{item.periodicity} dias</TableCell>
                    <TableCell>{formatDate(item.last_cleaning)}</TableCell>
                    <TableCell>{getStatusBadge(item)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-success hover:bg-success/80 text-success-foreground border-success"
                              onClick={() => handleMarkCleanedClick(item.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle>
                              <AlertDialogDescription>
                                Você tem certeza que deseja marcar "{item.name}" como limpo? Esta ação irá registrar a data de hoje como a última limpeza.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onMarkCleaned(item.id)}>Confirmar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewHistory(item)}
                        >
                          <Eye className="h-4 w-4" />
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
                                Esta ação não pode ser desfeita. Isso irá remover permanentemente o equipamento "{item.name}" e todo o seu histórico de limpeza.
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