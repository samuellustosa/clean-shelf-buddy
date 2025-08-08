import { Equipment, CleaningHistory } from '@/types/equipment';
import { formatDate } from '@/utils/equipmentUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  history: CleaningHistory[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  equipment,
  history,
}) => {
  if (!equipment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Histórico de Limpezas - {equipment.name}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Setor: {equipment.sector} • Responsável: {equipment.responsible} • Periodicidade: {equipment.periodicity} dias
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma limpeza registrada ainda
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data da Limpeza</TableHead>
                    <TableHead>Feito por</TableHead>
                    <TableHead>Registrado em</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry, index) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {formatDate(entry.cleaning_date)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {entry.responsible_by}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(entry.created_at.split('T')[0])}
                        </TableCell>
                       <TableCell>
                         {index === 0 ? (
                           <Badge className="bg-success text-success-foreground">
                             Mais recente
                           </Badge>
                         ) : (
                           <Badge variant="outline">
                             Histórico
                           </Badge>
                         )}
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};