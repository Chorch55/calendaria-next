'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Sparkles,
  ArrowRight,
  Check,
  Database,
  HardDrive
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

// Simulando el plan del usuario (esto debería venir de un contexto o hook)
const getCurrentPlan = () => 'ENTERPRISE' as 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

const addonsData = [
  {
    id: 'EXTRA_USERS',
    category: 'capacity',
    name: 'Usuarios adicionales',
    description: 'Amplía tu equipo con packs de 5 usuarios adicionales. Cada usuario incluye acceso completo a todas las funcionalidades de tu plan.',
    longDescription: 'Perfecto para equipos en crecimiento. Cada pack incluye 5 usuarios con acceso completo a calendarios, llamadas, chat y todas las herramientas de gestión.',
    icon: () => <span className="text-2xl">👤</span>,
    pricing: {
      BASIC: '+7.99€/pack',
      PREMIUM: '+6.99€/pack',
      ENTERPRISE: '+5.99€/pack'
    },
    isIncluded: false,
    features: ['5 usuarios adicionales', 'Acceso completo', 'Sin límites de uso', 'Soporte incluido'],
    link: '/dashboard/addons/users'
  },
  {
    id: 'EXTRA_STORAGE',
    category: 'capacity',
    name: 'Almacenamiento extra',
    description: 'Aumenta tu capacidad de almacenamiento para archivos, grabaciones y documentos.',
    longDescription: 'Almacena más grabaciones de llamadas, archivos de clientes y documentos sin preocuparte por el espacio.',
    icon: () => <span className="text-2xl">💾</span>,
    pricing: {
      BASIC: '+5€/GB',
      PREMIUM: '+4€/GB',
      ENTERPRISE: '+3€/GB'
    },
    isIncluded: false,
    features: ['1GB adicional', 'Backup automático', 'Acceso desde cualquier dispositivo', 'Sincronización en tiempo real'],
    link: '/dashboard/addons/storage'
  },
  {
    id: 'EXTRA_REMINDERS',
    category: 'capacity',
    name: 'Recordatorios extra',
    description: 'Envía más mensajes de recordatorio a tus clientes via WhatsApp, SMS y email.',
    longDescription: 'Mantén a tus clientes informados con recordatorios adicionales que reducen las cancelaciones.',
    icon: () => <span className="text-2xl">🔔</span>,
    pricing: {
      BASIC: '+0.05€/mensaje',
      PREMIUM: '+0.03€/mensaje',
      ENTERPRISE: '+0.015€/mensaje'
    },
    isIncluded: false,
    features: ['WhatsApp, SMS y Email', 'Programación automática', 'Plantillas personalizables', 'Estadísticas de entrega'],
    link: '/dashboard/addons/reminders'
  },
  {
    id: 'EXTRA_AUTOMATIONS',
    category: 'capacity',
    name: 'Automatizaciones extra',
    description: 'Crea más flujos de trabajo automatizados para optimizar tu negocio.',
    longDescription: 'Automatiza procesos complejos y ahorra tiempo con flujos de trabajo personalizados.',
    icon: () => <span className="text-2xl">⚡</span>,
    pricing: {
      BASIC: '+5€ (5.000 automations)',
      PREMIUM: '+4€ (5.000 automations)',
      ENTERPRISE: 'Ilimitadas'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    features: ['5.000 automatizaciones', 'Triggers personalizados', 'Integración con APIs', 'Condicionales avanzadas'],
    link: '/dashboard/addons/automations'
  },
  {
    id: 'CALL_BOT',
    category: 'features',
    name: 'Bot de llamadas',
    description: 'Contestador automático inteligente que atiende llamadas como un humano.',
    longDescription: 'Tu asistente virtual que nunca descansa. Atiende llamadas, agenda citas y deriva casos complejos.',
    icon: () => <span className="text-2xl">📞</span>,
    pricing: {
      BASIC: '+10€',
      PREMIUM: 'Incluido',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    features: ['Voz natural', 'Agendamiento automático', 'Múltiples idiomas', 'Aprendizaje continuo'],
    link: '/dashboard/addons/call-bot'
  },
  {
    id: 'CALL_TRANSFER',
    category: 'features',
    name: 'Transferencia de llamadas',
    description: 'Deriva llamadas complejas a operadores humanos cuando sea necesario.',
    longDescription: 'El bot identifica cuando necesita ayuda humana y transfiere la llamada al operador adecuado.',
    icon: () => <span className="text-2xl">🔄</span>,
    pricing: {
      BASIC: 'No disponible',
      PREMIUM: 'Incluido',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    getAvailable: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    features: ['Detección inteligente', 'Transferencia fluida', 'Historial de contexto', 'Múltiples operadores'],
    link: '/dashboard/addons/call-transfer'
  },
  {
    id: 'MULTILANGUAGE',
    category: 'features',
    name: 'Multilingüismo',
    description: 'Atiende a clientes en múltiples idiomas con soporte completo.',
    longDescription: 'Expande tu negocio globalmente con soporte nativo para 7 idiomas diferentes.',
    icon: () => <span className="text-2xl">🌍</span>,
    pricing: {
      BASIC: 'Pack: +15€ | Por idioma: +3€',
      PREMIUM: 'Pack: +10€ | Por idioma: +2€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    features: ['7 idiomas disponibles', 'Detección automática', 'Traducción en tiempo real', 'Plantillas localizadas'],
    link: '/dashboard/addons/languages'
  },
  {
    id: 'CALL_RECORDING',
    category: 'features',
    name: 'Grabación de llamadas',
    description: 'Graba y analiza todas las conversaciones para mejorar el servicio.',
    longDescription: 'Mejora la calidad del servicio con grabaciones automáticas y análisis de conversaciones.',
    icon: () => <span className="text-2xl">🎙️</span>,
    pricing: {
      BASIC: '+15€',
      PREMIUM: '+10€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    features: ['Grabación automática', 'Transcripción IA', 'Análisis de sentimientos', 'Búsqueda por keywords'],
    link: '/dashboard/addons/call-recording'
  },
  {
    id: 'CUSTOM_AI_CHAT',
    category: 'features',
    name: 'IA Chat personalizada',
    description: 'Widget de chat inteligente embebible en tu sitio web.',
    longDescription: 'Atiende a visitantes 24/7 con un chat bot personalizado que conoce tu negocio.',
    icon: () => <span className="text-2xl">🤖</span>,
    pricing: {
      BASIC: '+10€',
      PREMIUM: '+5€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    features: ['Widget personalizable', 'Integración web', 'Aprendizaje automático', 'Handoff a humanos'],
    link: '/dashboard/addons/ai-chat'
  },
  {
    id: 'STAFF_MANAGEMENT',
    category: 'business',
    name: 'Gestión de personal',
    description: 'Sistema completo de recursos humanos y control de horarios.',
    longDescription: 'Gestiona tu equipo eficientemente con herramientas de RR.HH. integradas.',
    icon: () => <span className="text-2xl">👥</span>,
    pricing: {
      BASIC: '+20€',
      PREMIUM: '+20€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    features: ['Control de horarios', 'Gestión de vacaciones', 'Evaluaciones de desempeño', 'Reportes de productividad'],
    link: '/dashboard/addons/staff'
  },
  {
    id: 'TASK_MANAGEMENT',
    category: 'business',
    name: 'Gestión de tareas',
    description: 'Sistema Kanban para organizar y distribuir tareas entre el equipo.',
    longDescription: 'Organiza proyectos y tareas con tableros Kanban visuales y seguimiento de progreso.',
    icon: () => <span className="text-2xl">📋</span>,
    pricing: {
      BASIC: 'No disponible',
      PREMIUM: '+20€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    getAvailable: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    features: ['Tableros Kanban', 'Asignación de tareas', 'Seguimiento de tiempo', 'Reportes de progreso'],
    link: '/dashboard/addons/tasks'
  },
  {
    id: 'REAL_TIME_STATS',
    category: 'business',
    name: 'Estadísticas en tiempo real',
    description: 'Dashboard en vivo con métricas de rendimiento y productividad.',
    longDescription: 'Monitorea el rendimiento de tu equipo y negocio con datos actualizados en tiempo real.',
    icon: () => <span className="text-2xl">📈</span>,
    pricing: {
      BASIC: 'No disponible',
      PREMIUM: '+25€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    getAvailable: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    features: ['Dashboard en vivo', 'Métricas personalizables', 'Alertas automáticas', 'Exportación de datos'],
    link: '/dashboard/addons/stats'
  },
  {
    id: 'ADVANCED_ANALYTICS',
    category: 'business',
    name: 'Analítica avanzada',
    description: 'Análisis profundo de llamadas, conversiones y rendimiento del negocio.',
    longDescription: 'Toma decisiones basadas en datos con análisis avanzados y predicciones IA.',
    icon: () => <span className="text-2xl">📊</span>,
    pricing: {
      BASIC: 'No disponible',
      PREMIUM: '+25€',
      ENTERPRISE: 'Incluido'
    },
    getIsIncluded: (plan: string) => plan === 'ENTERPRISE',
    getAvailable: (plan: string) => plan === 'PREMIUM' || plan === 'ENTERPRISE',
    features: ['Análisis predictivo', 'ROI tracking', 'Segmentación de clientes', 'Informes automáticos'],
    link: '/dashboard/addons/analytics'
  }
];

const categories = {
  capacity: { name: 'Capacidad', icon: () => <span className="text-2xl">⚡</span>, description: 'Amplía los límites de tu plan' },
  features: { name: 'Funcionalidades', icon: () => <span className="text-2xl">🚀</span>, description: 'Herramientas avanzadas para tu negocio' },
  business: { name: 'Gestión empresarial', icon: () => <span className="text-2xl">💼</span>, description: 'Soluciones para empresas en crecimiento' }
};

export default function AddonsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const currentPlan = getCurrentPlan();

  const filteredAddons = selectedCategory 
    ? addonsData.filter(addon => addon.category === selectedCategory)
    : addonsData;

  const getPricingDisplay = (addon: typeof addonsData[0]) => {
    const price = addon.pricing[currentPlan as keyof typeof addon.pricing];
    
    // Verificar si está incluido
    const isIncluded = addon.getIsIncluded ? addon.getIsIncluded(currentPlan) : addon.isIncluded;
    
    if (isIncluded) {
      return (
        <Badge variant="secondary" className="text-sm bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
          ✨ Incluido en tu plan
        </Badge>
      );
    }

    // Verificar disponibilidad
    const isAvailable = addon.getAvailable ? addon.getAvailable(currentPlan) : true;
    
    if (!isAvailable) {
      return (
        <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          No disponible en tu plan
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="text-sm bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-medium shadow-sm border-0">
        {price}
      </Badge>
    );
  };

  const getIcon = (IconComponent: React.ComponentType<{ className?: string }> | (() => React.ReactNode)) => {
    if (typeof IconComponent === 'function' && 'defaultProps' in IconComponent) {
      const Component = IconComponent as React.ComponentType<{ className?: string }>;
      return <Component className="h-8 w-8 text-primary" />;
    }
    if (typeof IconComponent === 'function') {
      return (IconComponent as () => React.ReactNode)();
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Logo />
            <Badge variant="default" className="text-xs bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-medium shadow-sm border-0">
              Add-ons
            </Badge>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Amplía las capacidades de tu plan <span className="font-semibold text-primary">{currentPlan}</span> con 
          funcionalidades adicionales diseñadas para hacer crecer tu negocio.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Todos los add-ons
        </Button>
        {Object.entries(categories).map(([categoryKey, category]) => (
          <Button
            key={categoryKey}
            variant={selectedCategory === categoryKey ? "default" : "outline"}
            onClick={() => setSelectedCategory(categoryKey)}
            className="flex items-center gap-2"
          >
            {category.icon()}
            {category.name}
          </Button>
        ))}
      </div>

      {/* Category Description */}
      {selectedCategory && (
        <div className="text-center">
          <p className="text-muted-foreground">
            {categories[selectedCategory as keyof typeof categories].description}
          </p>
        </div>
      )}

      {/* Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAddons.map((addon) => {
          const isIncluded = addon.getIsIncluded ? addon.getIsIncluded(currentPlan) : addon.isIncluded;
          const isAvailable = addon.getAvailable ? addon.getAvailable(currentPlan) : true;

          return (
            <Card 
              key={addon.id} 
              className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 flex flex-col h-full ${
                isIncluded ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20' : 
                !isAvailable ? 'opacity-60' : 'hover:border-primary/50'
              }`}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 w-fit">
                    {getIcon(addon.icon)}
                  </div>
                  {getPricingDisplay(addon)}
                </div>
                <div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {addon.name}
                  </CardTitle>
                  <CardDescription className="text-sm mt-2">
                    {addon.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground">
                  {addon.longDescription}
                </p>
                
                {/* Features */}
                <div className="space-y-2 flex-1">
                  <h4 className="text-sm font-semibold text-foreground">Incluye:</h4>
                  <ul className="space-y-1">
                    {addon.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button - Siempre al final */}
                <div className="pt-2 mt-auto">
                  {isIncluded ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Crown className="h-4 w-4 mr-2 text-amber-500" />
                      Ya incluido en tu plan
                    </Button>
                  ) : !isAvailable ? (
                    <Button variant="outline" className="w-full" disabled>
                      Upgrade plan para acceder
                    </Button>
                  ) : (
                    <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Link href={addon.link}>
                        Configurar
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          ¿Necesitas algo específico?
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Nuestro equipo puede ayudarte a configurar los add-ons perfectos para tu negocio
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/settings">
              Configurar add-ons
            </Link>
          </Button>
          <Button asChild>
            <Link href="/contact">
              Contactar soporte
            </Link>
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
