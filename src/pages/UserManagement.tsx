import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/equipment';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<UserProfile['permissions'] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const fetchCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);
  };

  useEffect(() => {
    document.title = 'Gerenciar Usuários | Checklist de Limpeza';
    fetchUserPermissions();
    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    if (userPermissions?.can_manage_users) {
      fetchUsers();
    } else if (userPermissions !== null) {
      navigate('/');
    }
  }, [userPermissions, navigate]);

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`id, full_name, permissions`);
      if (profilesError) throw profilesError;

      const usersWithPermissions = profiles.map(profile => {
        const userPermissions = (profile.permissions || {}) as Partial<UserProfile['permissions']>;
        return {
          id: profile.id,
          full_name: profile.full_name,
          permissions: {
            can_add: userPermissions.can_add ?? false,
            can_edit: userPermissions.can_edit ?? false,
            can_delete: userPermissions.can_delete ?? false,
            can_view: userPermissions.can_view ?? false,
            can_mark_cleaned: userPermissions.can_mark_cleaned ?? false,
            can_manage_users: userPermissions.can_manage_users ?? false,
          },
          email: 'E-mail não disponível',
        };
      });

      setUsers(usersWithPermissions || []);
    } catch (error) {
      console.error('Erro ao buscar perfis de usuário:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar a lista de usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (userId: string, permission: keyof UserProfile['permissions'], value: boolean) => {
    if (!userPermissions?.can_manage_users) {
      toast({
        title: 'Permissão negada',
        description: 'Apenas usuários com permissão de gerenciamento podem alterar permissões.',
        variant: 'destructive',
      });
      return;
    }

    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    let newPermissions = {
      ...userToUpdate.permissions,
      [permission]: value,
    };

    if (permission === 'can_view' && value === false) {
      newPermissions.can_add = false;
      newPermissions.can_edit = false;
      newPermissions.can_delete = false;
      newPermissions.can_mark_cleaned = false;
      toast({
        title: 'Permissão ajustada',
        description: 'A permissão de "Visualizar" é um pré-requisito. As permissões de "Adicionar", "Editar", "Deletar" e "Registrar Limpeza" foram desativadas automaticamente.',
        variant: 'default',
      });
    }

    if ((permission === 'can_add' || permission === 'can_edit' || permission === 'can_delete' || permission === 'can_mark_cleaned') && value === true) {
      newPermissions.can_view = true;
      toast({
        title: 'Permissão ajustada',
        description: 'A permissão de "Visualizar" foi ativada, pois é um pré-requisito para a ação selecionada.',
        variant: 'default',
      });
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ permissions: newPermissions })
        .eq('id', userId);
      if (error) throw error;

      setUsers(users.map(u => (u.id === userId ? { ...u, permissions: newPermissions } : u)));
      toast({
        title: 'Sucesso',
        description: 'Permissão do usuário atualizada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar a permissão do usuário',
        variant: 'destructive',
      });
    }
  };

  // Mapeamento de permissões para nomes em português
  const permissionLabels: Record<keyof UserProfile['permissions'], string> = {
    can_add: 'Adicionar',
    can_edit: 'Editar',
    can_delete: 'Deletar',
    can_view: 'Visualizar',
    can_mark_cleaned: 'Registrar Limpeza',
    can_manage_users: 'Gerenciar Usuários',
  };

  const renderPermissionsCheckboxes = (user: UserProfile) => (
    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
      {Object.entries(user.permissions).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-2">
          <Checkbox
            id={`${user.id}-${key}`}
            checked={value}
            onCheckedChange={(checked) => handlePermissionChange(user.id, key as keyof UserProfile['permissions'], checked as boolean)}
            disabled={
              !userPermissions?.can_manage_users ||
              (key === 'can_manage_users' && user.id === currentUserId)
            }
          />
          <Label htmlFor={`${user.id}-${key}`} className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            !userPermissions?.can_manage_users && "text-muted-foreground"
          )}>
            {permissionLabels[key as keyof UserProfile['permissions']]}
          </Label>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className="text-center py-8">Carregando usuários...</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <Button onClick={() => navigate('/')}>Voltar para o Início</Button>
      </div>


      <div className="border rounded-lg">
        {isMobile ? (
          <div className="p-4 space-y-6">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle>{user.full_name || 'N/A'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-4" />
                  {renderPermissionsCheckboxes(user)}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Nome Completo</TableHead>
                <TableHead className="font-bold">Adicionar</TableHead>
                <TableHead className="font-bold">Editar</TableHead>
                <TableHead className="font-bold">Deletar</TableHead>
                <TableHead className="font-bold">Visualizar</TableHead>
                <TableHead className="font-bold">Registrar Limpeza</TableHead>
                <TableHead className="font-bold">Gerenciar Usuários</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={user.permissions.can_add}
                      onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_add', checked as boolean)}
                      disabled={!userPermissions?.can_manage_users}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={user.permissions.can_edit}
                      onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_edit', checked as boolean)}
                      disabled={!userPermissions?.can_manage_users}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={user.permissions.can_delete}
                      onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_delete', checked as boolean)}
                      disabled={!userPermissions?.can_manage_users}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={user.permissions.can_view}
                      onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_view', checked as boolean)}
                      disabled={!userPermissions?.can_manage_users}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={user.permissions.can_mark_cleaned}
                      onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_mark_cleaned', checked as boolean)}
                      disabled={!userPermissions?.can_manage_users}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={user.permissions.can_manage_users}
                      onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_manage_users', checked as boolean)}
                      disabled={!userPermissions?.can_manage_users || user.id === currentUserId}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;