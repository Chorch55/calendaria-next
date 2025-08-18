export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analíticas</h1>
        <p className="text-muted-foreground">
          Obtén insights valiosos sobre el rendimiento de tu negocio
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Citas Este Mes</h3>
          <p className="text-2xl font-bold text-primary">234</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Tasa de Conversión</h3>
          <p className="text-2xl font-bold text-primary">78%</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Satisfacción Cliente</h3>
          <p className="text-2xl font-bold text-primary">4.8/5</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Ingresos</h3>
          <p className="text-2xl font-bold text-primary">€24.5K</p>
        </div>
      </div>
    </div>
  );
}
