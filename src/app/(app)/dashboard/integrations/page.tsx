export default function IntegrationsPage() {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight whitespace-nowrap">Integraciones</h1>
      </div>
      <p className="text-muted-foreground">
        Conecta CalendarIA con tus herramientas favoritas
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Integraciones Activas</h3>
          <p className="text-2xl font-bold text-primary">8</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Disponibles</h3>
          <p className="text-2xl font-bold text-primary">25</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Datos Sincronizados</h3>
          <p className="text-2xl font-bold text-primary">1.2K</p>
        </div>
      </div>
    </div>
  );
}
