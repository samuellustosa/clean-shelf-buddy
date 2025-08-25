import { useState, useEffect } from 'react';
import { useEquipment } from '@/hooks/useEquipment';
import { useStock } from '@/hooks/useStock';
import { Equipment, EquipmentFilters, StockItem, MaintenanceStatus } from '@/types/equipment';
import { EquipmentTable } from '@/components/EquipmentTable';
import { EquipmentForm } from '@/components/EquipmentForm';
import { StockTable } from '@/components/StockTable';
import { StockForm } from '@/components/StockForm';
import { HistoryModal } from '@/components/HistoryModal';
import { AdvancedFilters } from '@/components/AdvancedFilters';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationEllipsis, PaginationNext } from '@/components/ui/pagination';
import { Plus, ClipboardList, LayoutDashboard, MoreHorizontal, LogOut, LogIn, Users, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { usePagination } from '@/hooks/usePagination';
import { WithdrawalModal } from '@/components/WithdrawalModal';

const Index = () => {
  const [equipmentFilters, setEquipmentFilters] = useState<EquipmentFilters>({
    status: 'all',
    sector: 'all',
    responsible: 'all',
    searchTerm: '',
  });

  const { currentPage, itemsPerPage, totalItems, totalPages, setTotalItems, handlePageChange } = usePagination(35);

  const {
    equipment,
    allEquipment,
    loading: equipmentLoading,
    allEquipmentLoading,
    uniqueSectors,
    uniqueResponsibles,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    markAsCleaned,
    getEquipmentHistory,
    userPermissions,
    fetchAllEquipment,
    refetch: refetchEquipment,
  } = useEquipment(currentPage, itemsPerPage, equipmentFilters, setTotalItems, totalItems);

  const {
    stock,
    loading: stockLoading,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    refetch: refetchStock,
    withdrawStockItem,
    parentItems,
    childItems,
  } = useStock();

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false);
  const [isStockFormOpen, setIsStockFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingStockItem, setEditingStockItem] = useState<StockItem | null>(null);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("table");
  const [initialParentId, setInitialParentId] = useState<string | null>(null);

  const paginatedEquipment = equipment;
  const paginatedStock = stock;

  const handleCreateEquipment = () => {
    if (!userPermissions?.can_add) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para adicionar equipamentos.",
        variant: "destructive"
      });
      return;
    }
    setEditingEquipment(null);
    setFormMode('create');
    setIsEquipmentFormOpen(true);
  };
  
  const handleCreateStockItem = (parentId: string | null = null) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para adicionar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    setEditingStockItem(null);
    setFormMode('create');
    setInitialParentId(parentId);
    setIsStockFormOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    if (!userPermissions?.can_edit) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar equipamentos.",
        variant: "destructive"
      });
      return;
    }
    setEditingEquipment(equipment);
    setFormMode('edit');
    setIsEquipmentFormOpen(true);
  };

  const handleEditStockItem = (item: StockItem) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    setEditingStockItem(item);
    setFormMode('edit');
    setIsStockFormOpen(true);
  };

  const handleSubmitEquipment = (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
    if (formMode === 'create') {
      addEquipment(equipmentData);
    } else if (editingEquipment) {
      updateEquipment(editingEquipment.id, equipmentData);
    }
  };
  
  const handleSubmitStockItem = (itemData: Omit<StockItem, 'id' | 'created_at' | 'updated_at' | 'maintenance_status'>, maintenanceStatus: MaintenanceStatus) => {
    if (formMode === 'create') {
      addStockItem(itemData, maintenanceStatus);
    } else if (editingStockItem) {
      updateStockItem(editingStockItem.id, { ...itemData, maintenance_status: maintenanceStatus });
    }
  };

  const handleDeleteEquipment = (id: string) => {
    if (!userPermissions?.can_delete) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para deletar equipamentos.",
        variant: "destructive"
      });
      return;
    }
    deleteEquipment(id);
  };
  
  const handleDeleteStockItem = (id: string) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para deletar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    deleteStockItem(id);
  };

  const handleMarkCleaned = (id: string) => {
    if (!userPermissions?.can_add) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para registrar limpezas.",
        variant: "destructive"
      });
      return;
    }
    markAsCleaned(id);
  };

  const handleViewHistory = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsHistoryOpen(true);
  };
  
  const handleOpenWithdrawalModal = (item: StockItem) => {
    if (!userPermissions?.can_manage_stock) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para retirar itens de estoque.",
        variant: "destructive"
      });
      return;
    }
    setSelectedStockItem(item);
    setIsWithdrawalModalOpen(true);
  };

  const handleWithdrawalSubmit = (id: string, withdrawalData: { quantity: number; reason: string; responsible_by: string }) => {
    withdrawStockItem(id, withdrawalData);
  };

  const handleCloseEquipmentForm = () => {
    setIsEquipmentFormOpen(false);
    setEditingEquipment(null);
    setFormMode('create');
  };
  
  const handleCloseStockForm = () => {
    setIsStockFormOpen(false);
    setEditingStockItem(null);
    setFormMode('create');
    setInitialParentId(null);
  };
  
  const handleCloseWithdrawalModal = () => {
    setIsWithdrawalModalOpen(false);
    setSelectedStockItem(null);
  };

  useEffect(() => {
    if (activeTab === 'dashboard' && allEquipment.length === 0) {
      fetchAllEquipment();
    }
  }, [activeTab, allEquipment.length, fetchAllEquipment]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user?.email ?? null);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const equipmentHistory = selectedEquipment
    ? getEquipmentHistory(selectedEquipment.id)
    : [];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Você saiu.' });
  };

  const renderAuthButtons = () => {
    if (!isAuthenticated) {
      return (
        <Button asChild>
          <Link to="/auth">Entrar</Link>
        </Button>
      );
    }

    let userRoleText = 'Visualizador';
    if (userPermissions?.can_manage_users) {
      userRoleText = 'Administrador';
    } else if (userPermissions?.can_delete) {
      userRoleText = 'Superusuário';
    } else if (userPermissions?.can_edit) {
      userRoleText = 'Editor';
    } else if (userPermissions?.can_add) {
      userRoleText = 'Colaborador';
    }

    return (
      <div className="flex items-center gap-2">
        {userPermissions?.can_manage_users && (
          <Button asChild variant="ghost" className="flex items-center gap-2">
            <Link to="/admin/users">
              <Users className="h-4 w-4" /> Gerenciar Usuários
            </Link>
          </Button>
        )}
        <span className="text-sm text-muted-foreground hidden lg:inline">
          {userRoleText}: {userEmail ?? 'Usuário'}
        </span>
        <Button onClick={handleLogout}>
          Sair
        </Button>
      </div>
    );
  };

  const renderDropdownMenu = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAuthenticated ? (
            <>
              {userPermissions?.can_manage_users && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/users" className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> Gerenciar Usuários
                  </Link>
                </DropdownMenuItem>
              )}
              {userPermissions?.can_add && activeTab !== 'stock' && (
                <DropdownMenuItem onClick={() => handleCreateEquipment()} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Novo Equipamento
                </DropdownMenuItem>
              )}
              {userPermissions?.can_manage_stock && activeTab === 'stock' && (
                <DropdownMenuItem onClick={() => handleCreateStockItem()} className="flex items-center gap-2">
                  <Box className="h-4 w-4" /> Novo Item de Estoque
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                {userPermissions?.can_manage_users ? 'Administrador' : userPermissions?.can_delete ? 'Superusuário' : userPermissions?.can_edit ? 'Editor' : 'Visualizador'}: {userEmail ?? 'Usuário'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Sair
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            {isMobile ? (
              <h1 className="text-xl font-bold flex items-center gap-2">
                CONTROLE DE LIMPEZA - CPD
              </h1>
            ) : (
              <>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  CONTROLE DE LIMPEZA
                </h1>
                <p className="text-muted-foreground mt-2">
                   CENTRO DE PROCESSAMENTO DE DADOS
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!isMobile && isAuthenticated && activeTab === 'table' && userPermissions?.can_add && (
              <Button onClick={() => handleCreateEquipment()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Equipamento
              </Button>
            )}
            {!isMobile && isAuthenticated && activeTab === 'stock' && userPermissions?.can_manage_stock && (
              <Button onClick={() => handleCreateStockItem()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Item de Estoque
              </Button>
            )}
            {!isMobile && renderAuthButtons()}
            {isMobile && renderDropdownMenu()}
          </div>
        </div>

        <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Equipamentos
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-2">
                <Box className="h-4 w-4" /> Estoque
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="table">
            <AdvancedFilters
              filters={equipmentFilters}
              setFilters={setEquipmentFilters}
              uniqueSectors={uniqueSectors}
              uniqueResponsibles={uniqueResponsibles}
              clearFilters={() => setEquipmentFilters({ status: 'all', sector: 'all', responsible: 'all', searchTerm: '' })}
              isOpen={isFiltersOpen}
              onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
              onReload={() => refetchEquipment()}
            />

            {equipmentLoading ? (
                <div className="text-center py-8">Carregando equipamentos...</div>
            ) : (
              <>
                <EquipmentTable
                  equipment={paginatedEquipment}
                  onEdit={handleEditEquipment}
                  onDelete={handleDeleteEquipment}
                  onMarkCleaned={handleMarkCleaned}
                  onViewHistory={handleViewHistory}
                  userPermissions={userPermissions}
                />

                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              onClick={() => handlePageChange(index + 1)}
                              isActive={currentPage === index + 1}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="stock">
            {stockLoading ? (
                <div className="text-center py-8">Carregando itens de estoque...</div>
            ) : (
              <StockTable
                parentItems={parentItems}
                childItems={childItems}
                onEdit={handleEditStockItem}
                onDelete={handleDeleteStockItem}
                userPermissions={userPermissions}
                onWithdraw={handleOpenWithdrawalModal}
                onAddChild={handleCreateStockItem}
              />
            )}
          </TabsContent>
          <TabsContent value="dashboard">
            {allEquipmentLoading ? (
              <DashboardSkeleton />
            ) : (
              <Dashboard equipment={allEquipment} />
            )}
          </TabsContent>
        </Tabs>

        <EquipmentForm
          isOpen={isEquipmentFormOpen}
          onClose={handleCloseEquipmentForm}
          onSubmit={handleSubmitEquipment}
          equipment={editingEquipment}
          mode={formMode}
          uniqueSectors={uniqueSectors}
          uniqueResponsibles={uniqueResponsibles}
        />

        <StockForm
          isOpen={isStockFormOpen}
          onClose={handleCloseStockForm}
          onSubmit={handleSubmitStockItem}
          item={editingStockItem}
          mode={formMode}
          parentItems={parentItems}
          initialParentId={initialParentId}
        />

        <WithdrawalModal
          isOpen={isWithdrawalModalOpen}
          onClose={handleCloseWithdrawalModal}
          item={selectedStockItem}
          onWithdraw={handleWithdrawalSubmit}
          uniqueResponsibles={uniqueResponsibles}
        />

        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          equipment={selectedEquipment}
          history={equipmentHistory}
        />
      </div>
    </div>
  );
};

export default Index;