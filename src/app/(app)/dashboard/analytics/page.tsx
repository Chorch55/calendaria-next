"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  Award,
  Target,
  Zap,
  Download,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

export default function PersonnelAnalyticsPage() {
  // Simulación de datos de analíticas de personal
  const teamMetrics = {
    totalEmployees: 12,
    activeToday: 9,
    productivity: 87,
    satisfaction: 4.6,
    avgHoursPerDay: 7.2,
    completedTasks: 145,
    pendingTasks: 23,
    efficiency: 92
  };

  const topPerformers = [
    {
      id: '1',
      name: 'Ana García',
      role: 'Consultora Senior',
      productivity: 95,
      hoursWorked: 42,
      tasksCompleted: 18,
      rating: 4.9
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      role: 'Desarrollador',
      productivity: 92,
      hoursWorked: 38,
      tasksCompleted: 15,
      rating: 4.7
    },
    {
      id: '3',
      name: 'Laura Martín',
      role: 'Diseñadora',
      productivity: 88,
      hoursWorked: 35,
      tasksCompleted: 12,
      rating: 4.8
    }
  ];

  const departmentStats = [
    { name: 'Consultoría', employees: 5, productivity: 89, satisfaction: 4.5 },
    { name: 'Desarrollo', employees: 4, productivity: 94, satisfaction: 4.7 },
    { name: 'Diseño', employees: 2, productivity: 86, satisfaction: 4.6 },
    { name: 'Administración', employees: 1, productivity: 91, satisfaction: 4.8 }
  ];

  const getProductivityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProductivityBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analíticas de Personal</h1>
          <p className="text-muted-foreground">
            Monitorea el rendimiento y bienestar de tu equipo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Informe
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {teamMetrics.activeToday} activos hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productividad Media</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProductivityColor(teamMetrics.productivity)}`}>
              {teamMetrics.productivity}%
            </div>
            <p className="text-xs text-muted-foreground">+5% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Promedio</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.avgHoursPerDay}h</div>
            <p className="text-xs text-muted-foreground">Por día por empleado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {teamMetrics.satisfaction}/5
            </div>
            <p className="text-xs text-muted-foreground">Puntuación media</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="reports">Informes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Métricas adicionales */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Trabajo</CardTitle>
                <CardDescription>
                  Estado actual de las tareas del equipo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Tareas Completadas</span>
                  </div>
                  <Badge variant="default">{teamMetrics.completedTasks}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Tareas Pendientes</span>
                  </div>
                  <Badge variant="secondary">{teamMetrics.pendingTasks}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Eficiencia General</span>
                  </div>
                  <Badge variant="default">{teamMetrics.efficiency}%</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Empleados con mejor rendimiento esta semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm text-muted-foreground">{performer.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getProductivityBadge(performer.productivity)}>
                          {performer.productivity}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {performer.tasksCompleted} tareas
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Rendimiento</CardTitle>
              <CardDescription>
                Métricas detalladas de productividad individual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer) => (
                  <div key={performer.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{performer.name}</h3>
                        <p className="text-sm text-muted-foreground">{performer.role}</p>
                      </div>
                      <Badge variant={getProductivityBadge(performer.productivity)}>
                        {performer.productivity}% Productividad
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Horas Trabajadas</p>
                        <p className="font-medium">{performer.hoursWorked}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tareas Completadas</p>
                        <p className="font-medium">{performer.tasksCompleted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valoración</p>
                        <p className="font-medium">{performer.rating}/5</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Departamentos</CardTitle>
              <CardDescription>
                Rendimiento y métricas por áreas de trabajo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.name} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{dept.name}</h3>
                      <Badge variant="outline">{dept.employees} empleados</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Productividad</p>
                        <div className="flex items-center gap-2">
                          <div className={`text-lg font-bold ${getProductivityColor(dept.productivity)}`}>
                            {dept.productivity}%
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Satisfacción</p>
                        <div className="text-lg font-bold text-purple-600">
                          {dept.satisfaction}/5
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informes de Personal</CardTitle>
              <CardDescription>
                Genera informes detallados del rendimiento del equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Informe de Productividad</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Análisis completo del rendimiento individual y por equipos
                  </p>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar PDF
                  </Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Informe de Satisfacción</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Métricas de bienestar y satisfacción del personal
                  </p>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar Excel
                  </Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <LineChart className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium">Tendencias Temporales</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Evolución del rendimiento a lo largo del tiempo
                  </p>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar PDF
                  </Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <h3 className="font-medium">Informe de Actividades</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Registro detallado de actividades y tiempo invertido
                  </p>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
