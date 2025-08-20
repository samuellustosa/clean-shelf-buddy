// src/hooks/useEquipment.ts
import { useState, useEffect, useCallback } from 'react';
import { Equipment, CleaningHistory, UserProfile } from '@/types/equipment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEquipment = (currentPage: number, itemsPerPage: number) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [history, setHistory] = useState<CleaningHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [uniqueSectors, setUniqueSectors] = useState<string[]>([]);
  const [uniqueResponsibles, setUniqueResponsibles] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);
  const { toast } = useToast();

  const fetchEquipment = useCallback(async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // NOTE: A consulta agora respeitará a política de RLS do superusuário
      const { count } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true });

      if (count !== null) {
        setTotalItems(count);
      }

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
  }, [toast]);

  const fetchAllEquipment = useCallback(async () => {
    try {
      // NOTE: A consulta agora respeitará a política de RLS do superusuário
      const { data, error } = await supabase
        .from('equipment')
        .select('*');

      if (error) throw error;
      setAllEquipment(data || []);
    } catch (error) {
      console.error('Error fetching all equipment:', error);
    }
  }, []);

  const fetchUniqueValues = useCallback(async () => {
    try {
      // NOTE: A consulta agora respeitará a política de RLS do superusuário
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('equipment')
        .select('sector')
        .limit(1000);

      if (sectorsError) throw sectorsError;
      const uniqueSectorsArray = Array.from(new Set(sectorsData.map(item => item.sector))).sort();
      setUniqueSectors(uniqueSectorsArray);

      // NOTE: A consulta agora respeitará a política de RLS do superusuário
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
  }, []);
  
  const fetchHistory = useCallback(async () => {
    try {
      // NOTE: A consulta agora respeitará a política de RLS do superusuário
      const { data, error } = await supabase
        .from('cleaning_history')
        .select('*')
        .order('cleaning_date', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  }, []);

  // Novo fetch para o papel do usuário
  const fetchUserRole = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserRole(data?.role as UserProfile['role']);
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error('Erro ao buscar o papel do usuário:', error);
      // Defina o papel como 'user' ou null em caso de erro
      setUserRole('user');
    }
  }, []);

  useEffect(() => {
    fetchEquipment(currentPage, itemsPerPage);
    fetchHistory();
    fetchUniqueValues();
    fetchAllEquipment();
    fetchUserRole(); // Chame a nova função ao carregar o componente
  }, [currentPage, itemsPerPage, fetchEquipment, fetchHistory, fetchUniqueValues, fetchAllEquipment, fetchUserRole]);

  // Funções de CRUD permanecem as mesmas
  const addEquipment = useCallback(async (newEquipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .insert([newEquipment])
        .select()
        .single();

      if (error) throw error;

      setEquipment(prev => [data, ...prev]);
      setAllEquipment(prev => [data, ...prev]);
      setTotalItems(prev => prev + 1);
      toast({
        title: "Sucesso",
        description: "Equipamento adicionado com sucesso"
      });
      fetchUniqueValues();
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
  }, [fetchUniqueValues, toast]);

  const updateEquipment = useCallback(async (id: string, updates: Partial<Equipment>) => {
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
      setAllEquipment(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "Sucesso",
        description: "Equipamento atualizado com sucesso"
      });
      fetchUniqueValues();
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
  }, [fetchUniqueValues, toast]);

  const deleteEquipment = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEquipment(prev => prev.filter(item => item.id !== id));
      setAllEquipment(prev => prev.filter(item => item.id !== id));
      setHistory(prev => prev.filter(item => item.equipment_id !== id));
      setTotalItems(prev => Math.max(0, prev - 1));
      
      toast({
        title: "Sucesso",
        description: "Equipamento removido com sucesso"
      });
      fetchUniqueValues();
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
  }, [fetchUniqueValues, toast]);

  const markAsCleaned = useCallback(async (equipmentId: string) => {
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
      setAllEquipment(prev => prev.map(item => 
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
  }, [toast]);

  const getEquipmentHistory = (equipmentId: string): CleaningHistory[] => {
    return history
      .filter(item => item.equipment_id === equipmentId)
      .sort((a, b) => new Date(b.cleaning_date).getTime() - new Date(a.cleaning_date).getTime());
  };

  return {
    equipment,
    allEquipment,
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
    userRole, // Retorne o papel do usuário
    refetch: () => {
      fetchEquipment(currentPage, itemsPerPage);
      fetchHistory();
      fetchAllEquipment();
      fetchUniqueValues();
      fetchUserRole();
    }
  };
};