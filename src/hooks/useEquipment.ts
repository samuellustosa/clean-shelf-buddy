import { useState, useEffect, useCallback } from 'react';
import { Equipment, CleaningHistory, UserProfile, EquipmentFilters } from '@/types/equipment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEquipment = (currentPage: number, itemsPerPage: number, filters: EquipmentFilters) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [history, setHistory] = useState<CleaningHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [allEquipmentLoading, setAllEquipmentLoading] = useState(false); // Novo estado de carregamento
  const [totalItems, setTotalItems] = useState(0);
  const [uniqueSectors, setUniqueSectors] = useState<string[]>([]);
  const [uniqueResponsibles, setUniqueResponsibles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserProfile['permissions'] | null>(null);
  const { toast } = useToast();

  const fetchUserPermissions = useCallback(async () => {
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
      setUserPermissions({
        can_add: false,
        can_edit: false,
        can_delete: false,
        can_view: true,
        can_mark_cleaned: false,
        can_manage_users: false
      });
    }
  }, []);

  const fetchEquipment = useCallback(async (page: number, pageSize: number, filters: EquipmentFilters) => {
    if (!userPermissions?.can_view) {
      setEquipment([]);
      setTotalItems(0);
      return;
    }
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from('equipment').select('*', { count: 'exact' });

      // Apply server-side filters
      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,sector.ilike.%${filters.searchTerm}%,responsible.ilike.%${filters.searchTerm}%`);
      }
      if (filters.status && filters.status !== 'all') {
        // NOTE: This part needs a more complex query based on the logic in getEquipmentStatus
        // For now, it's just a placeholder. The status logic needs to be re-implemented in a server function or trigger.
        // E.g. query = query.filter('last_cleaning', 'lt', new Date(Date.now() - filters.periodicity * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      }
      if (filters.sector && filters.sector !== 'all') {
        query = query.eq('sector', filters.sector);
      }
      if (filters.responsible && filters.responsible !== 'all') {
        query = query.eq('responsible', filters.responsible);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setEquipment(data || []);
      setTotalItems(count ?? 0);

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
  }, [toast, userPermissions]);

  const fetchAllEquipment = useCallback(async () => {
    if (!userPermissions?.can_view) {
      setAllEquipment([]);
      return;
    }
    setAllEquipmentLoading(true); // Inicia o carregamento
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*');

      if (error) throw error;
      setAllEquipment(data || []);
    } catch (error) {
      console.error('Error fetching all equipment:', error);
    } finally {
      setAllEquipmentLoading(false); // Finaliza o carregamento
    }
  }, [userPermissions]);

  const fetchUniqueValues = useCallback(async () => {
    if (!userPermissions?.can_view) {
      setUniqueSectors([]);
      setUniqueResponsibles([]);
      return;
    }
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
  }, [userPermissions]);
  
  const fetchHistory = useCallback(async () => {
    if (!userPermissions?.can_view) {
      setHistory([]);
      return;
    }
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
  }, [userPermissions]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  useEffect(() => {
    if (userPermissions) {
      fetchEquipment(currentPage, itemsPerPage, filters);
      fetchHistory();
      fetchUniqueValues();
    }
  }, [userPermissions, currentPage, itemsPerPage, filters, fetchEquipment, fetchHistory, fetchUniqueValues]);

  const addEquipment = useCallback(async (newEquipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userPermissions?.can_add) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para adicionar equipamentos.",
        variant: "destructive"
      });
      return;
    }
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
  }, [fetchUniqueValues, toast, userPermissions]);

  const updateEquipment = useCallback(async (id: string, updates: Partial<Equipment>) => {
    if (!userPermissions?.can_edit) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar equipamentos.",
        variant: "destructive"
      });
      return;
    }
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
  }, [fetchUniqueValues, toast, userPermissions]);

  const deleteEquipment = useCallback(async (id: string) => {
      if (!userPermissions?.can_delete) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para remover equipamentos.",
        variant: "destructive"
      });
      return;
    }
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
  }, [fetchUniqueValues, toast, userPermissions]);

  const markAsCleaned = useCallback(async (equipmentId: string) => {
    if (!userPermissions?.can_mark_cleaned) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para registrar limpezas.",
        variant: "destructive"
      });
      return;
    }
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
  }, [toast, userPermissions]);

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
    allEquipmentLoading, // Retornar o novo estado de carregamento
    totalItems,
    uniqueSectors,
    uniqueResponsibles,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    markAsCleaned,
    getEquipmentHistory,
    userPermissions,
    fetchAllEquipment,
    refetch: () => {
      fetchEquipment(currentPage, itemsPerPage, filters);
      fetchHistory();
      fetchAllEquipment();
      fetchUniqueValues();
      fetchUserPermissions();
    }
  };
};