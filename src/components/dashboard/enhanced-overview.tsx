'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  Calendar,
  TrendingUp,
  Users,
  MessageSquare,
  Mail,
  Phone,
  Bot,
  Globe,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  ArrowUpRight,
  RefreshCw,
  Edit3,
  Timer,
  Clock,
  Server,
  UserPlus,
  Building
} from 'lucide-react';

interface ChannelConfig {
  enabled: boolean;
  autoConfirm: boolean;
  maxSlotsPerDay: number;
  maxAdvanceBooking: number;
  reminderEnabled: boolean;
  reminderTiming: number;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  maxBookingsPerDay: number;
  enabled: boolean;
  requiresPrePayment: boolean;
}

interface OperationalStats {
  dataCollection: {
    totalInteractions: number;
    dataPointsCollected: number;
    uniqueDataPoints: number;
    contactsGenerated: number;
    avgResponseTime: number;
    sentimentAnalysis: {
      positive: number;
      neutral: number;
      negative: number;
      avgScore: number;
    };
  };
  callMetrics: {
    totalCalls: number;
    avgDuration: number;
    longestCall: number;
    shortestCall: number;
    missedCalls: number;
    callbackRequests: number;
  };
  appointmentMetrics: {
    totalBooked: number;
    avgAdvanceBooking: number; // días promedio de anticipación
    peakBookingHour: number;
    preferredDays: string[];
    cancelationRate: number;
    noShowRate: number;
  };
  appointmentStats: {
    scheduled: number;
    completed: number;
    cancelled: number;
    rescheduled: number;
  };
  aiStatistics: {
    totalResponses: number;
    automaticResolutions: number;
    accuracyRate: number;
    avgConfidenceScore: number;
    languageDetection: { [language: string]: number };
    topQueries: string[];
    escalationRate: number;
  };
  aiMetrics: {
    assistantInteractions: number;
    accuracy: number;
    automatedResolutions: number;
    automationLevel: number;
    automatedResponses: number;
  };
  systemHealth: {
    uptime: number;
    avgLatency: number;
    errorRate: number;
  };
  interactionTiming: {
    peakHours: Array<{ hour: number; interactions: number }>;
    weekdayDistribution: Array<{ day: string; interactions: number }>;
    avgSessionDuration: number;
    responseTimeByChannel: {
      web: number;
      whatsapp: number;
      email: number;
      phone: number;
    };
  };
  clientFeedback: {
    totalRatings: number;
    avgRating: number;
    ratingDistribution: { [rating: number]: number };
    feedbackSentiment: number;
    responseRate: number;
    npsScore: number;
  };
  reminders: {
    totalSent: number;
    emailReminders: number;
    whatsappReminders: number;
    smsReminders: number;
    phoneReminders: number;
    avgDeliveryTime: number;
    openRate: number;
    responseRate: number;
  };
  channelData: {
    web: {
      visits: number;
      bookings: number;
      formCompletions: number;
      avgSessionTime: number;
      bounceRate: number;
      preferredServices: string[];
      conversions?: number;
      customerSatisfaction?: number;
    };
    whatsapp: {
      totalMessages: number;
      avgMessageLength: number;
      emojiUsage: number;
      avgResponseTime: number;
      mediaShared: number;
      groupMessages: number;
      messagesSent?: number;
      openRate?: number;
      responses?: number;
    };
    email: {
      totalEmails: number;
      avgProcessingTime: number;
      attachmentRate: number;
      threadLength: number;
      autoClassified: number;
      manualReview: number;
      processed?: number;
      deliverabilityRate?: number;
      engagementRate?: number;
    };
    phone: {
      totalCalls: number;
      avgCallDuration: number;
      callsAnswered: number;
      missedCalls: number;
      avgWaitTime: number;
      callbackRequests: number;
      voicemailsLeft: number;
      conversionRate: number;
    };
  };
  contactStats: {
    totalContacts: number;
    newContactsToday: number;
    contactsThisWeek: number;
    contactsThisMonth: number;
    averageContactsPerDay: number;
    contactsBySource: {
      web: number;
      whatsapp: number;
      email: number;
      phone: number;
      referral: number;
      direct: number;
    };
    contactQuality: {
      verified: number;
      pending: number;
      inactive: number;
      highValue: number;
    };
    communicationPreferences: {
      email: number;
      whatsapp: number;
      phone: number;
      sms: number;
    };
    segmentation: {
      newClients: number;
      returningClients: number;
      prospects: number;
      leads: number;
    };
    engagement: {
      avgInteractionsPerContact: number;
      lastContactedWithin24h: number;
      lastContactedWithinWeek: number;
      neverContacted: number;
    };
  };
}

interface EnhancedOverviewProps {
  webConfig: ChannelConfig;
  whatsappConfig: ChannelConfig;
  emailConfig: ChannelConfig;
  phoneConfig: ChannelConfig;
  services: Service[];
  onConfigChange: (channel: string) => void;
}

export default function EnhancedOverview({
  webConfig,
  whatsappConfig,
  emailConfig,
  phoneConfig,
  services,
  onConfigChange
}: EnhancedOverviewProps) {
  const [stats, setStats] = useState<OperationalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simular datos de estadísticas operativas
  useEffect(() => {
    const mockStats: OperationalStats = {
      dataCollection: {
        totalInteractions: 1247,
        dataPointsCollected: 15640,
        uniqueDataPoints: 8940,
        contactsGenerated: 234,
        avgResponseTime: 2.3,
        sentimentAnalysis: {
          positive: 768,
          neutral: 356,
          negative: 123,
          avgScore: 4.2
        }
      },
      callMetrics: {
        totalCalls: 156,
        avgDuration: 8.5,
        longestCall: 45.2,
        shortestCall: 1.1,
        missedCalls: 12,
        callbackRequests: 8
      },
      appointmentMetrics: {
        totalBooked: 234,
        avgAdvanceBooking: 12.5,
        peakBookingHour: 14,
        preferredDays: ['Martes', 'Miércoles', 'Jueves'],
        cancelationRate: 3.2,
        noShowRate: 2.1
      },
      appointmentStats: {
        scheduled: 234,
        completed: 198,
        cancelled: 15,
        rescheduled: 21
      },
      aiMetrics: {
        assistantInteractions: 892,
        accuracy: 94.2,
        automatedResolutions: 645,
        automationLevel: 78,
        automatedResponses: 645
      },
      systemHealth: {
        uptime: 99.2,
        avgLatency: 145,
        errorRate: 0.8
      },
      aiStatistics: {
        totalResponses: 892,
        automaticResolutions: 743,
        accuracyRate: 94.7,
        avgConfidenceScore: 87.3,
        languageDetection: { 'es': 756, 'en': 89, 'fr': 34, 'ca': 13 },
        topQueries: ['Precios', 'Horarios', 'Cancelaciones', 'Reprogramar'],
        escalationRate: 5.3
      },
      interactionTiming: {
        peakHours: [
          { hour: 9, interactions: 89 },
          { hour: 10, interactions: 124 },
          { hour: 11, interactions: 156 },
          { hour: 14, interactions: 134 },
          { hour: 15, interactions: 98 }
        ],
        weekdayDistribution: [
          { day: 'Lun', interactions: 156 },
          { day: 'Mar', interactions: 189 },
          { day: 'Mié', interactions: 234 },
          { day: 'Jue', interactions: 198 },
          { day: 'Vie', interactions: 167 }
        ],
        avgSessionDuration: 6.8,
        responseTimeByChannel: {
          web: 1.2,
          whatsapp: 0.8,
          email: 4.5,
          phone: 2.1
        }
      },
      clientFeedback: {
        totalRatings: 187,
        avgRating: 4.6,
        ratingDistribution: { 5: 98, 4: 67, 3: 18, 2: 3, 1: 1 },
        feedbackSentiment: 4.3,
        responseRate: 67.2,
        npsScore: 78
      },
      reminders: {
        totalSent: 456,
        emailReminders: 234,
        whatsappReminders: 189,
        smsReminders: 33,
        phoneReminders: 67,
        avgDeliveryTime: 0.3,
        openRate: 89.4,
        responseRate: 23.7
      },
      channelData: {
        web: {
          visits: 2340,
          bookings: 89,
          formCompletions: 156,
          avgSessionTime: 4.2,
          bounceRate: 34.5,
          preferredServices: ['Consulta Legal', 'Asesoría Fiscal']
        },
        whatsapp: {
          totalMessages: 1247,
          avgMessageLength: 67,
          emojiUsage: 456,
          avgResponseTime: 0.8,
          mediaShared: 78,
          groupMessages: 23
        },
        email: {
          totalEmails: 567,
          avgProcessingTime: 4.5,
          attachmentRate: 23.4,
          threadLength: 3.2,
          autoClassified: 487,
          manualReview: 80
        },
        phone: {
          totalCalls: 234,
          avgCallDuration: 12.5,
          callsAnswered: 198,
          missedCalls: 36,
          avgWaitTime: 1.8,
          callbackRequests: 23,
          voicemailsLeft: 45,
          conversionRate: 84.6
        }
      },
      contactStats: {
        totalContacts: 1456,
        newContactsToday: 23,
        contactsThisWeek: 147,
        contactsThisMonth: 512,
        averageContactsPerDay: 18.5,
        contactsBySource: {
          web: 445,
          whatsapp: 387,
          email: 234,
          phone: 198,
          referral: 156,
          direct: 36
        },
        contactQuality: {
          verified: 1234,
          pending: 156,
          inactive: 45,
          highValue: 234
        },
        communicationPreferences: {
          email: 789,
          whatsapp: 456,
          phone: 234,
          sms: 123
        },
        segmentation: {
          newClients: 234,
          returningClients: 567,
          prospects: 345,
          leads: 310
        },
        engagement: {
          avgInteractionsPerContact: 4.2,
          lastContactedWithin24h: 89,
          lastContactedWithinWeek: 234,
          neverContacted: 78
        }
      }
    };
    setStats(mockStats);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    // Simular actualización de datos
    setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date());
    }, 1500);
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando resumen...</p>
        </div>
      </div>
    );
  }

  // Helper function para acceso seguro a propiedades del canal
  const getChannelProperty = (channelData: any, property: string): any => {
    return channelData && property in channelData ? channelData[property] : 'N/A';
  };

  const channelData = [
    {
      key: 'web',
      name: 'Página Web',
      config: webConfig,
      icon: <Globe className="h-5 w-5" />,
      data: stats.channelData.web,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      key: 'whatsapp',
      name: 'WhatsApp',
      config: whatsappConfig,
      icon: <MessageSquare className="h-5 w-5" />,
      data: stats.channelData.whatsapp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      key: 'email',
      name: 'Email',
      config: emailConfig,
      icon: <Mail className="h-5 w-5" />,
      data: stats.channelData.email,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      key: 'phone',
      name: 'Llamadas',
      config: phoneConfig,
      icon: <Phone className="h-5 w-5" />,
      data: stats.channelData.phone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header con actualización */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estadísticas de Citas</h2>
          <p className="text-muted-foreground">
            Última actualización: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button
          onClick={refreshData}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* KPIs principales - Estadísticas operativas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interacciones Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.dataCollection.totalInteractions}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Timer className="h-3 w-3 mr-1" />
              {stats.dataCollection.avgResponseTime}h promedio
            </div>
            <div className="flex items-center mt-1">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-xs text-green-600">{stats.dataCollection.dataPointsCollected} datos recopilados</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análisis Sentimientos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.dataCollection.sentimentAnalysis.avgScore}/5</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              {stats.dataCollection.sentimentAnalysis.positive} positivos
            </div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-xs text-green-600">{Math.round((stats.dataCollection.sentimentAnalysis.positive / stats.dataCollection.totalInteractions) * 100)}% positivos</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Programadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.appointmentMetrics.totalBooked}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {stats.appointmentMetrics.avgAdvanceBooking} días anticipación
            </div>
            <div className="flex items-center mt-1">
              <Target className="h-3 w-3 mr-1 text-purple-500" />
              <span className="text-xs text-purple-600">Pico: {stats.appointmentMetrics.peakBookingHour}:00h</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA Automatizada</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.aiStatistics.accuracyRate}%</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Zap className="h-3 w-3 mr-1" />
              {stats.aiStatistics.automaticResolutions} resoluciones
            </div>
            <div className="flex items-center mt-1">
              <CheckCircle className="h-3 w-3 mr-1 text-orange-500" />
              <span className="text-xs text-orange-600">{stats.aiStatistics.avgConfidenceScore}% confianza</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">Canales</TabsTrigger>
          <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-6">
          {/* Análisis detallado por canal con datos operativos */}
          <div className="grid gap-6 md:grid-cols-3">
            {channelData.map((channel) => (
              <Card key={channel.key} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${channel.bgColor}`}>
                        {channel.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                        <CardDescription>
                          {channel.config.enabled ? 'Activo' : 'Inactivo'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={channel.config.enabled ? "default" : "secondary"}>
                      {channel.config.enabled ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {channel.config.enabled ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Métricas específicas por canal */}
                  {channel.key === 'web' && (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{(channel.data as any).visits}</div>
                          <div className="text-xs text-muted-foreground">Visitas</div>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{(channel.data as any).bookings}</div>
                          <div className="text-xs text-muted-foreground">Reservas</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Formularios completados:</span>
                          <span className="font-medium">{(channel.data as any).formCompletions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tiempo promedio sesión:</span>
                          <span className="font-medium">{(channel.data as any).avgSessionTime}min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tasa de rebote:</span>
                          <span className="font-medium text-orange-600">{(channel.data as any).bounceRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Conversión:</span>
                          <Badge variant="outline">
                            {Math.round(((channel.data as any).bookings / (channel.data as any).visits) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}

                  {channel.key === 'whatsapp' && (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{(channel.data as any).totalMessages}</div>
                          <div className="text-xs text-muted-foreground">Mensajes</div>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{(channel.data as any).avgResponseTime}min</div>
                          <div className="text-xs text-muted-foreground">Resp. promedio</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Longitud promedio:</span>
                          <span className="font-medium">{(channel.data as any).avgMessageLength} chars</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Emojis usados:</span>
                          <span className="font-medium">{(channel.data as any).emojiUsage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Media compartida:</span>
                          <span className="font-medium">{(channel.data as any).mediaShared}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Grupos activos:</span>
                          <Badge variant="outline">
                            {(channel.data as any).groupMessages}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}

                  {channel.key === 'email' && (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">{(channel.data as any).totalEmails}</div>
                          <div className="text-xs text-muted-foreground">Emails</div>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">{(channel.data as any).avgProcessingTime}min</div>
                          <div className="text-xs text-muted-foreground">Procesamiento</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Con adjuntos:</span>
                          <span className="font-medium">{(channel.data as any).attachmentRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Longitud hilo promedio:</span>
                          <span className="font-medium">{(channel.data as any).threadLength}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Auto-clasificados:</span>
                          <span className="font-medium text-green-600">{(channel.data as any).autoClassified}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revisión manual:</span>
                          <Badge variant="outline" className="text-orange-600">
                            {(channel.data as any).manualReview}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}

                  {channel.key === 'phone' && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{(channel.data as any).totalCalls}</div>
                          <p className="text-xs text-muted-foreground">Total Llamadas</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{(channel.data as any).callsAnswered}</div>
                          <p className="text-xs text-muted-foreground">Contestadas</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duración promedio:</span>
                          <span className="font-medium">{(channel.data as any).avgCallDuration}min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tiempo de espera:</span>
                          <span className="font-medium">{(channel.data as any).avgWaitTime}min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Llamadas perdidas:</span>
                          <span className="font-medium text-red-600">{(channel.data as any).missedCalls}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Buzones de voz:</span>
                          <span className="font-medium">{(channel.data as any).voicemailsLeft}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Solicitudes callback:</span>
                          <span className="font-medium">{(channel.data as any).callbackRequests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tasa de conversión:</span>
                          <Badge variant="outline" className="text-green-600">
                            {(channel.data as any).conversionRate}%
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onConfigChange(channel.key)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Configurar Canal
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          {/* Estadísticas de comunicaciones operativas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.callMetrics.totalCalls}</div>
                    <p className="text-sm text-muted-foreground">Llamadas Totales</p>
                  </div>
                  <Phone className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Duración promedio: {stats.callMetrics.avgDuration}min</span>
                    <span className="text-red-500">{stats.callMetrics.missedCalls} perdidas</span>
                  </div>
                  <Progress value={((stats.callMetrics.totalCalls - stats.callMetrics.missedCalls) / stats.callMetrics.totalCalls) * 100} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.clientFeedback.avgRating}/5</div>
                    <p className="text-sm text-muted-foreground">Valoración Promedio</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stats.clientFeedback.totalRatings} valoraciones</span>
                    <span className="text-green-600">NPS: {stats.clientFeedback.npsScore}</span>
                  </div>
                  <Progress value={(stats.clientFeedback.avgRating / 5) * 100} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.reminders.totalSent}</div>
                    <p className="text-sm text-muted-foreground">Recordatorios Enviados</p>
                  </div>
                  <Mail className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Apertura: {stats.reminders.openRate}%</span>
                    <span className="text-purple-600">Respuesta: {stats.reminders.responseRate}%</span>
                  </div>
                  <Progress value={stats.reminders.openRate} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{stats.interactionTiming.avgSessionDuration}min</div>
                    <p className="text-sm text-muted-foreground">Sesión Promedio</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Web: {stats.interactionTiming.responseTimeByChannel.web}min</span>
                    <span>WA: {stats.interactionTiming.responseTimeByChannel.whatsapp}min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Análisis de horarios pico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Análisis de Horarios de Interacción
              </CardTitle>
              <CardDescription>
                Distribución de interacciones por horas y días
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Horarios pico */}
              <div>
                <h4 className="font-medium mb-3">Horarios Pico</h4>
                <div className="space-y-2">
                  {stats.interactionTiming.peakHours.map((hour) => {
                    const maxInteractions = Math.max(...stats.interactionTiming.peakHours.map(h => h.interactions));
                    const percentage = (hour.interactions / maxInteractions) * 100;
                    
                    return (
                      <div key={hour.hour} className="flex items-center gap-3">
                        <span className="text-sm font-medium min-w-[60px]">{hour.hour}:00h</span>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-3" />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                          {hour.interactions} interacciones
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Distribución por días */}
              <div>
                <h4 className="font-medium mb-3">Días de la Semana</h4>
                <div className="space-y-2">
                  {stats.interactionTiming.weekdayDistribution.map((day) => {
                    const maxInteractions = Math.max(...stats.interactionTiming.weekdayDistribution.map(d => d.interactions));
                    const percentage = (day.interactions / maxInteractions) * 100;
                    
                    return (
                      <div key={day.day} className="flex items-center gap-3">
                        <span className="text-sm font-medium min-w-[60px]">{day.day}</span>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-3" />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                          {day.interactions} interacciones
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análisis de sentimientos detallado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análisis de Sentimientos de Clientes
              </CardTitle>
              <CardDescription>
                Distribución y tendencias del estado de ánimo en las interacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-600">Positivos</span>
                      <span className="font-bold">{stats.dataCollection.sentimentAnalysis.positive}</span>
                    </div>
                    <Progress value={(stats.dataCollection.sentimentAnalysis.positive / stats.dataCollection.totalInteractions) * 100} className="h-3 bg-green-100" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-600">Neutrales</span>
                      <span className="font-bold">{stats.dataCollection.sentimentAnalysis.neutral}</span>
                    </div>
                    <Progress value={(stats.dataCollection.sentimentAnalysis.neutral / stats.dataCollection.totalInteractions) * 100} className="h-3 bg-blue-100" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red-600">Negativos</span>
                      <span className="font-bold">{stats.dataCollection.sentimentAnalysis.negative}</span>
                    </div>
                    <Progress value={(stats.dataCollection.sentimentAnalysis.negative / stats.dataCollection.totalInteractions) * 100} className="h-3 bg-red-100" />
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {stats.dataCollection.sentimentAnalysis.avgScore}/5
                    </div>
                    <p className="text-sm text-muted-foreground">Puntuación Promedio</p>
                    <div className="mt-4 text-xs text-muted-foreground">
                      {Math.round((stats.dataCollection.sentimentAnalysis.positive / stats.dataCollection.totalInteractions) * 100)}% de interacciones positivas
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          {/* Estadísticas de contactos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.contactStats.totalContacts}</div>
                    <p className="text-sm text-muted-foreground">Total Contactos</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Nuevos hoy: {stats.contactStats.newContactsToday}</span>
                    <span>Esta semana: {stats.contactStats.contactsThisWeek}</span>
                  </div>
                  <Progress value={(stats.contactStats.newContactsToday / stats.contactStats.averageContactsPerDay) * 100} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.contactStats.contactQuality.verified}</div>
                    <p className="text-sm text-muted-foreground">Contactos Verificados</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pendientes: {stats.contactStats.contactQuality.pending}</span>
                    <span>Alto valor: {stats.contactStats.contactQuality.highValue}</span>
                  </div>
                  <Progress value={(stats.contactStats.contactQuality.verified / stats.contactStats.totalContacts) * 100} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.contactStats.engagement.avgInteractionsPerContact}</div>
                    <p className="text-sm text-muted-foreground">Interacciones Promedio</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Últimas 24h: {stats.contactStats.engagement.lastContactedWithin24h}</span>
                    <span>Esta semana: {stats.contactStats.engagement.lastContactedWithinWeek}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{stats.contactStats.contactsThisMonth}</div>
                    <p className="text-sm text-muted-foreground">Contactos Este Mes</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Promedio diario: {stats.contactStats.averageContactsPerDay}</span>
                    <span>Nunca contactados: {stats.contactStats.engagement.neverContacted}</span>
                  </div>
                  <Progress value={(stats.contactStats.contactsThisMonth / (stats.contactStats.averageContactsPerDay * 30)) * 100} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Análisis detallado de contactos */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Fuentes de Contactos
                </CardTitle>
                <CardDescription>
                  De dónde provienen los nuevos contactos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Página Web</span>
                      <span className="text-sm font-medium">{stats.contactStats.contactsBySource.web}</span>
                    </div>
                    <Progress value={(stats.contactStats.contactsBySource.web / stats.contactStats.totalContacts) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">WhatsApp</span>
                      <span className="text-sm font-medium">{stats.contactStats.contactsBySource.whatsapp}</span>
                    </div>
                    <Progress value={(stats.contactStats.contactsBySource.whatsapp / stats.contactStats.totalContacts) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Email</span>
                      <span className="text-sm font-medium">{stats.contactStats.contactsBySource.email}</span>
                    </div>
                    <Progress value={(stats.contactStats.contactsBySource.email / stats.contactStats.totalContacts) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Teléfono</span>
                      <span className="text-sm font-medium">{stats.contactStats.contactsBySource.phone}</span>
                    </div>
                    <Progress value={(stats.contactStats.contactsBySource.phone / stats.contactStats.totalContacts) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Referencias</span>
                      <span className="text-sm font-medium">{stats.contactStats.contactsBySource.referral}</span>
                    </div>
                    <Progress value={(stats.contactStats.contactsBySource.referral / stats.contactStats.totalContacts) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Segmentación de Contactos
                </CardTitle>
                <CardDescription>
                  Clasificación y tipo de contactos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{stats.contactStats.segmentation.newClients}</div>
                      <div className="text-xs text-muted-foreground">Nuevos Clientes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{stats.contactStats.segmentation.returningClients}</div>
                      <div className="text-xs text-muted-foreground">Clientes Recurrentes</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{stats.contactStats.segmentation.prospects}</div>
                      <div className="text-xs text-muted-foreground">Prospectos</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{stats.contactStats.segmentation.leads}</div>
                      <div className="text-xs text-muted-foreground">Leads</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preferencias de comunicación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Preferencias de Comunicación
              </CardTitle>
              <CardDescription>
                Canales preferidos por los contactos para recibir comunicaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="text-center space-y-2">
                  <div className="mx-auto p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg w-fit">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-lg font-bold text-purple-600">{stats.contactStats.communicationPreferences.email}</div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <Progress value={(stats.contactStats.communicationPreferences.email / stats.contactStats.totalContacts) * 100} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <div className="mx-auto p-3 bg-green-50 dark:bg-green-950/20 rounded-lg w-fit">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-lg font-bold text-green-600">{stats.contactStats.communicationPreferences.whatsapp}</div>
                  <div className="text-sm text-muted-foreground">WhatsApp</div>
                  <Progress value={(stats.contactStats.communicationPreferences.whatsapp / stats.contactStats.totalContacts) * 100} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <div className="mx-auto p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg w-fit">
                    <Phone className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-lg font-bold text-orange-600">{stats.contactStats.communicationPreferences.phone}</div>
                  <div className="text-sm text-muted-foreground">Teléfono</div>
                  <Progress value={(stats.contactStats.communicationPreferences.phone / stats.contactStats.totalContacts) * 100} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <div className="mx-auto p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg w-fit">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-blue-600">{stats.contactStats.communicationPreferences.sms}</div>
                  <div className="text-sm text-muted-foreground">SMS</div>
                  <Progress value={(stats.contactStats.communicationPreferences.sms / stats.contactStats.totalContacts) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {/* Estadísticas operativas de servicios */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.aiMetrics.assistantInteractions}</div>
                    <p className="text-sm text-muted-foreground">Interacciones IA</p>
                  </div>
                  <Bot className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precisión: {stats.aiMetrics.accuracy}%</span>
                    <span>Resueltas automáticamente: {stats.aiMetrics.automatedResolutions}</span>
                  </div>
                  <Progress value={stats.aiMetrics.accuracy} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.appointmentStats.completed}/{stats.appointmentStats.scheduled}</div>
                    <p className="text-sm text-muted-foreground">Citas Completadas</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Canceladas: {stats.appointmentStats.cancelled}</span>
                    <span>Reagendadas: {stats.appointmentStats.rescheduled}</span>
                  </div>
                  <Progress value={(stats.appointmentStats.completed / stats.appointmentStats.scheduled) * 100} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.dataCollection.totalInteractions}</div>
                    <p className="text-sm text-muted-foreground">Interacciones Totales</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Datos únicos: {stats.dataCollection.uniqueDataPoints}</span>
                    <span>Contactos: {stats.dataCollection.contactsGenerated}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{stats.systemHealth.uptime}%</div>
                    <p className="text-sm text-muted-foreground">Tiempo Activo</p>
                  </div>
                  <Server className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Latencia: {stats.systemHealth.avgLatency}ms</span>
                    <span>Errores: {stats.systemHealth.errorRate}%</span>
                  </div>
                  <Progress value={stats.systemHealth.uptime} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rendimiento por canal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Rendimiento Operativo por Canal
              </CardTitle>
              <CardDescription>
                Efectividad y métricas de cada canal de comunicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Canal Web */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h4 className="font-medium">Canal Web</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Conversiones</span>
                      <span className="font-medium">
                        {stats.channelData.web && 'conversions' in stats.channelData.web ? stats.channelData.web.conversions : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tiempo promedio</span>
                      <span className="font-medium">
                        {stats.channelData.web && 'avgSessionTime' in stats.channelData.web ? stats.channelData.web.avgSessionTime : 'N/A'}min
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Satisfacción</span>
                      <span className="font-medium text-green-600">
                        {stats.channelData.web && 'customerSatisfaction' in stats.channelData.web ? stats.channelData.web.customerSatisfaction : 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Canal WhatsApp */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium">WhatsApp</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mensajes enviados</span>
                      <span className="font-medium">
                        {stats.channelData.whatsapp && 'messagesSent' in stats.channelData.whatsapp ? stats.channelData.whatsapp.messagesSent : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tasa de apertura</span>
                      <span className="font-medium">
                        {stats.channelData.whatsapp && 'openRate' in stats.channelData.whatsapp ? stats.channelData.whatsapp.openRate : 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Respuestas</span>
                      <span className="font-medium text-blue-600">
                        {stats.channelData.whatsapp && 'responses' in stats.channelData.whatsapp ? stats.channelData.whatsapp.responses : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Canal Email */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <h4 className="font-medium">Email</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Emails procesados</span>
                      <span className="font-medium">
                        {stats.channelData.email && 'processed' in stats.channelData.email ? stats.channelData.email.processed : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Entregabilidad</span>
                      <span className="font-medium">
                        {stats.channelData.email && 'deliverabilityRate' in stats.channelData.email ? stats.channelData.email.deliverabilityRate : 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Engagement</span>
                      <span className="font-medium text-purple-600">
                        {stats.channelData.email && 'engagementRate' in stats.channelData.email ? stats.channelData.email.engagementRate : 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de automatización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Estado de Automatización del Sistema
              </CardTitle>
              <CardDescription>
                Nivel de automatización y eficiencia operativa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Automatización de Citas</span>
                      <span className="font-bold">{stats.aiMetrics.automationLevel}%</span>
                    </div>
                    <Progress value={stats.aiMetrics.automationLevel} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Respuestas Automáticas</span>
                      <span className="font-bold">{stats.aiMetrics.automatedResponses}</span>
                    </div>
                    <Progress value={(stats.aiMetrics.automatedResponses / stats.aiMetrics.assistantInteractions) * 100} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Eficiencia de Recordatorios</span>
                      <span className="font-bold">{stats.reminders.responseRate}%</span>
                    </div>
                    <Progress value={stats.reminders.responseRate} className="h-3" />
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {Math.round((stats.aiMetrics.automationLevel + stats.reminders.responseRate + stats.systemHealth.uptime) / 3)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Eficiencia General del Sistema</p>
                    <div className="mt-4 text-xs text-muted-foreground">
                      {stats.aiMetrics.automatedResolutions} tareas automatizadas hoy
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
