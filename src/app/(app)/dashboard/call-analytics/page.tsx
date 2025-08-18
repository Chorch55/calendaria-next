export default function CallAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Analíticas de Llamadas</h1>
        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white rounded-full">
          PRO
        </span>
      </div>
      <p className="text-muted-foreground">
        Análisis avanzado de sentimiento y rendimiento de llamadas
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Llamadas Analizadas</h3>
          <p className="text-2xl font-bold text-primary">156</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Sentimiento Positivo</h3>
          <p className="text-2xl font-bold text-green-500">82%</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Duración Promedio</h3>
          <p className="text-2xl font-bold text-primary">4:23</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Palabras Clave</h3>
          <p className="text-2xl font-bold text-primary">89</p>
        </div>
      </div>
    </div>
  );
}
