export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Flujos de Trabajo</h1>
        <p className="text-muted-foreground">
          Automatiza tus procesos empresariales con flujos inteligentes
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Flujos Activos</h3>
          <p className="text-2xl font-bold text-primary">12</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Ejecutados Hoy</h3>
          <p className="text-2xl font-bold text-primary">89</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Tiempo Ahorrado</h3>
          <p className="text-2xl font-bold text-primary">4.2h</p>
        </div>
      </div>
    </div>
  );
}
