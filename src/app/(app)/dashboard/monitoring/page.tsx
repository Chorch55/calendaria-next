export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Monitoreo en Tiempo Real</h1>
        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white rounded-full">
          PRO
        </span>
      </div>
      <p className="text-muted-foreground">
        Supervisa la actividad de tu equipo y sistema en tiempo real
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Usuarios Activos</h3>
          <p className="text-2xl font-bold text-green-500">28</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Llamadas en Curso</h3>
          <p className="text-2xl font-bold text-primary">5</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Carga del Sistema</h3>
          <p className="text-2xl font-bold text-yellow-500">45%</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Uptime</h3>
          <p className="text-2xl font-bold text-green-500">99.9%</p>
        </div>
      </div>
    </div>
  );
}
