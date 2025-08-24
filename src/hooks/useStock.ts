import { useState, useEffect, useCallback } from 'react';
import { StockItem, UserProfile, MaintenanceStatus, StockHistory } from '@/types/equipment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook personalizado para gerenciar itens de estoque.
 * Fornece funcionalidades para buscar, adicionar, editar, remover e retirar itens de estoque,
 * com base nas permissões do usuário.
 */
export const useStock = () => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState<UserProfile['permissions'] | null>(null);
  const { toast } = useToast();

  const fetchUserPermissions = useCallback(async () => {
    try {
      const { data: { user } = {} } = await supabase.auth.getUser();
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

  const fetchStockItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock_items')
        .select('*');

      if (error) throw error;
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
  
  const fetchStockHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('stock_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStockHistory(data as StockHistory[] || []);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  useEffect(() => {
    if (userPermissions?.can_view) {
      fetchStockItems();
      fetchStockHistory();
    }
  }, [userPermissions, fetchStockItems, fetchStockHistory]);

  const getStockItemStatus = (item: Omit<StockItem, 'id' | 'created_at' | 'updated_at' | 'maintenance_status'>): MaintenanceStatus => {
    if (item.current_quantity === 0) return 'out_of_stock';
    if (item.current_quantity <= item.minimum_stock) return 'low_stock';
    return 'ok';
  };
  
  const addStockItem = useCallback(async (newItem: Omit<StockItem, 'id' | 'created_at' | 'updated_at' | 'maintenance_status'>) => {
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

  const withdrawStockItem = useCallback(async (id: string, withdrawal: { quantity: number; reason: string; responsible_by: string; }) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para retirar itens de estoque.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const itemToUpdate = stock.find(item => item.id === id);

      if (!itemToUpdate) {
        throw new Error("Item não encontrado.");
      }

      const newQuantity = itemToUpdate.current_quantity - withdrawal.quantity;

      if (newQuantity < 0) {
        throw new Error("Quantidade a ser retirada é maior que o estoque disponível.");
      }
      
      const { data: updatedItemData, error: updateError } = await supabase
        .from('stock_items')
        .update({
          current_quantity: newQuantity,
          maintenance_status: getStockItemStatus({ ...itemToUpdate, current_quantity: newQuantity }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      const { error: historyError } = await supabase
        .from('stock_history')
        .insert([{
          item_id: id,
          change: -withdrawal.quantity,
          reason: withdrawal.reason,
          responsible_by: withdrawal.responsible_by
        }]);

      if (historyError) throw historyError;

      setStock(prev => prev.map(item => item.id === id ? updatedItemData as StockItem : item));
      toast({
        title: "Sucesso",
        description: "Item de estoque retirado com sucesso."
      });
    } catch (error: any) {
      console.error('Error withdrawing stock item:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao retirar item de estoque.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, userPermissions, stock]);

  const refetch = useCallback(() => {
    if (userPermissions?.can_view) {
      fetchStockItems();
      fetchStockHistory();
    }
  }, [userPermissions, fetchStockItems, fetchStockHistory]);

  return {
    stock,
    stockHistory,
    loading,
    userPermissions,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    withdrawStockItem,
    refetch,
  };
};