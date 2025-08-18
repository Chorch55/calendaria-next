import { Logo } from '@/components/logo';

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integraciones</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          Conecta <Logo className="h-4" /> con tus herramientas favoritas
        </p>
      </div>
      
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
