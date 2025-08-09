// src/hooks/useEquipment.ts
import { useState, useEffect } from 'react';
import { Equipment, CleaningHistory } from '@/types/equipment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEquipment = (page = 0, itemsPerPage = 10) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [history, setHistory] = useState<CleaningHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0); // Novo estado para a contagem total
  const { toast } = useToast();

  useEffect(() => {
    fetchEquipment();
    fetchHistory();
  }, [page, itemsPerPage]); // Adicione as dependências de paginação

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from('equipment')
        .select('*', { count: 'exact' }) // Adicione a contagem total
        .order('created_at', { ascending: false })
        .range(start, end); // Limite a busca apenas para a página atual

      if (error) throw error;
      setEquipment(data || []);
      setTotalItems(count || 0);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar equipamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // As outras funções (fetchHistory, addEquipment, etc.) permanecem as mesmas
  // ...
  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('cleaning_history')
        .select('*')
        .order('cleaning_date', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const addEquipment = async (newEquipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .insert([newEquipment])
        .select()
        .single();

      if (error) throw error;

      setEquipment(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Equipamento adicionado com sucesso"
      });
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar equipamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEquipment(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "Sucesso",
        description: "Equipamento atualizado com sucesso"
      });
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar equipamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEquipment = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEquipment(prev => prev.filter(item => item.id !== id));
      setHistory(prev => prev.filter(item => item.equipment_id !== id));
      
      toast({
        title: "Sucesso",
        description: "Equipamento removido com sucesso"
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover equipamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsCleaned = async (equipmentId: string) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Update equipment's last_cleaning date
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .update({ last_cleaning: today })
        .eq('id', equipmentId)
        .select()
        .single();

      if (equipmentError) throw equipmentError;

      // Add to cleaning history
      const { data: historyData, error: historyError } = await supabase
        .from('cleaning_history')
        .insert([{
          equipment_id: equipmentId,
          cleaning_date: today,
          responsible_by: equipmentData.responsible
        }])
        .select()
        .single();

      if (historyError) throw historyError;

      setEquipment(prev => prev.map(item => 
        item.id === equipmentId ? equipmentData : item
      ));
      setHistory(prev => [historyData, ...prev]);

      toast({
        title: "Sucesso",
        description: "Limpeza registrada com sucesso"
      });
    } catch (error) {
      console.error('Error marking as cleaned:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar limpeza",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentHistory = (equipmentId: string): CleaningHistory[] => {
    return history
      .filter(item => item.equipment_id === equipmentId)
      .sort((a, b) => new Date(b.cleaning_date).getTime() - new Date(a.cleaning_date).getTime());
  };

  return {
    equipment,
    history,
    loading,
    totalItems, // Retorne a contagem total
    addEquipment,
    updateEquipment,
    deleteEquipment,
    markAsCleaned,
    getEquipmentHistory,
    refetch: () => {
      fetchEquipment();
      fetchHistory();
    }
  };
};