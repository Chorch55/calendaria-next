export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        <p className="text-muted-foreground">
          Gestiona las empresas y sus contactos asociados
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Empresas Activas</h3>
          <p className="text-2xl font-bold text-primary">24</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Contactos Totales</h3>
          <p className="text-2xl font-bold text-primary">156</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Nuevas Este Mes</h3>
          <p className="text-2xl font-bold text-primary">8</p>
        </div>
      </div>
    </div>
  );
}
