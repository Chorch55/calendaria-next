"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Phone, 
  User, 
  Clock, 
  Sparkles, 
  Star, 
  MessageCircleQuestion, 
  Download,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Play,
  Pause,
  Volume2,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  Users,
  DollarSign,
  Target,
  Activity,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/context/settings-context';
import { cn } from '@/lib/utils';

interface CallLog {
  id: string;
  callerName: string;
  callerNumber: string;
  timestamp: string;
  duration: string;
  type: 'incoming' | 'outgoing' | 'missed';
  status: 'answered' | 'missed' | 'voicemail' | 'busy';
  summary: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  sentimentScore: number;
  reasonForSentiment: string;
  appointmentScheduled: boolean;
  appointmentDetails?: string;
  keyQueries: string[];
  recordingUrl: string;
  transcript?: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  followUpRequired: boolean;
  clientId?: string;
  outcome: 'appointment' | 'information' | 'complaint' | 'followup' | 'other';
  cost: number;
  revenue?: number;
}

interface CallMetrics {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageDuration: string;
  totalDuration: string;
  positiveSentiment: number;
  appointmentsBooked: number;
  conversionRate: number;
  totalRevenue: number;
  avgCallCost: number;
}

const mockCallLogs: CallLog[] = [
  {
    id: 'call1',
    callerName: 'John Smith',
    callerNumber: '+1-202-555-0182',
    timestamp: '2024-09-06T11:45:00',
    duration: '8:32',
    type: 'incoming',
    status: 'answered',
    summary: 'John Smith called to schedule a follow-up consultation. An appointment was successfully booked for next Tuesday.',
    sentiment: 'Positive',
    sentimentScore: 85,
    reasonForSentiment: 'The caller was polite and expressed satisfaction with the ease of booking.',
    appointmentScheduled: true,
    appointmentDetails: 'Tuesday, June 11th at 2:00 PM',
    keyQueries: ['Can I book a follow-up?', 'Is next Tuesday available?'],
    recordingUrl: '/placeholder-audio.mp3',
    transcript: 'Hello, I would like to schedule a follow-up appointment...',
    tags: ['appointment', 'follow-up', 'returning-client'],
    priority: 'medium',
    followUpRequired: false,
    clientId: 'client_001',
    outcome: 'appointment',
    cost: 2.50,
    revenue: 150
  },
  {
    id: 'call2',
    callerName: 'Jane Doe',
    callerNumber: '+1-310-555-0145',
    timestamp: '2024-09-06T09:20:00',
    duration: '12:15',
    type: 'incoming',
    status: 'answered',
    summary: 'Jane Doe called with a question about her recent invoice. The query was resolved by clarifying the charges.',
    sentiment: 'Neutral',
    sentimentScore: 65,
    reasonForSentiment: 'The caller started with a concern but was satisfied with the explanation.',
    appointmentScheduled: false,
    keyQueries: ['Why is there an extra charge on my invoice?', 'Can you explain the "Service Fee"?'],
    recordingUrl: '/placeholder-audio.mp3',
    transcript: 'Hi, I have a question about my invoice...',
    tags: ['billing', 'question', 'resolved'],
    priority: 'low',
    followUpRequired: false,
    clientId: 'client_002',
    outcome: 'information',
    cost: 3.25
  },
  {
    id: 'call3',
    callerName: 'Mike Johnson',
    callerNumber: '+1-555-0123',
    timestamp: '2024-09-05T16:10:00',
    duration: '0:00',
    type: 'incoming',
    status: 'missed',
    summary: 'Missed call - caller did not leave voicemail.',
    sentiment: 'Neutral',
    sentimentScore: 50,
    reasonForSentiment: 'No interaction occurred.',
    appointmentScheduled: false,
    keyQueries: [],
    recordingUrl: '',
    tags: ['missed', 'no-voicemail'],
    priority: 'low',
    followUpRequired: true,
    outcome: 'other',
    cost: 0
  },
  {
    id: 'call4',
    callerName: 'Sarah Wilson',
    callerNumber: '+1-415-555-0199',
    timestamp: '2024-09-05T14:30:00',
    duration: '15:45',
    type: 'incoming',
    status: 'answered',
    summary: 'New client inquiry about services. Very interested in premium package. Appointment scheduled for consultation.',
    sentiment: 'Positive',
    sentimentScore: 92,
    reasonForSentiment: 'Caller was enthusiastic and expressed strong interest in our services.',
    appointmentScheduled: true,
    appointmentDetails: 'Friday, September 8th at 10:00 AM',
    keyQueries: ['What packages do you offer?', 'Can I schedule a consultation?', 'What are your rates?'],
    recordingUrl: '/placeholder-audio.mp3',
    transcript: 'Hello, I heard about your services and I\'m very interested...',
    tags: ['new-client', 'consultation', 'premium-package'],
    priority: 'high',
    followUpRequired: false,
    clientId: 'client_003',
    outcome: 'appointment',
    cost: 4.10,
    revenue: 500
  },
  {
    id: 'call5',
    callerName: 'Robert Brown',
    callerNumber: '+1-617-555-0177',
    timestamp: '2024-09-05T10:15:00',
    duration: '6:22',
    type: 'outgoing',
    status: 'answered',
    summary: 'Follow-up call to confirm appointment and provide additional information requested by client.',
    sentiment: 'Positive',
    sentimentScore: 78,
    reasonForSentiment: 'Client was appreciative of the follow-up and confirmed attendance.',
    appointmentScheduled: false,
    keyQueries: ['Confirmation needed', 'Additional documents'],
    recordingUrl: '/placeholder-audio.mp3',
    transcript: 'Hello Mr. Brown, this is a follow-up call regarding your appointment...',
    tags: ['follow-up', 'confirmation', 'outgoing'],
    priority: 'medium',
    followUpRequired: false,
    clientId: 'client_004',
    outcome: 'followup',
    cost: 1.75
  }
];

const calculateMetrics = (calls: CallLog[]): CallMetrics => {
  const totalCalls = calls.length;
  const answeredCalls = calls.filter(call => call.status === 'answered').length;
  const missedCalls = calls.filter(call => call.status === 'missed').length;
  
  const totalDurationMinutes = calls
    .filter(call => call.duration !== '0:00')
    .reduce((total, call) => {
      const [minutes, seconds] = call.duration.split(':').map(Number);
      return total + minutes + (seconds / 60);
    }, 0);
  
  const averageDuration = answeredCalls > 0 ? Math.round(totalDurationMinutes / answeredCalls) : 0;
  const positiveCalls = calls.filter(call => call.sentiment === 'Positive').length;
  const appointmentsBooked = calls.filter(call => call.appointmentScheduled).length;
  const totalRevenue = calls.reduce((sum, call) => sum + (call.revenue || 0), 0);
  const totalCost = calls.reduce((sum, call) => sum + call.cost, 0);
  
  return {
    totalCalls,
    answeredCalls,
    missedCalls,
    averageDuration: `${averageDuration}:${String(Math.round((totalDurationMinutes % 1) * 60)).padStart(2, '0')}`,
    totalDuration: `${Math.floor(totalDurationMinutes / 60)}h ${Math.round(totalDurationMinutes % 60)}m`,
    positiveSentiment: totalCalls > 0 ? Math.round((positiveCalls / totalCalls) * 100) : 0,
    appointmentsBooked,
    conversionRate: totalCalls > 0 ? Math.round((appointmentsBooked / totalCalls) * 100) : 0,
    totalRevenue,
    avgCallCost: totalCalls > 0 ? Math.round((totalCost / totalCalls) * 100) / 100 : 0
  };
};

export default function PhoneCallsPage() {
  const { connections, appSettings, isSettingsLoaded } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  if (!isSettingsLoaded) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Llamadas Telefónicas</h1>
        <p className="text-muted-foreground mt-1">Cargando configuración...</p>
      </div>
    );
  }

  if (!connections.phone.connected) {
    return (
       <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Llamadas Telefónicas</h1>
          <Card className="text-center py-12">
          <CardHeader>
            <Phone className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>Servicio Telefónico No Conectado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Por favor conecta tu número telefónico en configuración para ver los registros de llamadas.
            </p>
             <Button asChild variant="default" className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/dashboard/settings#connections">Ir a Configuración</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const metrics = calculateMetrics(mockCallLogs);

  // Filtrar llamadas
  const filteredCalls = mockCallLogs.filter(call => {
    const matchesSearch = call.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.callerNumber.includes(searchTerm) ||
                         call.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || call.type === typeFilter;
    const matchesSentiment = sentimentFilter === 'all' || call.sentiment.toLowerCase() === sentimentFilter;
    const matchesPriority = priorityFilter === 'all' || call.priority === priorityFilter;

    return matchesSearch && matchesType && matchesSentiment && matchesPriority;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const callDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (callDate.getTime() === today.getTime()) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (callDate.getTime() === today.getTime() - 86400000) {
      return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getCallTypeIcon = (type: string, status: string) => {
    if (status === 'missed') return <PhoneMissed className="h-4 w-4 text-red-500" />;
    if (type === 'incoming') return <PhoneIncoming className="h-4 w-4 text-green-500" />;
    if (type === 'outgoing') return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
    return <PhoneCall className="h-4 w-4 text-gray-500" />;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Llamadas Telefónicas</h1>
        <p className="text-muted-foreground mt-1">
          Gestión completa de llamadas con análisis de IA y métricas avanzadas
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="calls">Historial de Llamadas</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principales */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Llamadas</CardTitle>
                <PhoneCall className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalCalls}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.answeredCalls} respondidas, {metrics.missedCalls} perdidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageDuration}</div>
                <p className="text-xs text-muted-foreground">
                  Total: {metrics.totalDuration}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sentimiento Positivo</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.positiveSentiment}%</div>
                <p className="text-xs text-muted-foreground">
                  Satisfacción del cliente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{metrics.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.appointmentsBooked} citas agendadas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Métricas financieras */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Impacto Financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ingresos Generados</span>
                  <span className="text-lg font-bold text-green-600">€{metrics.totalRevenue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Costo Promedio por Llamada</span>
                  <span className="text-lg font-bold">€{metrics.avgCallCost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ROI</span>
                  <span className="text-lg font-bold text-green-600">
                    {metrics.avgCallCost > 0 ? Math.round((metrics.totalRevenue / (metrics.avgCallCost * metrics.totalCalls)) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCallLogs.slice(0, 3).map((call) => (
                    <div key={call.id} className="flex items-center gap-3 p-2 rounded-lg border">
                      {getCallTypeIcon(call.type, call.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{call.callerName}</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(call.timestamp)}</p>
                      </div>
                      <Badge className={getSentimentColor(call.sentiment)}>
                        {call.sentiment}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nombre, número o contenido..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Tipo de Llamada</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="incoming">Entrantes</SelectItem>
                      <SelectItem value="outgoing">Salientes</SelectItem>
                      <SelectItem value="missed">Perdidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sentimiento</Label>
                  <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="positive">Positivo</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Prioridad</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setSentimentFilter('all');
                      setPriorityFilter('all');
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de llamadas */}
          <div className="space-y-4">
            {filteredCalls.map((call) => (
              <Card key={call.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getCallTypeIcon(call.type, call.status)}
                      <div>
                        <CardTitle className="flex items-center text-lg">
                          <User className="mr-2 h-4 w-4 text-primary" /> 
                          {call.callerName}
                          {call.appointmentScheduled && (
                            <Badge variant="secondary" className="ml-2 font-normal">
                              Cita Agendada
                            </Badge>
                          )}
                          {call.followUpRequired && (
                            <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                              Seguimiento
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center text-sm mt-1">
                          <Phone className="mr-2 h-3 w-3" /> {call.callerNumber}
                          <span className="mx-2">|</span>
                          <Clock className="mr-2 h-3 w-3" /> {formatTimestamp(call.timestamp)}
                          <span className="mx-2">|</span>
                          <Timer className="mr-2 h-3 w-3" /> {call.duration}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSentimentColor(call.sentiment)}>
                        {call.sentiment}
                      </Badge>
                      <Badge className={getPriorityColor(call.priority)}>
                        {call.priority === 'high' ? 'Alta' : call.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm flex items-center mb-2">
                        <Sparkles className="h-4 w-4 mr-2 text-primary/80"/>
                        Resumen de IA
                      </h4>
                      <p className="text-sm text-muted-foreground">{call.summary}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm flex items-center mb-2">
                        <Star className="h-4 w-4 mr-2 text-primary/80"/>
                        Análisis de Sentimiento ({call.sentimentScore}%)
                      </h4>
                      <p className="text-sm text-muted-foreground">{call.reasonForSentiment}</p>
                    </div>
                  </div>

                  {call.appointmentScheduled && call.appointmentDetails && (
                    <div className="text-sm font-medium p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      Cita Programada: {call.appointmentDetails}
                    </div>
                  )}
                  
                  {call.keyQueries.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center">
                        <MessageCircleQuestion className="h-4 w-4 mr-2 text-primary/80"/>
                        Consultas Principales
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                        {call.keyQueries.map((query, index) => <li key={index}>{query}</li>)}
                      </ul>
                    </div>
                  )}

                  {call.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Etiquetas</h4>
                      <div className="flex flex-wrap gap-2">
                        {call.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {call.recordingUrl && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center">
                        <Volume2 className="h-4 w-4 mr-2" />
                        Grabación de Llamada
                      </h4>
                      <div className="flex items-center gap-3">
                        <audio controls className="w-full max-w-sm" src={call.recordingUrl}>
                          Su navegador no soporta el elemento de audio.
                        </audio>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2"/>
                          Descargar
                        </Button>
                        {call.transcript && (
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2"/>
                            Transcripción
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {(call.cost > 0 || call.revenue) && (
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-sm font-medium">Información Financiera:</span>
                      <div className="flex gap-4 text-sm">
                        <span>Costo: €{call.cost}</span>
                        {call.revenue && <span className="text-green-600">Ingresos: €{call.revenue}</span>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCalls.length === 0 && (
            <Card className="text-center py-12">
              <CardHeader>
                <Phone className="mx-auto h-12 w-12 text-muted-foreground" />
                <CardTitle>No se encontraron llamadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No hay llamadas que coincidan con los filtros seleccionados.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo de Llamada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <PhoneIncoming className="h-4 w-4 text-green-500" />
                      <span>Entrantes</span>
                    </div>
                    <span className="font-semibold">{mockCallLogs.filter(c => c.type === 'incoming').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                      <span>Salientes</span>
                    </div>
                    <span className="font-semibold">{mockCallLogs.filter(c => c.type === 'outgoing').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <PhoneMissed className="h-4 w-4 text-red-500" />
                      <span>Perdidas</span>
                    </div>
                    <span className="font-semibold">{mockCallLogs.filter(c => c.status === 'missed').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultados de Llamadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Citas Agendadas</span>
                    <span className="font-semibold text-green-600">
                      {mockCallLogs.filter(c => c.outcome === 'appointment').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Información Solicitada</span>
                    <span className="font-semibold">
                      {mockCallLogs.filter(c => c.outcome === 'information').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Seguimientos</span>
                    <span className="font-semibold">
                      {mockCallLogs.filter(c => c.outcome === 'followup').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Otras</span>
                    <span className="font-semibold">
                      {mockCallLogs.filter(c => c.outcome === 'other').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generador de Reportes</CardTitle>
              <CardDescription>
                Genera reportes personalizados de tus llamadas telefónicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Período</Label>
                  <Select defaultValue="last-month">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="yesterday">Ayer</SelectItem>
                      <SelectItem value="last-week">Última semana</SelectItem>
                      <SelectItem value="last-month">Último mes</SelectItem>
                      <SelectItem value="last-quarter">Último trimestre</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Reporte</Label>
                  <Select defaultValue="complete">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">Completo</SelectItem>
                      <SelectItem value="summary">Resumen</SelectItem>
                      <SelectItem value="financial">Financiero</SelectItem>
                      <SelectItem value="sentiment">Análisis de Sentimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Formato</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
