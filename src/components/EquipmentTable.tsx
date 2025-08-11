import { Equipment } from '@/types/equipment';
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
import { Pencil, Trash2, CheckCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EquipmentTableProps {
  equipment: Equipment[];
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
  onMarkCleaned: (id: string) => void;
  onViewHistory: (equipment: Equipment) => void;
}

export const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipment,
  onEdit,
  onDelete,
  onMarkCleaned,
  onViewHistory,
}) => {
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
          Aviso ({daysUntil === 1 ? '1 dia' : 'hoje'})
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
      status === 'ok' ? "bg-success/20" : status === 'warning' ? "bg-warning/20" : "bg-destructive/20"
    );
  };

  return (
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
                  <span className={cn("inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground font-bold")}>
                    {item.responsible}
                  </span>
                </TableCell>
                <TableCell>{item.periodicity} dias</TableCell>
                <TableCell>{formatDate(item.last_cleaning)}</TableCell>
                <TableCell>{getStatusBadge(item)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkCleaned(item.id)}
                      className="bg-success hover:bg-success/80 text-success-foreground border-success"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
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
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(item.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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