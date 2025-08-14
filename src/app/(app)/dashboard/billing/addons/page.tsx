'use client';

import { useState } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { AddonsCustomizer } from '@/components/ui/addons-customizer';
import { Steps } from '@/components/ui/steps';

export default function BillingAddonsPage() {
  const { subscription } = useSubscription();
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <Steps
          steps={[
            { title: 'Plan', description: 'Elige tu plan', completed: true },
            { title: 'Ciclo', description: 'Mensual o Anual', completed: true },
            { title: 'Add-ons', description: 'Personalizar Add-ons', active: true },
            { title: 'Pago', description: 'Método de pago' }
          ]}
        />
      </div>

      <AddonsCustomizer
        includedUsers={20}
        includedStorage={50}
        includedApiCalls={1000}
        onUpdateUsers={(value) => console.log('Users updated:', value)}
        onUpdateStorage={(value) => console.log('Storage updated:', value)}
        onUpdateApiCalls={(value) => console.log('API calls updated:', value)}
        onUpdateApps={setSelectedApps}
        selectedApps={selectedApps}
        hasBranding={true}
      />
    </div>
  );
}
