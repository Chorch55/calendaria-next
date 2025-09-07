"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { UsageOverview } from "@/components/dashboard/usage-overview";
import { BusinessMetrics } from "@/components/dashboard/business-metrics";
import { BusinessActivityFeed } from "@/components/dashboard/business-activity-feed";
import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { 
  CalendarClock,
  TrendingUp,
  Clock,
  Users,
  Calendar,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Timer,
  BarChart3,
  Star,
  PlusCircle,
  Settings,
  Globe
} from "lucide-react";

// Interfaces para las estadísticas de citas
interface AppointmentStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completionRate: number;
  averageDuration: number;
  channelBreakdown: {
    web: number;
    whatsapp: number;
    email: number;
    phone: number;
  };
}

interface ChannelPerformance {
  channel: 'web' | 'whatsapp' | 'email' | 'phone';
  appointments: number;
  conversion: number;
  averageResponse: string;
  status: 'excellent' | 'good' | 'needs-attention';
}

export default function DashboardPage() {
  // Datos de ejemplo para estadísticas de citas
  const appointmentStats: AppointmentStats = {
    total: 142,
    confirmed: 98,
    pending: 28,
    cancelled: 16,
    completionRate: 89.4,
    averageDuration: 45,
    channelBreakdown: {
      web: 52,
      whatsapp: 45,
      email: 28,
      phone: 17
    }
  };

  const channelPerformance: ChannelPerformance[] = [
    {
      channel: 'web',
      appointments: 52,
      conversion: 78.5,
      averageResponse: '2 min',
      status: 'excellent'
    },
    {
      channel: 'whatsapp',
      appointments: 45,
      conversion: 85.2,
      averageResponse: '4 min',
      status: 'excellent'
    },
    {
      channel: 'email',
      appointments: 28,
      conversion: 65.3,
      averageResponse: '1.2 h',
      status: 'good'
    },
    {
      channel: 'phone',
      appointments: 17,
      conversion: 92.1,
      averageResponse: 'Instant',
      status: 'excellent'
    }
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'web': return <Globe className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs-attention': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con bienvenida personalizada y estado del sistema */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">¡Buenos días, Elena!</h1>
          <p className="text-muted-foreground mt-1">
            Aquí tienes un resumen completo de tu negocio y sistema de citas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Todos los sistemas operativos
          </Badge>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Acciones Rápidas
          </Button>
        </div>
      </div>

      {/* Estadísticas principales de citas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Citas</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentStats.total}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Confirmación</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {appointmentStats.confirmed} confirmadas de {appointmentStats.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentStats.averageDuration} min</div>
            <p className="text-xs text-muted-foreground">Por sesión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {appointmentStats.cancelled} canceladas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas principales del negocio */}
      <BusinessMetrics />

      {/* Layout principal mejorado */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal: Estadísticas detalladas y actividad (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Panel de estadísticas de canales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Rendimiento por Canal de Citas
              </CardTitle>
              <CardDescription>
                Análisis detallado del comportamiento de reservas por cada canal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="channels">Canales</TabsTrigger>
                  <TabsTrigger value="trends">Tendencias</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(appointmentStats.channelBreakdown).map(([channel, count]) => (
                      <div key={channel} className="text-center p-4 rounded-lg bg-muted/30">
                        <div className="flex justify-center mb-2">
                          {getChannelIcon(channel)}
                        </div>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground capitalize">{channel}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Distribución de Citas</h4>
                    {Object.entries(appointmentStats.channelBreakdown).map(([channel, count]) => {
                      const percentage = (count / appointmentStats.total) * 100;
                      return (
                        <div key={channel} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize flex items-center gap-2">
                              {getChannelIcon(channel)}
                              {channel}
                            </span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="channels" className="space-y-4">
                  <div className="space-y-4">
                    {channelPerformance.map((channel) => (
                      <div key={channel.channel} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getChannelIcon(channel.channel)}
                            <h4 className="font-semibold capitalize">{channel.channel}</h4>
                          </div>
                          <Badge className={getStatusColor(channel.status)}>
                            {channel.status === 'excellent' ? 'Excelente' : 
                             channel.status === 'good' ? 'Bueno' : 'Necesita atención'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Citas</span>
                            <div className="font-semibold">{channel.appointments}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Conversión</span>
                            <div className="font-semibold">{channel.conversion}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Respuesta</span>
                            <div className="font-semibold">{channel.averageResponse}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="trends" className="space-y-4">
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Tendencias de la Semana</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Lunes más ocupado</span>
                            <Badge variant="outline">+23% vs promedio</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">WhatsApp en crecimiento</span>
                            <Badge variant="outline" className="text-green-600">+15% esta semana</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Mejor hora: 10:00-12:00</span>
                            <Badge variant="outline">45% de reservas</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Actividad del negocio */}
          <BusinessActivityFeed />

          {/* Panel de acciones rápidas */}
          <QuickActionsPanel />
        </div>

        {/* Columna lateral: Panel compacto (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <UsageOverview />
          <TodaySchedule />
          <FinancialOverview />
          
          {/* Panel de reviews */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5" />
                Reseñas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">&quot;Excelente servicio, muy profesional&quot;</p>
                    <p className="text-xs text-muted-foreground mt-1">- Ana L.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">&quot;Respuesta rápida y excelentes resultados&quot;</p>
                    <p className="text-xs text-muted-foreground mt-1">- Carlos M.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm font-medium">Promedio: 4.8/5</span>
                <Button variant="ghost" size="sm">Ver Todas</Button>
              </div>
            </CardContent>
          </Card>

          {/* Panel de objetivos mensuales */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Objetivos del Mes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Citas Completadas</span>
                  <span>98/120</span>
                </div>
                <Progress value={81.6} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ingresos Objetivo</span>
                  <span>€4,200/€5,000</span>
                </div>
                <Progress value={84} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Satisfacción Cliente</span>
                  <span>4.8/5.0</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
