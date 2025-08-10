import { useState, useEffect } from 'react';
import { Equipment, CleaningHistory } from '@/types/equipment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEquipment = (currentPage: number, itemsPerPage: number) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]); // Novo estado
  const [history, setHistory] = useState<CleaningHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [uniqueSectors, setUniqueSectors] = useState<string[]>([]);
  const [uniqueResponsibles, setUniqueResponsibles] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchEquipment = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Primeiro, obtenha a contagem total de itens para a paginação
      const { count } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true });

      if (count !== null) {
        setTotalItems(count);
      }

      // Em seguida, obtenha apenas os itens da página atual
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setEquipment(data || []);
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

  const fetchAllEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*');

      if (error) throw error;
      setAllEquipment(data || []);
    } catch (error) {
      console.error('Error fetching all equipment:', error);
    }
  };

  const fetchUniqueValues = async () => {
    try {
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('equipment')
        .select('sector')
        .limit(1000); 

      if (sectorsError) throw sectorsError;
      const uniqueSectorsArray = Array.from(new Set(sectorsData.map(item => item.sector))).sort();
      setUniqueSectors(uniqueSectorsArray);

      const { data: responsiblesData, error: responsiblesError } = await supabase
        .from('equipment')
        .select('responsible')
        .limit(1000);

      if (responsiblesError) throw responsiblesError;
      const uniqueResponsiblesArray = Array.from(new Set(responsiblesData.map(item => item.responsible))).sort();
      setUniqueResponsibles(uniqueResponsiblesArray);

    } catch (error) {
      console.error('Error fetching unique values:', error);
    }
  };
  
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

  useEffect(() => {
    fetchEquipment(currentPage, itemsPerPage);
    fetchHistory();
    fetchUniqueValues();
    fetchAllEquipment(); // Chamar a nova função para o dashboard
  }, [currentPage, itemsPerPage]);

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
      fetchUniqueValues();
      fetchAllEquipment(); // Atualizar o dashboard
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
      fetchUniqueValues();
      fetchAllEquipment(); // Atualizar o dashboard
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
      fetchUniqueValues();
      fetchAllEquipment(); // Atualizar o dashboard
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
      
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .update({ last_cleaning: today })
        .eq('id', equipmentId)
        .select()
        .single();

      if (equipmentError) throw equipmentError;

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
      fetchAllEquipment(); // Atualizar o dashboard
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
    allEquipment, // Retorne a lista completa
    history,
    loading,
    totalItems,
    uniqueSectors,
    uniqueResponsibles,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    markAsCleaned,
    getEquipmentHistory,
    refetch: fetchEquipment
  };
};