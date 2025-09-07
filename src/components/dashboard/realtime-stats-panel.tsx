'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Mail,
  MessageSquare,
  Phone,
  Bot,
  CheckCircle,
  Timer
} from 'lucide-react';

interface RealtimeMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
  priority: 'high' | 'medium' | 'low';
  lastUpdated: Date;
}

interface RealtimeActivity {
  id: string;
  type: 'appointment' | 'payment' | 'email' | 'whatsapp' | 'ai' | 'call';
  title: string;
  subtitle: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

export default function RealtimeStatsPanel() {
  const [metrics, setMetrics] = useState<RealtimeMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<RealtimeActivity[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Simular métricas en tiempo real
  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics: RealtimeMetric[] = [
        {
          id: 'appointments-today',
          title: 'Citas Hoy',
          value: Math.floor(Math.random() * 15) + 5,
          change: (Math.random() - 0.5) * 10,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          icon: <Calendar className="h-4 w-4" />,
          color: 'text-blue-600',
          priority: 'high',
          lastUpdated: new Date()
        },
        {
          id: 'revenue-today',
          title: 'Ingresos Hoy',
          value: `€${Math.floor(Math.random() * 2000) + 800}`,
          change: (Math.random() - 0.3) * 15,
          trend: Math.random() > 0.3 ? 'up' : 'down',
          icon: <DollarSign className="h-4 w-4" />,
          color: 'text-green-600',
          priority: 'high',
          lastUpdated: new Date()
        },
        {
          id: 'pending-emails',
          title: 'Emails Pendientes',
          value: Math.floor(Math.random() * 20) + 2,
          change: (Math.random() - 0.6) * 8,
          trend: Math.random() > 0.4 ? 'down' : 'up',
          icon: <Mail className="h-4 w-4" />,
          color: 'text-orange-600',
          priority: 'medium',
          lastUpdated: new Date()
        },
        {
          id: 'whatsapp-active',
          title: 'WhatsApp Activos',
          value: Math.floor(Math.random() * 10) + 1,
          change: (Math.random() - 0.5) * 5,
          trend: Math.random() > 0.5 ? 'up' : 'neutral',
          icon: <MessageSquare className="h-4 w-4" />,
          color: 'text-green-600',
          priority: 'medium',
          lastUpdated: new Date()
        },
        {
          id: 'ai-actions',
          title: 'Acciones IA',
          value: Math.floor(Math.random() * 25) + 10,
          change: (Math.random() - 0.2) * 12,
          trend: 'up',
          icon: <Bot className="h-4 w-4" />,
          color: 'text-purple-600',
          priority: 'low',
          lastUpdated: new Date()
        },
        {
          id: 'avg-response-time',
          title: 'Tiempo Respuesta',
          value: `${(Math.random() * 3 + 1).toFixed(1)}h`,
          change: (Math.random() - 0.6) * 6,
          trend: Math.random() > 0.6 ? 'down' : 'up',
          icon: <Timer className="h-4 w-4" />,
          color: 'text-indigo-600',
          priority: 'medium',
          lastUpdated: new Date()
        }
      ];
      setMetrics(newMetrics);
    };

    const updateActivity = () => {
      const activities = [
        'Nueva cita reservada',
        'Pago recibido',
        'Email respondido automáticamente',
        'WhatsApp procesado',
        'Llamada completada',
        'IA resolvió consulta',
        'Cliente confirmó cita',
        'Recordatorio enviado'
      ];

      const activityTypes: RealtimeActivity['type'][] = ['appointment', 'payment', 'email', 'whatsapp', 'call', 'ai'];
      const activityStatuses: RealtimeActivity['status'][] = ['success', 'info'];

      const newActivity: RealtimeActivity = {
        id: Date.now().toString(),
        type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
        title: activities[Math.floor(Math.random() * activities.length)],
        subtitle: `Cliente: ${['María García', 'Juan Pérez', 'Ana López', 'Carlos Ruiz'][Math.floor(Math.random() * 4)]}`,
        timestamp: new Date(),
        status: activityStatuses[Math.floor(Math.random() * activityStatuses.length)]
      };

      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
    };

    // Inicializar
    updateMetrics();
    updateActivity();

    // Actualizar cada 5 segundos si está en vivo
    const interval = setInterval(() => {
      if (isLive) {
        updateMetrics();
        if (Math.random() > 0.7) { // 30% de probabilidad de nueva actividad
          updateActivity();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-3 w-3 text-red-500" />;
    } else {
      return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-orange-500" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'call':
        return <Phone className="h-4 w-4 text-blue-600" />;
      case 'ai':
        return <Bot className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con indicador en vivo */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Métricas en Tiempo Real</h3>
          <p className="text-sm text-muted-foreground">
            Monitoreo en vivo del estado del negocio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <Badge variant={isLive ? 'default' : 'secondary'}>
            {isLive ? 'EN VIVO' : 'PAUSADO'}
          </Badge>
          <button
            onClick={() => setIsLive(!isLive)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLive ? 'Pausar' : 'Reanudar'}
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.filter(m => m.priority === 'high').map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-muted/30`}>
                  {metric.icon}
                </div>
              </div>
              <div className="flex items-center mt-2">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm ml-1 ${getChangeColor(metric.change)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  vs. anterior
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métricas secundarias */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.filter(m => m.priority === 'medium').map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="text-sm font-medium">{metric.title}</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${metric.color}`}>{metric.value}</span>
                  <div className="flex items-center text-xs">
                    {getTrendIcon(metric.trend)}
                    <span className={`ml-1 ${getChangeColor(metric.change)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feed de actividad en tiempo real */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimas acciones y eventos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Esperando actividad...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-3 rounded-lg border transition-all hover:shadow-sm ${getStatusColor(activity.status)}`}
                >
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Indicadores de estado del sistema */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sistema IA</p>
                <p className="font-medium">Funcionando</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails</p>
                <p className="font-medium">Sincronizado</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <p className="font-medium">Conectado</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagos</p>
                <p className="font-medium">Operativo</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
