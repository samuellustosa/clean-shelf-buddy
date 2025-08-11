import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EquipmentFilters, EquipmentStatus } from '@/types/equipment';
import { X, Filter, RotateCcw } from 'lucide-react';

interface AdvancedFiltersProps {
  filters: EquipmentFilters;
  setFilters: (filters: EquipmentFilters) => void;
  uniqueSectors: string[];
  uniqueResponsibles: string[];
  clearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onReload: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  setFilters,
  uniqueSectors,
  uniqueResponsibles,
  clearFilters,
  isOpen,
  onToggle,
  onReload
}) => {
  const handleFilterChange = (key: keyof EquipmentFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleDaysRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    setFilters({
      ...filters,
      daysRange: {
        ...filters.daysRange,
        [type]: numValue
      }
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (typeof value === 'string') return value !== '' && value !== 'all';
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== undefined);
    }
    return false;
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* Grupo de botões à esquerda */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onToggle}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>
        
        {/* Botão de recarregar à direita */}
        <Button 
          variant="outline"
          onClick={onReload}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Recarregar
        </Button>
      </div>

      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Term */}
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nome, setor ou responsável..."
                  value={filters.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value as EquipmentStatus | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ok">Em dia</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sector Filter */}
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select 
                  value={filters.sector || 'all'}
                  onValueChange={(value) => handleFilterChange('sector', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os setores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueSectors.map(sector => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Responsible Filter */}
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select 
                  value={filters.responsible || 'all'}
                  onValueChange={(value) => handleFilterChange('responsible', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os responsáveis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueResponsibles.map(responsible => (
                      <SelectItem key={responsible} value={responsible}>
                        {responsible}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Days Range Min */}
              <div className="space-y-2">
                <Label htmlFor="daysMin">Dias mínimos até limpeza</Label>
                <Input
                  id="daysMin"
                  type="number"
                  placeholder="Mínimo"
                  value={filters.daysRange?.min || ''}
                  onChange={(e) => handleDaysRangeChange('min', e.target.value)}
                />
              </div>

              {/* Days Range Max */}
              <div className="space-y-2">
                <Label htmlFor="daysMax">Dias máximos até limpeza</Label>
                <Input
                  id="daysMax"
                  type="number"
                  placeholder="Máximo"
                  value={filters.daysRange?.max || ''}
                  onChange={(e) => handleDaysRangeChange('max', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};