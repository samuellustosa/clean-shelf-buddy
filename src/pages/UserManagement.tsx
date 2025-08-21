// src/pages/UserManagementPage.tsx
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

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'user' | 'superuser' | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Gerenciar Usuários | Checklist de Limpeza';
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole === 'superuser') {
      fetchUsers();
    } else if (userRole === 'user') {
      navigate('/');
    }
  }, [userRole, navigate]);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setUserRole(data?.role as 'user' | 'superuser');
      } else {
        navigate('/auth');
      }
    } catch (error) {
      console.error('Erro ao buscar o papel do usuário:', error);
      navigate('/auth');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles from the public schema
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`id, full_name, role`);
      if (profilesError) throw profilesError;

      const usersWithEmail = profiles.map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role as 'user' | 'superuser',
        // O e-mail não pode ser obtido diretamente aqui de forma segura.
        // Adicionaremos um valor padrão ou você pode ajustar a lógica se tiver uma forma segura de obter esta informação.
        email: 'E-mail não disponível',
      }));

      setUsers(usersWithEmail || []);
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

  const handleRoleChange = async (userId: string, newRole: 'user' | 'superuser') => {
    if (userRole !== 'superuser') {
      toast({
        title: 'Permissão negada',
        description: 'Apenas superusuários podem alterar permissões.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">ID do Usuário</TableHead>
              <TableHead className="font-bold">Nome Completo</TableHead>
              <TableHead className="text-right font-bold">Permissão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.full_name || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as 'user' | 'superuser')}
                  >
                    <SelectTrigger className="w-[180px] ml-auto">
                      <SelectValue placeholder="Selecione um papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="superuser">Superusuário</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementPage;