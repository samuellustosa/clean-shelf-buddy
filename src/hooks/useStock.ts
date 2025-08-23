import { useState, useEffect, useCallback } from 'react';
import { StockItem, UserProfile, MaintenanceStatus } from '@/types/equipment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook personalizado para gerenciar itens de estoque.
 * Fornece funcionalidades para buscar, adicionar, editar e remover itens de estoque,
 * com base nas permissões do usuário.
 */
export const useStock = () => {
  // Estado para armazenar a lista de itens de estoque.
  const [stock, setStock] = useState<StockItem[]>([]);
  // Estado para indicar o status de carregamento.
  const [loading, setLoading] = useState(false);
  // Estado para armazenar as permissões do usuário logado.
  const [userPermissions, setUserPermissions] = useState<UserProfile['permissions'] | null>(null);
  // Hook para exibir notificações (toasts).
  const { toast } = useToast();

  /**
   * Função para buscar as permissões do usuário logado.
   * Utiliza useCallback para memorizar a função e evitar re-renderizações desnecessárias.
   */
  const fetchUserPermissions = useCallback(async () => {
    try {
      // Obtém o usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Busca as permissões do perfil do usuário
        const { data, error } = await supabase
          .from('profiles')
          .select('permissions')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        // Define as permissões do usuário no estado
        setUserPermissions(data?.permissions as UserProfile['permissions']);
      } else {
        // Se não houver usuário, as permissões são nulas.
        setUserPermissions(null);
      }
    } catch (error) {
      console.error('Erro ao buscar as permissões do usuário:', error);
      // Em caso de erro, define permissões padrão seguras.
      setUserPermissions({
        can_add: false,
        can_edit: false,
        can_delete: false,
        can_view: true,
        can_mark_cleaned: false,
        can_manage_users: false,
        can_manage_stock: false,
      });
    }
  }, []);

  /**
   * Função para buscar todos os itens de estoque do banco de dados.
   * Utiliza useCallback para memorizar a função.
   */
  const fetchStockItems = useCallback(async () => {
    setLoading(true);
    try {
      // Busca todos os registros na tabela 'stock_items'.
      const { data, error } = await supabase
        .from('stock_items')
        .select('*');

      if (error) throw error;
      // Adicionando a tipagem explícita aqui para evitar o erro.
      setStock(data as StockItem[] || []);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens de estoque",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Efeito para buscar as permissões do usuário na montagem do componente.
  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  // Efeito para buscar os itens de estoque após as permissões serem carregadas.
  useEffect(() => {
    // Busca os itens somente se o usuário tiver permissão de visualização.
    if (userPermissions?.can_view) {
      fetchStockItems();
    }
  }, [userPermissions, fetchStockItems]);

  /**
   * Determina o status de um item de estoque com base na quantidade.
   * @param item O item de estoque a ser verificado.
   * @returns O status do item ('out_of_stock', 'low_stock' ou 'ok').
   */
  const getStockItemStatus = (item: Omit<StockItem, 'id' | 'created_at' | 'updated_at' | 'maintenance_status'>): MaintenanceStatus => {
    if (item.current_quantity === 0) return 'out_of_stock';
    if (item.current_quantity <= item.minimum_stock) return 'low_stock';
    return 'ok';
  };
  

  /**
   * Adiciona um novo item de estoque.
   * @param newItem Os dados do novo item a ser adicionado.
   */
  const addStockItem = useCallback(async (newItem: Omit<StockItem, 'id' | 'created_at' | 'updated_at' | 'maintenance_status'>) => {
    // Verifica se o usuário tem a permissão necessária.
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para adicionar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      // Calcula o status do item antes de inserir.
      const maintenanceStatus = getStockItemStatus(newItem);
      const { data, error } = await supabase
        .from('stock_items')
        .insert([{ ...newItem, maintenance_status: maintenanceStatus }])
        .select()
        .single();

      if (error) throw error;

      setStock(prev => [data as StockItem, ...prev]);
      toast({
        title: "Sucesso",
        description: "Item de estoque adicionado com sucesso"
      });
    } catch (error) {
      console.error('Error adding stock item:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar item de estoque",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, userPermissions]);

  /**
   * Atualiza um item de estoque existente.
   * @param id O ID do item a ser atualizado.
   * @param updates Os campos a serem atualizados.
   */
  const updateStockItem = useCallback(async (id: string, updates: Partial<StockItem>) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      // Encontra o item para garantir que o status seja calculado com os novos dados.
      const itemToUpdate = stock.find(item => item.id === id);
      const updatedItem = { ...itemToUpdate, ...updates };
      const maintenanceStatus = getStockItemStatus(updatedItem as Omit<StockItem, 'id' | 'created_at' | 'updated_at' | 'maintenance_status'>);

      const { data, error } = await supabase
        .from('stock_items')
        .update({ ...updates, maintenance_status: maintenanceStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setStock(prev => prev.map(item => item.id === id ? data as StockItem : item));
      toast({
        title: "Sucesso",
        description: "Item de estoque atualizado com sucesso"
      });
    } catch (error) {
      console.error('Error updating stock item:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item de estoque",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, userPermissions, stock]);

  /**
   * Deleta um item de estoque.
   * @param id O ID do item a ser deletado.
   */
  const deleteStockItem = useCallback(async (id: string) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para remover itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStock(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Item de estoque removido com sucesso"
      });
    } catch (error) {
      console.error('Error deleting stock item:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover item de estoque",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, userPermissions]);

  /**
   * Recarrega a lista de itens de estoque.
   */
  const refetch = useCallback(() => {
    if (userPermissions?.can_view) {
      fetchStockItems();
    }
  }, [userPermissions, fetchStockItems]);

  return {
    stock,
    loading,
    userPermissions,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    refetch,
  };
};