import { useState, useEffect } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem, InventoryFilters, UserProfile } from '@/types/inventory';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { InventoryForm } from '@/components/InventoryForm';
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

const InventoryManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userPermissions, setUserPermissions] = useState<UserProfile['permissions'] | null>(null);
  
  const [filters, setFilters] = useState<InventoryFilters>({
    category: 'all',
    location: 'all',
    searchTerm: '',
  });

  const { items, loading, addItem, updateItem, deleteItem, uniqueCategories, uniqueLocations } = useInventory(filters);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('permissions')
            .eq('id', user.id)
            .single();
          if (error) throw error;
          setUserPermissions(data?.permissions as UserProfile['permissions']);
        } else {
          setUserPermissions(null);
        }
      } catch (error) {
        console.error('Erro ao buscar as permissões do usuário:', error);
        navigate('/auth');
      }
    };
    fetchUserPermissions();
  }, [navigate]);

  const handleOpenCreateForm = () => {
    if (!userPermissions?.can_manage_inventory) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para adicionar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    setEditingItem(null);
    setFormMode('create');
    setIsFormOpen(true);
  };
  
  const handleOpenEditForm = (item: InventoryItem) => {
    if (!userPermissions?.can_manage_inventory) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    setEditingItem(item);
    setFormMode('edit');
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (formMode === 'create') {
      addItem(itemData);
    } else if (editingItem) {
      updateItem(editingItem.id, itemData);
    }
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (!userPermissions?.can_manage_inventory) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para remover itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    deleteItem(id);
  };

  const getMaintenanceBadge = (status: 'ok' | 'in_maintenance' | 'defective' | null) => {
    if (status === 'in_maintenance') {
      return (
        <Badge className="bg-warning hover:bg-warning/80 text-warning-foreground">
          Em Manutenção
        </Badge>
      );
    } else if (status === 'defective') {
      return (
        <Badge className="bg-destructive hover:bg-destructive/80 text-destructive-foreground">
          Com Defeito
        </Badge>
      );
    }
    return (
      <Badge className="bg-success hover:bg-success/80 text-success-foreground">
        Em Uso
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Carregando estoque...</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciamento de Estoque</h1>
        <Button onClick={() => navigate('/')}>Voltar para o Início</Button>
      </div>

      <div className="mb-4 flex justify-between">
        <Button onClick={handleOpenCreateForm}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum item em estoque encontrado.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Patrimônio</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Manutenção</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.asset_number || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={item.quantity <= item.min_stock ? 'destructive' : 'default'}>
                          {item.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.min_stock}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{getMaintenanceBadge(item.maintenance_status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenEditForm(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso irá remover permanentemente o item "{item.name}" do estoque.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteItem(item.id)}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <InventoryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        item={editingItem || undefined}
        mode={formMode}
      />
    </div>
  );
};

export default InventoryManagement;