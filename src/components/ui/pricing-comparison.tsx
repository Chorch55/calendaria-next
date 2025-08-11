"use client";

import { CheckCircle, X } from 'lucide-react';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface Feature {
  name: string;
  individual: string | boolean | number;
  professional: string | boolean | number;
  enterprise: string | boolean | number;
  isAddOn?: boolean;
  addOnPrice?: {
    individual?: string;
    professional?: string;
    enterprise?: string;
  };
}

const features: Feature[] = [
  // Características base que todos tienen
  {
    name: "Reserva de citas online y gestiona tu calendario",
    individual: true,
    professional: true,
    enterprise: true,
  },
  {
    name: "Bot de Email (Responde a tus clientes y les concierta citas por Email)",
    individual: true,
    professional: true,
    enterprise: true,
  },
  {
    name: "Bot de WhatsApp Responde a tus clientes y les concierta citas por WhatsApp)",
    individual: true,
    professional: true,
    enterprise: true,
  },
  {
    name: "Gestión de contactos",
    individual: true,
    professional: true,
    enterprise: true,
  },
  {
    name: "Bandeja unificada WhatsApp, Email, SMS",
    individual: true,
    professional: true,
    enterprise: true,
  },
  // Capacidad y escalabilidad
  {
    name: "Usuarios",
    individual: "1",
    professional: "20",
    enterprise: "50",
  },
  {
    name: "Añade usuarios",
    individual: "5 usuarios + 7,99€",
    professional: "5 usuarios + 6,99€ ",
    enterprise: "5 usuarios + 5,99€",
    isAddOn: true
  },
  // Características diferenciadoras profesional/enterprise
  {
    name: "Bot de llamadas (Contesta a tus clientes como un humano y les concierta citas telefónicas)",
    individual: false,
    professional: true,
    enterprise: true,
    isAddOn: true,
    addOnPrice: {
      individual: "10€",
    }
  },
  {
    name: "Transferencia de llamadas a humanos",
    individual: false,
    professional: true,
    enterprise: true,
  },
  // Características de valor añadido
  {
    name: "Recordatorios",
    individual: "50 MENSAJES",
    professional: "200 MENSAJES",
    enterprise: "1000 MENSAJES",
    addOnPrice: {
      individual: "0.05€/U",
      professional: "0.03€/U",
      enterprise: "0.015€/U"
    }
  },
  {
    name: "Multilingüismo",
    individual: "ES\n5€ POR IDIOMA: EN, FR, GE, POR, IT, AR\n+15€ TODOS (PACK)",
    professional: "ES/EN\n4€ POR IDIOMA: EN, FR, GE, POR, IT, AR\n+10€ TODOS (PACK)",
    enterprise: "ES/EN/FR/GE/POR/IT/AR",
    isAddOn: true
  },
  // Características premium (Enterprise)
  {
    name: "Grabación llamadas",
    individual: false,
    professional: false,
    enterprise: true,
    isAddOn: true,
    addOnPrice: {
      individual: "15€",
      professional: "10€",
    }
  },
  {
    name: "IA chat integrable personalizada",
    individual: false,
    professional: false,
    enterprise: true,
    isAddOn: true,
    addOnPrice: {
      individual: "10€",
      professional: "5€",
    }
  },
  {
    name: "Gestión de personal (Registro de horarios, vacaciones y ausencias)",
    individual: false,
    professional: false,
    enterprise: true,
    isAddOn: true,
    addOnPrice: {
      individual: "20€",
      professional: "20€",
    }
  },
  {
    name: "Gestión de tareas (Distribuye las tareas entre el equipo)",
    individual: false,
    professional: false,
    enterprise: true,
    isAddOn: true,
    addOnPrice: {
      individual: "",
      professional: "20€",
    }
  },
 
  {
    name: "Estadísticas de personal y monitoreo en tiempo real (Gestiona el rendimiento del equipo)",
    individual: false,
    professional: false,
    enterprise: true,
    isAddOn: true,
    addOnPrice: {
      individual: "",
      professional: "25€",
    }
  },
 {
    name: "Estadísticas análisis avanzado llamadas (Analiza mejor a tu perfil de clientes, palabras clave, etc.)",
    individual: false,
    professional: false,
    enterprise: true,
    isAddOn: true,
    addOnPrice: {
      individual: "",
      professional: "25€",
    }
  },
    // Soporte y atención
  {
    name: "Atención al cliente",
    individual: "MAIL",
    professional: "WHATSAPP, MAIL",
    enterprise: "TELEFÓNICA, WHATSAPP, MAIL",
  },
];

export function PricingComparison() {
  const { t } = useTranslation();
  return (
    <div className="w-full overflow-x-auto">
      <Card className="border border-t-0 rounded-xl shadow-sm overflow-hidden">
        <div className="min-w-[860px]">
          {/* Plans Header - Fixed */}
          <div className="grid grid-cols-4 bg-primary text-primary-foreground p-4 rounded-t-xl">
            <div></div>
            <div className="font-bold text-center text-lg">Individual</div>
            <div className="font-bold text-center text-lg flex items-center justify-center gap-2">
              <span>Profesional</span>
              <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-primary-foreground/20 text-primary-foreground/90 border border-primary-foreground/30">
                {t('home_plan_most_popular')}
              </span>
            </div>
            <div className="font-bold text-center text-lg">Enterprise</div>
          </div>
          {/* Pricing Row */}
          <div className="grid grid-cols-4 bg-muted/50 p-5 border-b">
            <div className="font-semibold text-sm">Características</div>
            <div className="font-semibold text-sm text-center">19€/mes</div>
            <div className="font-semibold text-sm text-center">99€/mes</div>
            <div className="font-semibold text-sm text-center">299€/mes</div>
          </div>

          {/* Features */}
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "grid grid-cols-4 py-4 px-5 bg-card border-b",
                index % 2 === 0 ? "bg-muted/20" : "bg-card"
              )}
            >
              <div className="flex flex-col justify-center">
                {feature.name.includes("(") ? (
                  <>
                    <span className="font-medium">{feature.name.split("(")[0].trim()}</span>
                    <span className="text-sm text-muted-foreground">({feature.name.split("(")[1]}</span>
                  </>
                ) : (
                  <span className="font-medium">{feature.name}</span>
                )}
                {feature.isAddOn && (
                  <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-xs font-medium">
                    Add-on
                  </span>
                )}
              </div>

      {["individual", "professional", "enterprise"].map((plan) => (
                <div
                  key={plan}
                  className={cn(
        "flex flex-col items-center justify-center text-center px-2",
        plan === "professional" ? "bg-primary/5 rounded-md ring-1 ring-primary/20" : ""
                  )}
                >
                  {(() => {
                    const value = feature[plan as keyof typeof feature];
                    if (typeof value === "boolean") {
                      return value ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      );
                    }
                    return (
                      <div className="flex flex-col gap-0.5">
                        {String(value).split('\n').map((line, i) => (
                          <span key={i} className={i === 1 ? "text-sm text-muted-foreground" : ""}>
                            {line}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                  {feature.addOnPrice && feature.addOnPrice[plan as keyof typeof feature.addOnPrice] && (
                    <span className="text-xs text-muted-foreground mt-1">
                      +{feature.addOnPrice[plan as keyof typeof feature.addOnPrice]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
