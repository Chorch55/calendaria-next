export default function HRPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Módulo RR.HH.</h1>
        <p className="text-muted-foreground">
          Gestión integral de recursos humanos para tu empresa
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Empleados</h3>
          <p className="text-2xl font-bold text-primary">45</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Presentes Hoy</h3>
          <p className="text-2xl font-bold text-primary">42</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Vacaciones</h3>
          <p className="text-2xl font-bold text-primary">3</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Horas Este Mes</h3>
          <p className="text-2xl font-bold text-primary">1,240</p>
        </div>
      </div>
    </div>
  );
}
