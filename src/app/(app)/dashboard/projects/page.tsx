export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
        <p className="text-muted-foreground">
          Organiza y gestiona todos tus proyectos en un solo lugar
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Proyectos Activos</h3>
          <p className="text-2xl font-bold text-primary">7</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Completados</h3>
          <p className="text-2xl font-bold text-primary">23</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">En Progreso</h3>
          <p className="text-2xl font-bold text-primary">15</p>
        </div>
      </div>
    </div>
  );
}
