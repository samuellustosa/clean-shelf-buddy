import { Equipment, UserProfile } from '@/types/equipment';
import { getEquipmentStatus, getDaysUntilNextCleaning, formatDate } from '@/utils/equipmentUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, CheckCircle, Eye } from 'lucide-react';
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

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
  onMarkCleaned: (id: string) => void;
  onViewHistory: (equipment: Equipment) => void;
  userPermissions: UserProfile['permissions'] | null;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onEdit,
  onDelete,
  onMarkCleaned,
  onViewHistory,
  userPermissions,
}) => {
  const status = getEquipmentStatus(equipment);
  const daysUntil = getDaysUntilNextCleaning(equipment);
  const { toast } = useToast();

  const handleEditClick = () => {
    if (!userPermissions?.can_edit) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar equipamentos.",
        variant: "destructive"
      });
      return;
    }
    onEdit(equipment);
  };

  const handleDeleteClick = () => {
    if (!userPermissions?.can_delete) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para deletar equipamentos.",
        variant: "destructive"
      });
      return;
    }
    onDelete(equipment.id);
  };

  const handleMarkCleanedClick = () => {
    if (!userPermissions?.can_mark_cleaned) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para registrar limpezas.",
        variant: "destructive"
      });
      return;
    }
    onMarkCleaned(equipment.id);
  };

  const getStatusBadge = () => {
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

  const getCardClassName = () => {
    return cn(
      "mb-4 border-l-4",
      status === 'ok' && "border-success bg-success/15",
      status === 'warning' && "border-warning bg-warning/40",
      status === 'overdue' && "border-destructive bg-destructive/40"
    );
  };

  return (
    <Card className={getCardClassName()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{equipment.name}</CardTitle>
          {getStatusBadge()}
        </div>
        <div className="text-sm text-muted-foreground flex justify-between">
          <span>Setor: {equipment.sector}</span>
          <span>Periodicidade: {equipment.periodicity} dias</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Corrigido: substitui o <p> por <div> */}
          <div className="text-sm">
            <span className="font-bold">Responsável:</span>{' '}
            <Badge variant="secondary" className="font-bold">{equipment.responsible}</Badge>
          </div>
          {/* Corrigido: substitui o <p> por <div> */}
          <div className="text-sm">
            <span className="font-bold">Última Limpeza:</span>{' '}
            {formatDate(equipment.last_cleaning)}
          </div>
        </div>
        <div className="flex justify-between gap-2 mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="bg-success hover:bg-success/80 text-success-foreground border-success w-full"
                onClick={handleMarkCleanedClick}
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Limpar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja marcar "{equipment.name}" como limpo? Esta ação irá registrar a data de hoje como a última limpeza.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onMarkCleaned(equipment.id)}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewHistory(equipment)}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" /> Histórico
          </Button>
        </div>
        <div className="flex justify-between gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditClick()}
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
                  Esta ação não pode ser desfeita. Isso irá remover permanentemente o equipamento "{equipment.name}" e todo o seu histórico de limpeza.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(equipment.id)}
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