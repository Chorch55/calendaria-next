'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Calendar, 
  Settings, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  MoreVertical,
  Eye,
  EyeOff,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Tipos de notificaciones
interface Notification {
  id: string;
  type: 'appointment' | 'reminder' | 'system' | 'calendar';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Datos de ejemplo
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'Nueva cita agendada',
    description: 'Juan Pérez ha agendado una cita para mañana a las 10:00',
    time: 'Hace 5 minutos',
    isRead: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Recordatorio de llamada',
    description: 'Llamada programada con María González en 15 minutos',
    time: 'Hace 10 minutos',
    isRead: false,
    priority: 'high'
  },
  {
    id: '3',
    type: 'system',
    title: 'Informe mensual generado',
    description: 'El informe de analytics de julio está listo para descargar',
    time: 'Hace 2 horas',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '4',
    type: 'calendar',
    title: 'Evento próximo',
    description: 'Reunión de equipo programada para las 14:00',
    time: 'Hace 3 horas',
    isRead: false,
    priority: 'medium'
  },
  {
    id: '5',
    type: 'system',
    title: 'Actualización disponible',
    description: 'Nueva versión de la aplicación disponible para instalar',
    time: 'Hace 1 día',
    isRead: true,
    priority: 'low'
  },
  {
    id: '6',
    type: 'appointment',
    title: 'Cita cancelada',
    description: 'La cita con Carlos Ruiz ha sido cancelada',
    time: 'Hace 2 días',
    isRead: false,
    priority: 'medium'
  }
];

type FilterType = 'all' | 'unread' | 'today' | 'week' | 'settings';

// Filtros avanzados
interface AdvancedFilters {
  dateRange: string;
  notificationType: string;
  priority: string;
  readStatus: string;
  source: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    dateRange: 'all',
    notificationType: 'all',
    priority: 'all',
    readStatus: 'all',
    source: 'all'
  });

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    // Filtros básicos (botones superiores)
    let passesBasicFilter = true;
    switch (activeFilter) {
      case 'unread':
        passesBasicFilter = !notification.isRead;
        break;
      case 'today':
        passesBasicFilter = notification.time.includes('minutos') || notification.time.includes('horas');
        break;
      case 'week':
        passesBasicFilter = notification.time.includes('día') || notification.time.includes('minutos') || notification.time.includes('horas');
        break;
      case 'settings':
        passesBasicFilter = notification.type === 'system';
        break;
      default:
        passesBasicFilter = true;
    }

    // Filtros avanzados
    let passesAdvancedFilters = true;

    // Filtro por rango de fecha
    if (advancedFilters.dateRange !== 'all') {
      switch (advancedFilters.dateRange) {
        case 'last-hour':
          passesAdvancedFilters = passesAdvancedFilters && notification.time.includes('minutos');
          break;
        case 'last-24h':
          passesAdvancedFilters = passesAdvancedFilters && (notification.time.includes('minutos') || notification.time.includes('horas'));
          break;
        case 'last-week':
          passesAdvancedFilters = passesAdvancedFilters && (notification.time.includes('minutos') || notification.time.includes('horas') || notification.time.includes('día'));
          break;
        case 'older':
          passesAdvancedFilters = passesAdvancedFilters && notification.time.includes('día');
          break;
      }
    }

    // Filtro por tipo de notificación
    if (advancedFilters.notificationType !== 'all') {
      passesAdvancedFilters = passesAdvancedFilters && notification.type === advancedFilters.notificationType;
    }

    // Filtro por prioridad
    if (advancedFilters.priority !== 'all') {
      passesAdvancedFilters = passesAdvancedFilters && notification.priority === advancedFilters.priority;
    }

    // Filtro por estado de lectura
    if (advancedFilters.readStatus !== 'all') {
      if (advancedFilters.readStatus === 'read') {
        passesAdvancedFilters = passesAdvancedFilters && notification.isRead;
      } else if (advancedFilters.readStatus === 'unread') {
        passesAdvancedFilters = passesAdvancedFilters && !notification.isRead;
      }
    }

    // Filtro por fuente/origen
    if (advancedFilters.source !== 'all') {
      switch (advancedFilters.source) {
        case 'calendar-events':
          passesAdvancedFilters = passesAdvancedFilters && (notification.type === 'calendar' || notification.type === 'appointment');
          break;
        case 'system-alerts':
          passesAdvancedFilters = passesAdvancedFilters && notification.type === 'system';
          break;
        case 'user-actions':
          passesAdvancedFilters = passesAdvancedFilters && notification.type === 'reminder';
          break;
      }
    }

    return passesBasicFilter && passesAdvancedFilters;
  });

  // Función para limpiar filtros avanzados
  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      dateRange: 'all',
      notificationType: 'all',
      priority: 'all',
      readStatus: 'all',
      source: 'all'
    });
  };

  // Verificar si hay filtros avanzados activos
  const hasActiveAdvancedFilters = Object.values(advancedFilters).some(value => value !== 'all');

  // Contar notificaciones por categoría
  const counts = {
    unread: notifications.filter(n => !n.isRead).length,
    today: notifications.filter(n => n.time.includes('minutos') || n.time.includes('horas')).length,
    week: notifications.filter(n => n.time.includes('día') || n.time.includes('minutos') || n.time.includes('horas')).length,
    settings: notifications.filter(n => n.type === 'system').length
  };

  // Marcar como leída
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Marcar como no leída
  const markAsUnread = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  // Eliminar notificación
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Eliminar todas las notificaciones
  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  // Obtener icono por tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      case 'calendar':
        return <Calendar className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground">
            Gestiona todas tus notificaciones y alertas en un solo lugar
          </p>
        </div>
      </div>
      
      {/* Panel principal con filtros */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Panel de filtros avanzados */}
        <div className="lg:col-span-1">
          <div className="h-full flex flex-col">
            <Card className="overflow-hidden flex-1">
              <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                          <Filter className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold leading-none">Filtrar Notificaciones</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">Personaliza tu vista</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasActiveAdvancedFilters && (
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            {Object.values(advancedFilters).filter(v => v !== 'all').length}
                          </Badge>
                        )}
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                  <CardContent className="pt-0 space-y-5 pb-6">
                    {/* Filtro por fecha */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Por Fecha
                      </label>
                      <Select 
                        value={advancedFilters.dateRange} 
                        onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, dateRange: value }))}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Seleccionar período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las fechas</SelectItem>
                          <SelectItem value="last-hour">Última hora</SelectItem>
                          <SelectItem value="last-24h">Últimas 24 horas</SelectItem>
                          <SelectItem value="last-week">Última semana</SelectItem>
                          <SelectItem value="older">Más antiguas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por tipo */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Bell className="h-3 w-3" />
                        Por Tipo
                      </label>
                      <Select 
                        value={advancedFilters.notificationType} 
                        onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, notificationType: value }))}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          <SelectItem value="appointment">📅 Citas</SelectItem>
                          <SelectItem value="reminder">⏰ Recordatorios</SelectItem>
                          <SelectItem value="calendar">📋 Calendario</SelectItem>
                          <SelectItem value="system">⚙️ Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por prioridad */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></span>
                        Por Urgencia
                      </label>
                      <Select 
                        value={advancedFilters.priority} 
                        onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las prioridades</SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Alta
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              Media
                            </div>
                          </SelectItem>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Baja
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por estado de lectura */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        Por Estado
                      </label>
                      <Select 
                        value={advancedFilters.readStatus} 
                        onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, readStatus: value }))}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="unread">👁️ Sin leer</SelectItem>
                          <SelectItem value="read">✓ Leídas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por origen */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Settings className="h-3 w-3" />
                        Por Origen
                      </label>
                      <Select 
                        value={advancedFilters.source} 
                        onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, source: value }))}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los orígenes</SelectItem>
                          <SelectItem value="calendar-events">📅 Eventos de calendario</SelectItem>
                          <SelectItem value="system-alerts">🔔 Alertas del sistema</SelectItem>
                          <SelectItem value="user-actions">👤 Acciones de usuario</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Botón para limpiar filtros */}
                    {hasActiveAdvancedFilters && (
                      <div className="pt-3 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={clearAdvancedFilters}
                          className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Limpiar todos los filtros
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
            
            {/* Espaciador para igualar altura cuando está cerrado */}
            {!showAdvancedFilters && (
              <div className="flex-1 min-h-[120px]"></div>
            )}
          </div>
        </div>

        {/* Filtros rápidos y botones de acción */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filtros rápidos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeFilter === 'unread' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveFilter('unread')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Sin Leer</h3>
                  <p className="text-xl font-bold text-primary ml-3">{counts.unread}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeFilter === 'today' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveFilter('today')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Hoy</h3>
                  <p className="text-xl font-bold text-primary ml-3">{counts.today}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeFilter === 'week' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveFilter('week')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Esta Semana</h3>
                  <p className="text-xl font-bold text-primary ml-3">{counts.week}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeFilter === 'settings' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveFilter('settings')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Sistema</h3>
                  <p className="text-xl font-bold text-primary ml-3">{counts.settings}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botones de acción global */}
          <div className="flex gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={counts.unread === 0}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Marcar todas como leídas?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Todas las notificaciones se marcarán como leídas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={markAllAsRead}>
                    Marcar todas como leídas
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={notifications.length === 0}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar todas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar todas las notificaciones?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminarán permanentemente todas las notificaciones.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllNotifications}>
                    Eliminar todas
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Botón para mostrar todas */}
      {activeFilter !== 'all' && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setActiveFilter('all')}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      )}

      {/* Lista de notificaciones filtradas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Notificaciones
            {activeFilter !== 'all' && (
              <Badge variant="secondary">
                {activeFilter === 'unread' && 'Sin leer'}
                {activeFilter === 'today' && 'Hoy'}
                {activeFilter === 'week' && 'Esta semana'}
                {activeFilter === 'settings' && 'Sistema'}
              </Badge>
            )}
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredNotifications.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay notificaciones en esta categoría</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-4 p-4 border rounded-lg transition-all hover:bg-muted/20 bg-card"
                >
                  <div className={`flex-shrink-0 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? '' : 'opacity-40'
                  }`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <h4 className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${!notification.isRead ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                      {notification.description}
                    </p>
                    <p className={`text-xs mt-2 ${!notification.isRead ? 'text-foreground/60' : 'text-muted-foreground'}`}>
                      {notification.time}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {notification.isRead ? (
                        <DropdownMenuItem onClick={() => markAsUnread(notification.id)}>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Marcar como no leída
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Marcar como leída
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => deleteNotification(notification.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
