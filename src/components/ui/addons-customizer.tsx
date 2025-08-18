'use client';

import { Card } from './card';
import { AddonCard } from './addon-card';
import { Badge } from './badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';


interface AddonsCustomizerProps {
  includedUsers: number;
  includedStorage: number;
  includedApiCalls: number;
  onUpdateUsers: (value: number) => void;
  onUpdateStorage: (value: number) => void;
  onUpdateApiCalls: (value: number) => void;
  onUpdateApps: (apps: string[]) => void;
  selectedApps: string[];
  hasBranding: boolean;
  planKey?: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
}

const availableApps = [
  { id: 'gmail', name: 'Gmail', icon: '📧' },
  { id: 'outlook', name: 'Outlook', icon: '📨' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
  { id: 'sms', name: 'SMS', icon: '📱' }
];

export function AddonsCustomizer({
  includedUsers,
  includedStorage,
  includedApiCalls,
  onUpdateUsers,
  onUpdateStorage,
  onUpdateApiCalls,
  onUpdateApps,
  selectedApps,
  hasBranding,
  planKey = 'PREMIUM'
}: AddonsCustomizerProps) {
  const [config, setConfig] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/config/plans');
        if (res.ok) {
          const json = await res.json();
          if (mounted) setConfig(json);
        }
      } catch {}
    })();
    return () => { mounted = false };
  }, []);

  const addonPrice = (key: 'EXTRA_USERS' | 'EXTRA_STORAGE' | 'API_CALLS' | 'INTEGRATIONS', fallback: string) => {
    const price = config?.addonDisplay?.[key]?.monthlyByPlan?.[planKey];
    return price ?? fallback;
  };
  const addonUnit = (key: 'EXTRA_USERS' | 'EXTRA_STORAGE' | 'API_CALLS' | 'INTEGRATIONS', fallback: string) => {
    const unit = config?.addonDisplay?.[key]?.unit;
    return unit ?? fallback;
  };
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">
          Personaliza tus{" "}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Add-ons
          </span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Puedes ampliar usuarios, almacenamiento, API calls e integraciones. Branding personalizado opcional.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AddonCard
          title="Usuarios extra"
          description="Añade más asientos para tu equipo"
          value={0}
          onDecrease={() => {}}
          onIncrease={() => {}}
          price={addonPrice('EXTRA_USERS', '€6.99')}
          unit={addonUnit('EXTRA_USERS', 'pack (5 usuarios)')}
          includedAmount={`${includedUsers} usuarios`}
        />

        <AddonCard
          title="Almacenamiento extra"
          description="Espacio adicional para archivos"
          value={0}
          onDecrease={() => {}}
          onIncrease={() => {}}
          price={addonPrice('EXTRA_STORAGE', '€1')}
          unit={addonUnit('EXTRA_STORAGE', 'GB')}
          includedAmount={`${includedStorage} GB`}
        />

        <AddonCard
          title="Llamadas API extra"
          description="Más capacidad de uso mensual"
          value={0}
          onDecrease={() => {}}
          onIncrease={() => {}}
          price={addonPrice('API_CALLS', '€2')}
          unit={addonUnit('API_CALLS', '1000 calls')}
          includedAmount={`${includedApiCalls}k calls`}
        />

        <Card className="relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '0%' }}
            transition={{ duration: 0.5 }}
          />
          <div className="p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Aplicaciones</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecciona las apps que quieres conectar
                </p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">
                {addonPrice('INTEGRATIONS', '€9')}/{addonUnit('INTEGRATIONS', 'integración')}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {availableApps.map((app) => (
                <motion.button
                  key={app.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const newApps = selectedApps.includes(app.id)
                      ? selectedApps.filter(id => id !== app.id)
                      : [...selectedApps, app.id];
                    onUpdateApps(newApps);
                  }}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200",
                    selectedApps.includes(app.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-2xl mb-1">{app.icon}</div>
                  <div className="text-xs font-medium">{app.name}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Resumen</h3>
              <p className="text-sm text-muted-foreground mt-1">Tu configuración actual</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Incluido en tu plan</h4>
                <ul className="mt-2 space-y-2">
                  <li className="text-sm">• Usuarios incluidos: {includedUsers}</li>
                  <li className="text-sm">• Branding: {hasBranding ? 'Incluido' : 'No incluido'}</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Añadidos ahora</h4>
                <ul className="mt-2 space-y-2">
                  <li className="text-sm">• Usuarios extra: 0</li>
                  <li className="text-sm">• Almacenamiento extra: 0 GB</li>
                  <li className="text-sm">• API extra: 0 llamadas</li>
                  <li className="text-sm">• Apps conectadas: {selectedApps.length}</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span className="font-medium">Coste mensual estimado</span>
                <span className="font-semibold">€99.00</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Total</span>
                <span className="font-semibold text-lg">€99.00</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
