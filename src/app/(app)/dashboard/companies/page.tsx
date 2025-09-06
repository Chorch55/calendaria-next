'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit3,
  BarChart3
} from 'lucide-react';

interface ClientData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'prospect';
  monthlyRevenue: number;
  lastInteraction: string;
  totalValue: number;
  trend: 'up' | 'down' | 'stable';
  projects: number;
  revenueHistory: {
    date: string;
    amount: number;
  }[];
}

interface ClientWithPeriodRevenue extends ClientData {
  periodRevenue: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  clients: number;
  newClients: number;
  churnRate: number;
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [topClientsDateFilter, setTopClientsDateFilter] = useState('current-month');

  // Datos simulados de clientes
  const clients: ClientData[] = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      status: 'active',
      monthlyRevenue: 2500,
      lastInteraction: '2024-09-05',
      totalValue: 45000,
      trend: 'up',
      projects: 3,
      revenueHistory: [
        { date: '2024-09-01', amount: 2500 },
        { date: '2024-08-01', amount: 2300 },
        { date: '2024-07-01', amount: 2100 },
        { date: '2024-06-01', amount: 1900 },
        { date: '2024-05-01', amount: 1800 },
        { date: '2024-04-01', amount: 1600 }
      ]
    },
    {
      id: '2',
      name: 'Creative Agency Ltd',
      status: 'active',
      monthlyRevenue: 1800,
      lastInteraction: '2024-09-04',
      totalValue: 32400,
      trend: 'up',
      projects: 2,
      revenueHistory: [
        { date: '2024-09-01', amount: 1800 },
        { date: '2024-08-01', amount: 1750 },
        { date: '2024-07-01', amount: 1600 },
        { date: '2024-06-01', amount: 1500 },
        { date: '2024-05-01', amount: 1400 },
        { date: '2024-04-01', amount: 1200 }
      ]
    },
    {
      id: '3',
      name: 'StartUp Innovation',
      status: 'prospect',
      monthlyRevenue: 0,
      lastInteraction: '2024-09-03',
      totalValue: 0,
      trend: 'stable',
      projects: 0,
      revenueHistory: []
    },
    {
      id: '4',
      name: 'Retail Group SA',
      status: 'active',
      monthlyRevenue: 3200,
      lastInteraction: '2024-09-06',
      totalValue: 57600,
      trend: 'down',
      projects: 4,
      revenueHistory: [
        { date: '2024-09-01', amount: 3200 },
        { date: '2024-08-01', amount: 3400 },
        { date: '2024-07-01', amount: 3600 },
        { date: '2024-06-01', amount: 3800 },
        { date: '2024-05-01', amount: 4000 },
        { date: '2024-04-01', amount: 4200 }
      ]
    }
  ];

  // Datos históricos simulados
  const monthlyData: MonthlyData[] = [
    { month: 'Enero 2024', revenue: 12500, clients: 18, newClients: 3, churnRate: 5.5 },
    { month: 'Febrero 2024', revenue: 13200, clients: 20, newClients: 4, churnRate: 4.8 },
    { month: 'Marzo 2024', revenue: 14100, clients: 22, newClients: 3, churnRate: 3.2 },
    { month: 'Abril 2024', revenue: 15800, clients: 24, newClients: 5, churnRate: 2.8 },
    { month: 'Mayo 2024', revenue: 16500, clients: 26, newClients: 4, churnRate: 4.1 },
    { month: 'Junio 2024', revenue: 17200, clients: 28, newClients: 6, churnRate: 3.5 },
    { month: 'Julio 2024', revenue: 18900, clients: 30, newClients: 4, churnRate: 2.9 },
    { month: 'Agosto 2024', revenue: 19750, clients: 32, newClients: 5, churnRate: 3.8 }
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActiveClients = clients.filter(c => c.status === 'active').length;
  const totalMonthlyRevenue = clients.filter(c => c.status === 'active').reduce((sum, client) => sum + client.monthlyRevenue, 0);
  const averageClientValue = totalActiveClients > 0 ? totalMonthlyRevenue / totalActiveClients : 0;

  // Función para filtrar clientes por período de fecha
  const getFilteredClientsByPeriod = (period: string): ClientWithPeriodRevenue[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return clients.filter(client => {
      if (client.status !== 'active' || client.revenueHistory.length === 0) return false;

      const hasRevenueInPeriod = client.revenueHistory.some(revenue => {
        const revenueDate = new Date(revenue.date);
        const revenueYear = revenueDate.getFullYear();
        const revenueMonth = revenueDate.getMonth();

        switch (period) {
          case 'current-month':
            return revenueYear === currentYear && revenueMonth === currentMonth;
          case 'last-month':
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return revenueYear === lastMonthYear && revenueMonth === lastMonth;
          case 'last-3-months':
            const threeMonthsAgo = new Date(currentYear, currentMonth - 3);
            return revenueDate >= threeMonthsAgo;
          case 'current-year':
            return revenueYear === currentYear;
          case 'last-year':
            return revenueYear === currentYear - 1;
          default:
            return true;
        }
      });

      return hasRevenueInPeriod;
    }).map(client => {
      // Calcular ingresos para el período seleccionado
      const periodRevenue = client.revenueHistory
        .filter(revenue => {
          const revenueDate = new Date(revenue.date);
          const revenueYear = revenueDate.getFullYear();
          const revenueMonth = revenueDate.getMonth();

          switch (period) {
            case 'current-month':
              return revenueYear === currentYear && revenueMonth === currentMonth;
            case 'last-month':
              const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
              const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
              return revenueYear === lastMonthYear && revenueMonth === lastMonth;
            case 'last-3-months':
              const threeMonthsAgo = new Date(currentYear, currentMonth - 3);
              return revenueDate >= threeMonthsAgo;
            case 'current-year':
              return revenueYear === currentYear;
            case 'last-year':
              return revenueYear === currentYear - 1;
            default:
              return true;
          }
        })
        .reduce((sum, revenue) => sum + revenue.amount, 0);

      return {
        ...client,
        periodRevenue
      };
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'prospect':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gestiona y analiza la evolución de tus clientes y su rendimiento
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="clients">Lista de Clientes</TabsTrigger>
          <TabsTrigger value="evolution">Evolución Histórica</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principales */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActiveClients}</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{totalMonthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Promedio por Cliente</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{Math.round(averageClientValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Valor mensual promedio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.reduce((sum, client) => sum + client.projects, 0)}</div>
                <p className="text-xs text-muted-foreground">
                  En desarrollo actual
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top clientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Clientes por Ingresos</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ranking de clientes según el período seleccionado
                  </p>
                </div>
                <Select value={topClientsDateFilter} onValueChange={setTopClientsDateFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Mes actual</SelectItem>
                    <SelectItem value="last-month">Mes pasado</SelectItem>
                    <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                    <SelectItem value="current-year">Año actual</SelectItem>
                    <SelectItem value="last-year">Año pasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFilteredClientsByPeriod(topClientsDateFilter)
                  .sort((a, b) => b.periodRevenue - a.periodRevenue)
                  .slice(0, 5)
                  .map((client: ClientWithPeriodRevenue, index: number) => (
                    <div key={client.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                        </div>
                        <div className="w-10 h-10 bg-secondary/50 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.projects} proyectos activos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">€{client.periodRevenue.toLocaleString()}</p>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(client.trend)}
                          <span className="text-sm text-muted-foreground">
                            {topClientsDateFilter === 'current-month' ? 'este mes' :
                             topClientsDateFilter === 'last-month' ? 'mes pasado' :
                             topClientsDateFilter === 'last-3-months' ? 'últimos 3 meses' :
                             topClientsDateFilter === 'current-year' ? 'este año' :
                             'año pasado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                {getFilteredClientsByPeriod(topClientsDateFilter).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay datos de ingresos para el período seleccionado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="prospect">Prospectos</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>

          {/* Lista de clientes */}
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(client.status)}>
                            {client.status === 'active' ? 'Activo' : 
                             client.status === 'inactive' ? 'Inactivo' : 'Prospecto'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Última interacción: {new Date(client.lastInteraction).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="font-semibold">€{client.monthlyRevenue.toLocaleString()}/mes</p>
                          <p className="text-sm text-muted-foreground">{client.projects} proyectos</p>
                        </div>
                        {getTrendIcon(client.trend)}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-6">
          {/* Filtros de período */}
          <div className="flex items-center gap-4">
            <Label htmlFor="period">Período:</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-year">Año actual</SelectItem>
                <SelectItem value="last-year">Año anterior</SelectItem>
                <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datos históricos */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolución Mensual - Año 2024</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Introduce los datos de meses anteriores para análisis de tendencias
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">{data.month}</Label>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Ingresos</Label>
                        <p className="text-sm font-semibold">€{data.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Clientes Totales</Label>
                        <p className="text-sm font-semibold">{data.clients}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Nuevos Clientes</Label>
                        <p className="text-sm font-semibold text-green-600">+{data.newClients}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Tasa de Abandono</Label>
                        <p className="text-sm font-semibold text-red-600">{data.churnRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Formulario para añadir datos del mes actual */}
            <Card>
              <CardHeader>
                <CardTitle>Añadir Datos del Mes Actual</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Completa la información del mes en curso
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="current-revenue">Ingresos del Mes</Label>
                    <Input id="current-revenue" type="number" placeholder="20000" />
                  </div>
                  <div>
                    <Label htmlFor="current-clients">Total de Clientes</Label>
                    <Input id="current-clients" type="number" placeholder="34" />
                  </div>
                  <div>
                    <Label htmlFor="new-clients">Nuevos Clientes</Label>
                    <Input id="new-clients" type="number" placeholder="2" />
                  </div>
                  <div>
                    <Label htmlFor="churn-rate">Tasa de Abandono (%)</Label>
                    <Input id="churn-rate" type="number" step="0.1" placeholder="2.5" />
                  </div>
                </div>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Guardar Datos del Mes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
