'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Activity,
  Mail,
  Bot,
  Settings,
  AlertTriangle,
  CheckCircle,
  Zap
} from "lucide-react";

interface DurationStats {
  totalEmails: number;
  successfulAnalysis: number;
  averageDuration: number;
  averageConfidence: number;
  methodDistribution: {
    ai_analysis: number;
    keyword_match: number;
    fallback: number;
    fixed: number;
  };
  durationDistribution: Record<number, number>;
  confidenceDistribution: {
    high: number;    // >= 0.8
    medium: number;  // 0.6 - 0.8
    low: number;     // < 0.6
  };
  recentTrends: {
    date: string;
    processed: number;
    accuracy: number;
    avgConfidence: number;
  }[];
}

interface AutomaticDurationStatsProps {
  config: {
    appointmentDurationMode: string;
    enableAIAnalysis: boolean;
    automaticDurationRules: Array<{
      id: string;
      name: string;
      active: boolean;
    }>;
    confidenceThreshold: number;
  };
}

export default function AutomaticDurationStats({ config }: AutomaticDurationStatsProps) {
  const [stats, setStats] = useState<DurationStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Simular datos para demostración
  useEffect(() => {
    const mockStats: DurationStats = {
      totalEmails: 247,
      successfulAnalysis: 234,
      averageDuration: 42,
      averageConfidence: 0.82,
      methodDistribution: {
        ai_analysis: 145,
        keyword_match: 67,
        fallback: 22,
        fixed: 13
      },
      durationDistribution: {
        15: 45,
        30: 89,
        45: 56,
        60: 34,
        90: 23
      },
      confidenceDistribution: {
        high: 156,
        medium: 78,
        low: 13
      },
      recentTrends: [
        { date: '2024-01-01', processed: 34, accuracy: 0.89, avgConfidence: 0.83 },
        { date: '2024-01-02', processed: 28, accuracy: 0.92, avgConfidence: 0.85 },
        { date: '2024-01-03', processed: 41, accuracy: 0.87, avgConfidence: 0.81 },
        { date: '2024-01-04', processed: 36, accuracy: 0.94, avgConfidence: 0.88 },
        { date: '2024-01-05', processed: 39, accuracy: 0.91, avgConfidence: 0.84 },
        { date: '2024-01-06', processed: 33, accuracy: 0.88, avgConfidence: 0.82 },
        { date: '2024-01-07', processed: 36, accuracy: 0.93, avgConfidence: 0.86 }
      ]
    };
    setStats(mockStats);
  }, []);

  const refreshStats = async () => {
    setLoading(true);
    // Aquí iría la llamada real a la API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (!stats) {
    return <div>Cargando estadísticas...</div>;
  }

  const successRate = Math.round((stats.successfulAnalysis / stats.totalEmails) * 100);
  const activeRules = config.automaticDurationRules.filter(rule => rule.active).length;

  return (
    <div className="space-y-6">
      {/* Resumen principal */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Procesados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmails}</div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulAnalysis} exitosos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDuration} min</div>
            <p className="text-xs text-muted-foreground">
              Confianza: {Math.round(stats.averageConfidence * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={config.appointmentDurationMode === 'automatic' ? 'default' : 'secondary'}>
                {config.appointmentDurationMode === 'automatic' ? 'Automático' : 'Manual'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeRules} reglas activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas de análisis detallado */}
      <Tabs defaultValue="methods" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="methods">Métodos</TabsTrigger>
            <TabsTrigger value="durations">Duraciones</TabsTrigger>
            <TabsTrigger value="confidence">Confianza</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              disabled={loading}
            >
              {loading ? (
                <Activity className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              Actualizar
            </Button>
          </div>
        </div>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Distribución por Método de Análisis
              </CardTitle>
              <CardDescription>
                Cómo se determinó la duración para cada email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.methodDistribution).map(([method, count]) => {
                const percentage = Math.round((count / stats.totalEmails) * 100);
                const methodName = {
                  ai_analysis: 'Análisis IA',
                  keyword_match: 'Coincidencia Palabras Clave',
                  fallback: 'Duración de Respaldo',
                  fixed: 'Duración Fija'
                }[method] || method;
                
                const methodIcon = {
                  ai_analysis: <Bot className="h-4 w-4" />,
                  keyword_match: <Zap className="h-4 w-4" />,
                  fallback: <AlertTriangle className="h-4 w-4" />,
                  fixed: <Settings className="h-4 w-4" />
                }[method];

                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {methodIcon}
                        <span className="text-sm font-medium">{methodName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{count}</span>
                        <span className="text-xs text-muted-foreground ml-1">({percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="durations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Distribución de Duraciones
              </CardTitle>
              <CardDescription>
                Frecuencia de cada duración asignada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.durationDistribution)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([duration, count]) => {
                  const percentage = Math.round((count / stats.totalEmails) * 100);
                  
                  return (
                    <div key={duration} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{duration} minutos</span>
                        <div className="text-right">
                          <span className="text-sm font-bold">{count}</span>
                          <span className="text-xs text-muted-foreground ml-1">({percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Distribución de Confianza
              </CardTitle>
              <CardDescription>
                Nivel de confianza en las predicciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'high', label: 'Alta (≥80%)', count: stats.confidenceDistribution.high, color: 'bg-green-500' },
                { key: 'medium', label: 'Media (60-80%)', count: stats.confidenceDistribution.medium, color: 'bg-yellow-500' },
                { key: 'low', label: 'Baja (<60%)', count: stats.confidenceDistribution.low, color: 'bg-red-500' }
              ].map(({ key, label, count, color }) => {
                const percentage = Math.round((count / stats.totalEmails) * 100);
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold">{count}</span>
                        <span className="text-xs text-muted-foreground ml-1">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Umbral configurado:</span>
                  <Badge variant="outline">
                    {Math.round(config.confidenceThreshold * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Predicciones por debajo de este umbral usan la duración de respaldo
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendencias Recientes
              </CardTitle>
              <CardDescription>
                Rendimiento del sistema en los últimos días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(trend.date).toLocaleDateString('es-ES', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trend.processed} emails procesados
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {Math.round(trend.accuracy * 100)}% precisión
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(trend.avgConfidence * 100)}% confianza
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
