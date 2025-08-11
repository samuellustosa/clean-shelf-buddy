import React, { useMemo } from 'react';
import { Equipment } from '@/types/equipment';
import { getEquipmentStatus } from '@/utils/equipmentUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
} from 'recharts';

interface DashboardProps {
  equipment: Equipment[];
}

const COLORS_PIE = {
  ok: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  overdue: 'hsl(var(--destructive))',
};

export const Dashboard: React.FC<DashboardProps> = ({ equipment }) => {
  const chartData = useMemo(() => {
    const statusCount: { ok: number; warning: number; overdue: number } = { ok: 0, warning: 0, overdue: 0 };
    const sectorCount: { [key: string]: number } = {};
    const responsibleStatusCount: { [key: string]: { ok: number; warning: number; overdue: number } } = {};

    equipment.forEach((item) => {
      const status = getEquipmentStatus(item);
      statusCount[status]++;

      sectorCount[item.sector] = (sectorCount[item.sector] || 0) + 1;

      if (!responsibleStatusCount[item.responsible]) {
        responsibleStatusCount[item.responsible] = { ok: 0, warning: 0, overdue: 0 };
      }
      responsibleStatusCount[item.responsible][status]++;
    });

    const pieData = [
      { name: 'Em dia', value: statusCount.ok },
      { name: 'Aviso', value: statusCount.warning },
      { name: 'Atrasado', value: statusCount.overdue },
    ].filter(entry => entry.value > 0);

    const barDataSector = Object.entries(sectorCount).map(([sector, count]) => ({
      name: sector,
      count,
    }));

    const barDataResponsible = Object.entries(responsibleStatusCount).map(([responsible, statusCounts]) => ({
      name: responsible,
      'Em dia': statusCounts.ok,
      'Aviso': statusCounts.warning,
      'Atrasado': statusCounts.overdue,
    }));

    return { pieData, barDataSector, barDataResponsible };
  }, [equipment]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Status dos Equipamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <Pie
                data={chartData.pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                style={{ fontSize: '10px' }}
              >
                {chartData.pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS_PIE[entry.name === 'Em dia' ? 'ok' : entry.name === 'Aviso' ? 'warning' : 'overdue']}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipamentos por Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.barDataSector}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '10px' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Equipamentos por Responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.barDataResponsible}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '10px' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Em dia" stackId="a" fill="hsl(var(--success))" />
              <Bar dataKey="Aviso" stackId="a" fill="hsl(var(--warning))" />
              <Bar dataKey="Atrasado" stackId="a" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};