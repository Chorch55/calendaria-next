'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Bot,
  Target,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  PieChart
} from 'lucide-react';

interface AdvancedStats {
  overview: {
    totalRevenue: number;
    totalAppointments: number;
    averageValue: number;
    growthRate: number;
    clientRetention: number;
    conversionRate: number;
  };
  timeAnalysis: {
    peakHours: Array<{ hour: number; appointments: number; revenue: number; }>;
    weekdayPerformance: Array<{ day: string; appointments: number; revenue: number; }>;
    monthlyTrends: Array<{ month: string; appointments: number; revenue: number; growth: number; }>;
  };
  channelAnalysis: {
    web: { bookings: number; revenue: number; conversion: number; avgDuration: number; satisfaction: number; };
    whatsapp: { bookings: number; revenue: number; conversion: number; avgDuration: number; satisfaction: number; };
    email: { bookings: number; revenue: number; conversion: number; avgDuration: number; satisfaction: number; };
  };
  clientAnalysis: {
    newClients: number;
    returningClients: number;
    averageLifetimeValue: number;
    churnRate: number;
    topServices: Array<{ name: string; bookings: number; revenue: number; }>;
    clientSatisfaction: number;
  };
  aiAnalysis: {
    totalActions: number;
    successRate: number;
    timesSaved: number;
    autoResolutions: number;
    humanInterventions: number;
    costReduction: number;
  };
  operationalMetrics: {
    averageResponseTime: number;
    completionRate: number;
    noShowRate: number;
    rescheduleRate: number;
    cancellationRate: number;
    upsellRate: number;
  };
  financialBreakdown: {
    revenueByService: Array<{ service: string; revenue: number; percentage: number; }>;
    revenueByChannel: Array<{ channel: string; revenue: number; percentage: number; }>;
    monthlyRecurring: number;
    oneTimeRevenue: number;
    averageInvoiceValue: number;
    paymentMethodDistribution: Array<{ method: string; percentage: number; }>;
  };
}

interface EnhancedStatsProps {
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export default function EnhancedStats({ timeRange, onTimeRangeChange }: EnhancedStatsProps) {
  const [stats, setStats] = useState<AdvancedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simular datos estadísticos avanzados
  useEffect(() => {
    const mockStats: AdvancedStats = {
      overview: {
        totalRevenue: 24350,
        totalAppointments: 156,
        averageValue: 156.09,
        growthRate: 18.5,
        clientRetention: 87.3,
        conversionRate: 68.2
      },
      timeAnalysis: {
        peakHours: [
          { hour: 9, appointments: 12, revenue: 1890 },
          { hour: 10, appointments: 15, revenue: 2340 },
          { hour: 11, appointments: 18, revenue: 2808 },
          { hour: 14, appointments: 14, revenue: 2184 },
          { hour: 15, appointments: 16, revenue: 2496 },
          { hour: 16, appointments: 13, revenue: 2028 }
        ],
        weekdayPerformance: [
          { day: 'Lun', appointments: 24, revenue: 3744 },
          { day: 'Mar', appointments: 28, revenue: 4368 },
          { day: 'Mié', appointments: 32, revenue: 4992 },
          { day: 'Jue', appointments: 26, revenue: 4056 },
          { day: 'Vie', appointments: 30, revenue: 4680 },
          { day: 'Sáb', appointments: 16, revenue: 2496 }
        ],
        monthlyTrends: [
          { month: 'Ene', appointments: 124, revenue: 19344, growth: 12.5 },
          { month: 'Feb', appointments: 138, revenue: 21528, growth: 11.2 },
          { month: 'Mar', appointments: 156, revenue: 24350, growth: 13.1 }
        ]
      },
      channelAnalysis: {
        web: { bookings: 89, revenue: 12901, conversion: 24.5, avgDuration: 45, satisfaction: 4.6 },
        whatsapp: { bookings: 45, revenue: 5940, conversion: 68.2, avgDuration: 38, satisfaction: 4.8 },
        email: { bookings: 22, revenue: 3916, conversion: 18.7, avgDuration: 52, satisfaction: 4.4 }
      },
      clientAnalysis: {
        newClients: 43,
        returningClients: 113,
        averageLifetimeValue: 487.50,
        churnRate: 12.8,
        topServices: [
          { name: 'Consulta Legal', bookings: 45, revenue: 6750 },
          { name: 'Asesoría Fiscal', bookings: 38, revenue: 5700 },
          { name: 'Consulta Express', bookings: 73, revenue: 5475 }
        ],
        clientSatisfaction: 4.7
      },
      aiAnalysis: {
        totalActions: 234,
        successRate: 91.5,
        timesSaved: 78.5,
        autoResolutions: 189,
        humanInterventions: 45,
        costReduction: 2340
      },
      operationalMetrics: {
        averageResponseTime: 4.2,
        completionRate: 94.2,
        noShowRate: 5.8,
        rescheduleRate: 12.3,
        cancellationRate: 3.7,
        upsellRate: 23.4
      },
      financialBreakdown: {
        revenueByService: [
          { service: 'Consulta Legal', revenue: 6750, percentage: 27.7 },
          { service: 'Asesoría Fiscal', revenue: 5700, percentage: 23.4 },
          { service: 'Consulta Express', revenue: 5475, percentage: 22.5 },
          { service: 'Otros', revenue: 6425, percentage: 26.4 }
        ],
        revenueByChannel: [
          { channel: 'Web', revenue: 12901, percentage: 53.0 },
          { channel: 'WhatsApp', revenue: 5940, percentage: 24.4 },
          { channel: 'Email', revenue: 3916, percentage: 16.1 },
          { channel: 'Otros', revenue: 1593, percentage: 6.5 }
        ],
        monthlyRecurring: 18670,
        oneTimeRevenue: 5680,
        averageInvoiceValue: 156.09,
        paymentMethodDistribution: [
          { method: 'Tarjeta', percentage: 67.3 },
          { method: 'Transferencia', percentage: 23.1 },
          { method: 'PayPal', percentage: 9.6 }
        ]
      }
    };
    setStats(mockStats);
  }, [timeRange]);

  const refreshData = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date());
    }, 2000);
  };

  const exportData = () => {
    // Simular exportación de datos
    alert('Exportando datos estadísticos...');
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando estadísticas avanzadas...</p>
        </div>
      </div>
    );
  }

  const timeRangeLabels = {
    '7d': 'Últimos 7 días',
    '30d': 'Últimos 30 días',
    '90d': 'Últimos 3 meses',
    '1y': 'Último año'
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Estadísticas Avanzadas</h2>
          <p className="text-muted-foreground">
            Análisis detallado del rendimiento del negocio • Última actualización: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">3 meses</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={refreshData} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* KPIs Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">€{stats.overview.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{stats.overview.growthRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Citas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.overview.totalAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <Target className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm text-blue-600">€{stats.overview.averageValue} promedio</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversión</p>
                <p className="text-2xl font-bold text-purple-600">{stats.overview.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Progress value={stats.overview.conversionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retención</p>
                <p className="text-2xl font-bold text-orange-600">{stats.overview.clientRetention}%</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Progress value={stats.overview.clientRetention} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">IA Éxito</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.aiAnalysis.successRate}%</p>
              </div>
              <Bot className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="flex items-center mt-2">
              <Zap className="h-4 w-4 text-indigo-500 mr-1" />
              <span className="text-sm text-indigo-600">{stats.aiAnalysis.totalActions} acciones</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfacción</p>
                <p className="text-2xl font-bold text-pink-600">{stats.clientAnalysis.clientSatisfaction}/5</p>
              </div>
              <CheckCircle className="h-8 w-8 text-pink-500" />
            </div>
            <div className="mt-2">
              <Progress value={(stats.clientAnalysis.clientSatisfaction / 5) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas de análisis detallado */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="channels">Canales</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="ai">IA & Automatización</TabsTrigger>
          <TabsTrigger value="operations">Operaciones</TabsTrigger>
          <TabsTrigger value="financial">Financiero</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Análisis de horarios pico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horarios Pico
                </CardTitle>
                <CardDescription>
                  Distribución de citas por hora del día
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.timeAnalysis.peakHours.map((hour) => {
                  const maxAppointments = Math.max(...stats.timeAnalysis.peakHours.map(h => h.appointments));
                  const percentage = (hour.appointments / maxAppointments) * 100;
                  
                  return (
                    <div key={hour.hour} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{hour.hour}:00 - {hour.hour + 1}:00</span>
                        <div className="text-right">
                          <span className="font-bold">{hour.appointments} citas</span>
                          <span className="text-muted-foreground ml-2">€{hour.revenue}</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Rendimiento por día de semana */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Rendimiento Semanal
                </CardTitle>
                <CardDescription>
                  Citas e ingresos por día de la semana
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.timeAnalysis.weekdayPerformance.map((day) => {
                  const maxRevenue = Math.max(...stats.timeAnalysis.weekdayPerformance.map(d => d.revenue));
                  const percentage = (day.revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={day.day} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{day.day}</span>
                        <div className="text-right">
                          <span className="font-bold">{day.appointments} citas</span>
                          <span className="text-green-600 ml-2">€{day.revenue}</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Tendencias mensuales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendencias Mensuales - {timeRangeLabels[timeRange]}
              </CardTitle>
              <CardDescription>
                Evolución del negocio mes a mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {stats.timeAnalysis.monthlyTrends.map((month) => (
                  <div key={month.month} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{month.month}</h4>
                      <div className="flex items-center">
                        {month.growth > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${month.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {month.growth > 0 ? '+' : ''}{month.growth}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Citas:</span>
                        <span className="font-medium">{month.appointments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ingresos:</span>
                        <span className="font-medium text-green-600">€{month.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          {/* Análisis detallado por canal */}
          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(stats.channelAnalysis).map(([channel, data]) => {
              const channelConfig = {
                web: { name: 'Página Web', icon: <Globe className="h-5 w-5" />, color: 'text-blue-600' },
                whatsapp: { name: 'WhatsApp', icon: <MessageSquare className="h-5 w-5" />, color: 'text-green-600' },
                email: { name: 'Email', icon: <Mail className="h-5 w-5" />, color: 'text-purple-600' }
              }[channel];

              return (
                <Card key={channel} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {channelConfig?.icon}
                      {channelConfig?.name}
                    </CardTitle>
                    <CardDescription>
                      Análisis de rendimiento del canal
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{data.bookings}</div>
                        <div className="text-xs text-muted-foreground">Reservas</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">€{data.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Ingresos</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Conversión:</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{data.conversion}%</span>
                          <Progress value={data.conversion} className="h-2 w-16" />
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Duración promedio:</span>
                        <span className="font-medium">{data.avgDuration} min</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Satisfacción:</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{data.satisfaction}/5</span>
                          <Progress value={(data.satisfaction / 5) * 100} className="h-2 w-16" />
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Valor promedio:</span>
                        <span className="font-medium text-green-600">€{Math.round(data.revenue / data.bookings)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comparativa de ingresos por canal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribución de Ingresos por Canal
              </CardTitle>
              <CardDescription>
                Contribución de cada canal a los ingresos totales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.financialBreakdown.revenueByChannel.map((channel) => (
                  <div key={channel.channel} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{channel.channel}</span>
                      <div className="text-right">
                        <span className="font-bold text-green-600">€{channel.revenue.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-2">({channel.percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={channel.percentage} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Análisis de clientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Análisis de Clientes
                </CardTitle>
                <CardDescription>
                  Métricas clave de la base de clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.clientAnalysis.newClients}</div>
                    <div className="text-sm text-muted-foreground">Nuevos clientes</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.clientAnalysis.returningClients}</div>
                    <div className="text-sm text-muted-foreground">Clientes recurrentes</div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor de vida promedio:</span>
                    <span className="font-bold text-green-600">€{stats.clientAnalysis.averageLifetimeValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tasa de abandono:</span>
                    <div className="flex items-center">
                      <span className="font-medium text-red-600 mr-2">{stats.clientAnalysis.churnRate}%</span>
                      <Progress value={stats.clientAnalysis.churnRate} className="h-2 w-16" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Satisfacción:</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{stats.clientAnalysis.clientSatisfaction}/5</span>
                      <Progress value={(stats.clientAnalysis.clientSatisfaction / 5) * 100} className="h-2 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Servicios más populares */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Servicios Más Populares
                </CardTitle>
                <CardDescription>
                  Top servicios por reservas e ingresos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.clientAnalysis.topServices.map((service, index) => (
                  <div key={service.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">€{service.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{service.bookings} reservas</div>
                      </div>
                    </div>
                    <Progress 
                      value={(service.revenue / stats.clientAnalysis.topServices[0].revenue) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {/* Análisis de IA y automatización */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Rendimiento IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{stats.aiAnalysis.successRate}%</div>
                  <p className="text-sm text-muted-foreground">Tasa de éxito</p>
                </div>
                <Progress value={stats.aiAnalysis.successRate} className="h-3" />
                <div className="text-sm text-center text-muted-foreground">
                  {stats.aiAnalysis.autoResolutions} resoluciones automáticas de {stats.aiAnalysis.totalActions} acciones totales
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tiempo Ahorrado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.aiAnalysis.timesSaved}h</div>
                  <p className="text-sm text-muted-foreground">Este periodo</p>
                </div>
                <div className="text-sm text-center text-muted-foreground">
                  Equivalente a €{stats.aiAnalysis.costReduction} en costos de personal
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Intervenciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{stats.aiAnalysis.humanInterventions}</div>
                  <p className="text-sm text-muted-foreground">Intervenciones manuales</p>
                </div>
                <div className="text-sm text-center text-muted-foreground">
                  {Math.round((stats.aiAnalysis.humanInterventions / stats.aiAnalysis.totalActions) * 100)}% del total de acciones
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          {/* Métricas operacionales */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métricas Operacionales
                </CardTitle>
                <CardDescription>
                  Eficiencia del negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Tiempo respuesta promedio:</span>
                    <span className="font-medium">{stats.operationalMetrics.averageResponseTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de finalización:</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{stats.operationalMetrics.completionRate}%</span>
                      <Progress value={stats.operationalMetrics.completionRate} className="h-2 w-16" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de no-show:</span>
                    <span className="font-medium text-red-600">{stats.operationalMetrics.noShowRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Cambios y Cancelaciones
                </CardTitle>
                <CardDescription>
                  Gestión de modificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de reprogramación:</span>
                    <span className="font-medium text-yellow-600">{stats.operationalMetrics.rescheduleRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de cancelación:</span>
                    <span className="font-medium text-red-600">{stats.operationalMetrics.cancellationRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Ventas Adicionales
                </CardTitle>
                <CardDescription>
                  Oportunidades de crecimiento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.operationalMetrics.upsellRate}%</div>
                  <p className="text-sm text-muted-foreground">Tasa de upselling</p>
                </div>
                <Progress value={stats.operationalMetrics.upsellRate} className="h-3" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Desglose financiero */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Desglose de Ingresos por Servicio
                </CardTitle>
                <CardDescription>
                  Contribución de cada servicio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.financialBreakdown.revenueByService.map((service) => (
                  <div key={service.service} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{service.service}</span>
                      <div className="text-right">
                        <span className="font-bold text-green-600">€{service.revenue.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-2">({service.percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={service.percentage} className="h-3" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Análisis de métodos de pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Métodos de Pago
                </CardTitle>
                <CardDescription>
                  Distribución de métodos de pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.financialBreakdown.paymentMethodDistribution.map((method) => (
                  <div key={method.method} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{method.method}</span>
                      <span className="font-bold">{method.percentage}%</span>
                    </div>
                    <Progress value={method.percentage} className="h-3" />
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Factura promedio:</span>
                    <span className="font-medium">€{stats.financialBreakdown.averageInvoiceValue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ingresos recurrentes:</span>
                    <span className="font-medium text-green-600">€{stats.financialBreakdown.monthlyRecurring.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ingresos únicos:</span>
                    <span className="font-medium text-blue-600">€{stats.financialBreakdown.oneTimeRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
