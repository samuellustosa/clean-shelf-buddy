import { useState, useEffect } from 'react';
import { useEquipment } from '@/hooks/useEquipment';
import { useEquipmentFilters } from '@/hooks/useEquipmentFilters';
import { Equipment } from '@/types/equipment';
import { EquipmentTable } from '@/components/EquipmentTable';
import { EquipmentForm } from '@/components/EquipmentForm';
import { HistoryModal } from '@/components/HistoryModal';
import { AdvancedFilters } from '@/components/AdvancedFilters';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationEllipsis, PaginationNext } from '@/components/ui/pagination';
import { Plus, ClipboardList, LayoutDashboard, MoreHorizontal, LogOut, LogIn } from 'lucide-react';
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

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 35;
  
  const {
    equipment,
    allEquipment,
    loading,
    totalItems,
    uniqueSectors,
    uniqueResponsibles,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    markAsCleaned,
    getEquipmentHistory,
  } = useEquipment(currentPage, itemsPerPage);

  const {
    filters,
    setFilters,
    filteredEquipment,
    clearFilters
  } = useEquipmentFilters(equipment);

  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("table");

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedEquipment = filteredEquipment;

  const handleCreateEquipment = () => {
    setEditingEquipment(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleSubmitEquipment = (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
    if (formMode === 'create') {
      addEquipment(equipmentData);
    } else if (editingEquipment) {
      updateEquipment(editingEquipment.id, equipmentData);
    }
  };

  const handleDeleteEquipment = (id: string) => {
    deleteEquipment(id);
  };

  const handleMarkCleaned = (id: string) => {
    markAsCleaned(id);
  };

  const handleViewHistory = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsHistoryOpen(true);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email ?? null);
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
    if (isAuthenticated) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden lg:inline">
            Conectado: {userEmail ?? 'Usuário'}
          </span>
          <Button onClick={handleLogout}>
            Sair
          </Button>
        </div>
      );
    } else {
      return (
        <Button asChild>
          <Link to="/auth">Entrar</Link>
        </Button>
      );
    }
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
              <DropdownMenuItem onClick={handleCreateEquipment} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Novo Equipamento
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Conectado: {userEmail ?? 'Usuário'}
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
            {!isMobile && isAuthenticated && activeTab === 'table' && (
              <Button onClick={handleCreateEquipment} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Equipamento
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
                <ClipboardList className="h-4 w-4" /> Tabela
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="table">
            <AdvancedFilters
              filters={filters}
              setFilters={setFilters}
              uniqueSectors={uniqueSectors}
              uniqueResponsibles={uniqueResponsibles}
              clearFilters={clearFilters}
              isOpen={isFiltersOpen}
              onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
              onReload={() => window.location.reload()}
            />
            
            {loading ? (
                <div className="text-center py-8">Carregando equipamentos...</div>
            ) : (
              <>
                <EquipmentTable
                  equipment={paginatedEquipment}
                  onEdit={handleEditEquipment}
                  onDelete={handleDeleteEquipment}
                  onMarkCleaned={handleMarkCleaned}
                  onViewHistory={handleViewHistory}
                />

                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink 
                              onClick={() => setCurrentPage(index + 1)}
                              isActive={currentPage === index + 1}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="dashboard">
            <Dashboard equipment={allEquipment} />
          </TabsContent>
        </Tabs>
        
        <EquipmentForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitEquipment}
          equipment={editingEquipment}
          mode={formMode}
          uniqueSectors={uniqueSectors}
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