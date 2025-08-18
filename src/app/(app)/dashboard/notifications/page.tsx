export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
        <p className="text-muted-foreground">
          Gestiona todas tus notificaciones y alertas en un solo lugar
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Sin Leer</h3>
          <p className="text-2xl font-bold text-primary">5</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Hoy</h3>
          <p className="text-2xl font-bold text-primary">12</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Esta Semana</h3>
          <p className="text-2xl font-bold text-primary">34</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Configuración</h3>
          <p className="text-2xl font-bold text-primary">8</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="text-xl font-semibold mb-4">Notificaciones Recientes</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <h4 className="font-medium">Nueva cita agendada</h4>
                <p className="text-sm text-muted-foreground">Juan Pérez ha agendado una cita para mañana a las 10:00</p>
                <p className="text-xs text-muted-foreground">Hace 5 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <h4 className="font-medium">Recordatorio de llamada</h4>
                <p className="text-sm text-muted-foreground">Llamada programada con María González en 15 minutos</p>
                <p className="text-xs text-muted-foreground">Hace 10 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg opacity-60">
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <div className="flex-1">
                <h4 className="font-medium">Informe mensual generado</h4>
                <p className="text-sm text-muted-foreground">El informe de analytics de julio está listo para descargar</p>
                <p className="text-xs text-muted-foreground">Hace 2 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
