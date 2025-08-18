export default function ArchivesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Archivos</h1>
        <p className="text-muted-foreground">
          Gestiona y accede a todos tus archivos almacenados
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Archivos Totales</h3>
          <p className="text-2xl font-bold text-primary">1,234</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Almacenamiento Usado</h3>
          <p className="text-2xl font-bold text-primary">4.2GB</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Grabaciones</h3>
          <p className="text-2xl font-bold text-primary">89</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Documentos</h3>
          <p className="text-2xl font-bold text-primary">345</p>
        </div>
      </div>
    </div>
  );
}
