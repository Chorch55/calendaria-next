'use client';

import React, { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Bell, 
  Phone, 
  Zap, 
  Languages, 
  Mic, 
  Bot, 
  Briefcase, 
  CheckCircle2, 
  BarChart3, 
  Crown,
  ChevronRight,
  Plus,
  Sparkles,
  Database,
  HardDrive
} from 'lucide-react';
import Link from 'next/link';

interface AddonsDropdownProps {
  trigger?: React.ReactNode;
  align?: 'start' | 'end' | 'center';
}

// Simulando el plan del usuario (esto debería venir de un contexto o hook)
const getCurrentPlan = () => 'ENTERPRISE' as 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

const addonsData = [
  {
    id: 'EXTRA_USERS',
    category: 'capacity',
    name: 'Usuarios adicionales',
    description: 'Packs de 5 usuarios adicionales',
    icon: 'Users',
    pricing: {
      BASIC: '+7.99€/pack',
      PREMIUM: '+6.99€/pack',
      ENTERPRISE: '+5.99€/pack'
    },
    isIncluded: false,
    link: '/dashboard/addons/users'
  },
  {
    id: 'EXTRA_STORAGE',
    category: 'capacity',
    name: 'Almacenamiento extra',
    description: 'Espacio adicional para archivos',
    icon: 'Database',
    pricing: {
      BASIC: '+5€/GB',
      PREMIUM: '+4€/GB',
      ENTERPRISE: '+3€/GB'
    },
    isIncluded: false,
    link: '/dashboard/addons/storage'
  },
  {
    id: 'EXTRA_REMINDERS',
    category: 'capacity',
    name: 'Recordatorios extra',
    description: 'Mensajes adicionales de recordatorio',
    icon: 'Bell',
    pricing: {
      BASIC: '+0.05€/mensaje',
      PREMIUM: '+0.03€/mensaje',
      ENTERPRISE: '+0.015€/mensaje'
    },
    isIncluded: false,
    link: '/dashboard/addons/reminders'
  },
  {
    id: 'EXTRA_AUTOMATIONS',
    category: 'capacity',
    name: 'Automatizaciones extra',
    description: 'Flujos de trabajo adicionales',
    icon: 'Zap',
    pricing: {
      BASIC: '+5€ (5.000 automations)',
      PREMIUM: '+4€ (5.000 automations)',
      ENTERPRISE: 'Ilimitadas'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    link: '/dashboard/addons/automations'
  },
  {
    id: 'CALL_BOT',
    category: 'features',
    name: 'Bot de llamadas',
    description: 'Contestador automático inteligente',
    icon: 'Phone',
    pricing: {
      BASIC: '+10€',
      PREMIUM: 'Incluido',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    link: '/dashboard/addons/call-bot'
  },
  {
    id: 'CALL_TRANSFER',
    category: 'features',
    name: 'Transferencia de llamadas',
    description: 'Derivar llamadas a operadores humanos',
    icon: 'Zap',
    pricing: {
      BASIC: 'No disponible',
      PREMIUM: 'Incluido',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    getAvailable: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    link: '/dashboard/addons/call-transfer'
  },
  {
    id: 'MULTILANGUAGE',
    category: 'features',
    name: 'Multilingüismo',
    description: 'Soporte para múltiples idiomas',
    icon: 'Languages',
    pricing: {
      BASIC: 'Pack: +15€ | Por idioma: +3€',
      PREMIUM: 'Pack: +10€ | Por idioma: +2€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    link: '/dashboard/addons/languages'
  },
  {
    id: 'CALL_RECORDING',
    category: 'features',
    name: 'Grabación de llamadas',
    description: 'Graba y analiza conversaciones',
    icon: 'Mic',
    pricing: {
      BASIC: '+15€',
      PREMIUM: '+10€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    link: '/dashboard/addons/call-recording'
  },
  {
    id: 'CUSTOM_AI_CHAT',
    category: 'features',
    name: 'IA Chat personalizada',
    description: 'Widget embebible para tu sitio web',
    icon: 'Bot',
    pricing: {
      BASIC: '+10€',
      PREMIUM: '+5€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    link: '/dashboard/addons/ai-chat'
  },
  {
    id: 'STAFF_MANAGEMENT',
    category: 'business',
    name: 'Gestión de personal',
    description: 'Control de horarios y ausencias',
    icon: 'Briefcase',
    pricing: {
      BASIC: '+20€',
      PREMIUM: '+20€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    link: '/dashboard/addons/staff'
  },
  {
    id: 'TASK_MANAGEMENT',
    category: 'business',
    name: 'Gestión de tareas',
    description: 'Distribuye tareas entre el equipo',
    icon: 'CheckCircle2',
    pricing: {
      BASIC: 'No disponible',
      PREMIUM: '+20€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    getAvailable: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    link: '/dashboard/addons/tasks'
  },
  {
    id: 'REAL_TIME_STATS',
    category: 'business',
    name: 'Estadísticas en tiempo real',
    description: 'Monitoreo de personal y rendimiento',
    icon: 'BarChart3',
    pricing: {
      BASIC: 'No disponible',
      PREMIUM: '+25€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    getAvailable: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    link: '/dashboard/addons/stats'
  },
  {
    id: 'ADVANCED_ANALYTICS',
    category: 'business',
    name: 'Analítica avanzada',
    description: 'Análisis profundo de llamadas y conversiones',
    icon: 'BarChart3',
    pricing: {
      BASIC: 'No disponible',
      PREMIUM: '+25€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    getAvailable: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    link: '/dashboard/addons/analytics'
  }
];

const categories = {
  capacity: { name: 'Capacidad', icon: Users },
  features: { name: 'Funcionalidades', icon: Sparkles },
  business: { name: 'Gestión empresarial', icon: Crown }
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Bell,
  Phone,
  Zap,
  Languages,
  Mic,
  Bot,
  Briefcase,
  CheckCircle2,
  BarChart3,
  Database,
  HardDrive
};

export function AddonsDropdown({ trigger, align = 'end' }: AddonsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPlan = getCurrentPlan();

  const getAddonsByCategory = (category: string) => 
    addonsData.filter(addon => addon.category === category);

  const getPricingDisplay = (addon: typeof addonsData[0]) => {
    const price = addon.pricing[currentPlan as keyof typeof addon.pricing];
    
    // Verificar si está incluido
    const isIncluded = addon.getIsIncluded ? addon.getIsIncluded(currentPlan) : addon.isIncluded;
    
    if (isIncluded) {
      return (
        <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
          Incluido
        </Badge>
      );
    }

    // Verificar disponibilidad
    const isAvailable = addon.getAvailable ? addon.getAvailable(currentPlan) : true;
    
    if (!isAvailable) {
      return (
        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          No disponible
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="text-xs bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-medium shadow-sm border-0">
        {price}
      </Badge>
    );
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4 text-primary flex-shrink-0" /> : null;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger || (
          <Button variant="ghost" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Add-ons
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        className="w-96 p-0 max-h-[80vh] overflow-hidden flex flex-col z-[70]"
        side="right"
        sideOffset={8}
        onWheel={(e) => {
          // Solo permitir scroll dentro del dropdown de add-ons
          e.stopPropagation();
        }}
        onInteractOutside={(e) => {
          // Evitar que se cierre cuando se interactúa con el dropdown padre
          const target = e.target as Element;
          if (target?.closest('[data-radix-dropdown-content]')) {
            e.preventDefault();
          }
        }}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-sidebar-accent/10 to-sidebar-primary/5 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h3 className="font-semibold text-xl">Add-ons disponibles</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Amplía las capacidades de tu plan {currentPlan.toLowerCase()}
          </p>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Categorías */}
          {Object.entries(categories).map(([categoryKey, category]) => {
            const categoryAddons = getAddonsByCategory(categoryKey);
            
            return (
              <div key={categoryKey}>
                <DropdownMenuLabel className="px-0 pb-2 flex items-center gap-3 text-foreground font-semibold text-base">
                  <category.icon className="h-5 w-5 text-primary" />
                  {category.name}
                </DropdownMenuLabel>
                
                <div className="space-y-1">
                  {categoryAddons.map((addon) => {
                    return (
                      <DropdownMenuItem key={addon.id} asChild className="p-0 focus:bg-transparent hover:bg-transparent">
                        <Link 
                          href={addon.link} 
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 hover:shadow-sm"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {getIcon(addon.icon)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                {addon.name}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {addon.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {getPricingDisplay(addon)}
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground/70 transition-colors" />
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
                
                {categoryKey !== 'business' && <DropdownMenuSeparator className="my-2" />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/30 flex-shrink-0">
          <DropdownMenuItem asChild>
            <Link 
              href="/dashboard/addons" 
              className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors hover:bg-primary/10 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="h-4 w-4" />
              Ver todos los add-ons
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
